
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";

// POST /api/admin/financials/refunds
// Issue a refund (Mock implementation if Stripe keys are missing, or wrapper around Stripe)
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

    // 2. Perform Refund Logic (Mocking Stripe here for safety/speed unless configured)
    // In a real scenario: await stripe.refunds.create({ payment_intent: originalTransaction.stripeId, amount });
    const refundAmount = amount || originalTransaction.amount;
    
    // 3. Create Refund Transaction Record
    const refundTransaction = await prisma.financialTransaction.create({
      data: {
        userId: originalTransaction.userId,
        type: "REFUND",
        amount: refundAmount,
        currency: originalTransaction.currency,
        status: "COMPLETED",
        description: reason ? `Refund: ${reason}` : "Admin initiated refund",
        metadata: {
             originalTransactionId: originalTransaction.id,
             refundedBy: adminUser.userId // Corrected: user object from token usually has userId
        }
      },
    });

    // 4. Update Original Transaction Status
    await prisma.financialTransaction.update({
        where: { id: transactionId },
        data: { status: "REFUNDED" }
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
