import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";

// GET /api/admin/financials/stats
// Aggregate financial statistics from real data
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenueResult,
      monthlyRevenueResult,
      lastMonthRevenueResult,
      totalRefunds,
      totalPayments,
      activeSubscriptions,
    ] = await Promise.all([
      // Total revenue (all completed payments)
      prisma.financialTransaction.aggregate({
        _sum: { amount: true },
        where: { type: "PAYMENT", status: "COMPLETED" },
      }),
      // This month's revenue
      prisma.financialTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: "PAYMENT",
          status: "COMPLETED",
          createdAt: { gte: startOfMonth },
        },
      }),
      // Last month's revenue (for comparison)
      prisma.financialTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: "PAYMENT",
          status: "COMPLETED",
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      // Total refunds
      prisma.financialTransaction.count({
        where: { type: "REFUND" },
      }),
      // Total payments
      prisma.financialTransaction.count({
        where: { type: "PAYMENT" },
      }),
      // Active subscriptions
      prisma.subscription.count({
        where: { status: "ACTIVE" },
      }),
    ]);

    const totalRevenue = (totalRevenueResult._sum.amount || 0) / 100; // Convert from pence
    const monthlyRevenue = (monthlyRevenueResult._sum.amount || 0) / 100;
    const lastMonthRevenue = (lastMonthRevenueResult._sum.amount || 0) / 100;
    const refundRate = totalPayments > 0 ? ((totalRefunds / totalPayments) * 100) : 0;
    const monthlyChange = lastMonthRevenue > 0
      ? (((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    return NextResponse.json({
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      monthlyChange: Math.round(monthlyChange * 10) / 10,
      refundRate: Math.round(refundRate * 10) / 10,
      totalRefunds,
      totalPayments,
      activeSubscriptions,
      currency: "gbp",
    });
  } catch (error) {
    console.error("Error fetching financial stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
