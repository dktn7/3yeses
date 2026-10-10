
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import Stripe from "stripe";

// POST /api/admin/financials/refunds
// Issue a refund against the original Stripe PaymentIntent.
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    // @ts-ignore
    const adminUser = authResult.user;

    const body = await req.json();
    const { transactionId, amount, reason } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    // 1. Fetch original transaction
    const originalTransaction = await prisma.financialTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!originalTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (originalTransaction.status === 'REFUNDED') {
         return NextResponse.json({ error: "Transaction already refunded" }, { status: 400 });
    }

    if (originalTransaction.type !== 'PAYMENT' || !originalTransaction.stripeId) {
      return NextResponse.json({ error: "Transaction has no refundable Stripe payment" }, { status: 400 });
    }

    const refundAmount = amount ?? originalTransaction.amount;
    if (!Number.isInteger(refundAmount) || refundAmount <= 0 || refundAmount > originalTransaction.amount) {
      return NextResponse.json({ error: "Refund amount must be a positive amount no greater than the original payment" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const existingRefunds = await stripe.refunds.list({ payment_intent: originalTransaction.stripeId, limit: 100 });
    const refundedAmount = existingRefunds.data
      .filter((item) => item.status !== 'failed' && item.status !== 'canceled')
      .reduce((sum, item) => sum + item.amount, 0);
    if (refundAmount > originalTransaction.amount - refundedAmount) {
      return NextResponse.json({ error: "Refund amount exceeds the remaining refundable balance" }, { status: 400 });
    }

    const refund = await stripe.refunds.create({
      payment_intent: originalTransaction.stripeId,
      amount: refundAmount,
      metadata: { originalTransactionId: originalTransaction.id },
    }, { idempotencyKey: `refund-${transactionId}-${refundAmount}` });

    const existingRefundTransaction = await prisma.financialTransaction.findFirst({
      where: { stripeId: refund.id, type: 'REFUND' },
    });
    if (existingRefundTransaction) {
      return NextResponse.json({ success: true, refund: existingRefundTransaction, duplicate: true });
    }

    // Record the refund only after Stripe confirms it.
    const refundTransaction = await prisma.financialTransaction.create({
      data: {
        userId: originalTransaction.userId,
        type: "REFUND",
        amount: refundAmount,
        currency: originalTransaction.currency,
        status: "COMPLETED",
        stripeId: refund.id,
        subscriptionId: originalTransaction.subscriptionId,
        paymentId: originalTransaction.paymentId,
        description: reason ? `Refund: ${reason}` : "Admin initiated refund",
        metadata: {
             originalTransactionId: originalTransaction.id,
             refundedBy: adminUser.userId // Corrected: user object from token usually has userId
        }
      },
    });

    await prisma.financialTransaction.update({
      where: { id: transactionId },
      data: { status: refundAmount === originalTransaction.amount ? "REFUNDED" : "COMPLETED" },
    });

    if (refundAmount === originalTransaction.amount && originalTransaction.paymentId) {
      await prisma.payment.update({
        where: { id: originalTransaction.paymentId },
        data: { status: "REFUNDED" },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: adminUser.userId,
        action: 'ADMIN_REFUND_PROCESSED',
        details: {
          transactionId: originalTransaction.id,
          refundId: refund.id,
          amount: refundAmount,
          reason: reason ?? null,
        },
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({ success: true, refund: refundTransaction });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
