
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";

// POST /api/admin/subscriptions/[id]/override
// Manually override subscription status or plan
export async function POST(req: NextRequest, context: any) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await context.params;
    const body = await req.json();
    const { status, plan, cancelAtPeriodEnd } = body;

    const updateData: any = {};

    if (status && Object.values(SubscriptionStatus).includes(status)) {
      updateData.status = status;
    }

    if (plan && Object.values(SubscriptionPlan).includes(plan)) {
      updateData.plan = plan;
    }

    if (cancelAtPeriodEnd !== undefined) {
        // If true, set cancelAt to currentPeriodEnd
        // If false, clear cancelAt
        // This is simplified; real logic depends on current state
        if (cancelAtPeriodEnd) {
             const sub = await prisma.subscription.findUnique({ where: { id }, select: { currentPeriodEnd: true }});
             updateData.cancelAt = sub?.currentPeriodEnd || new Date();
        } else {
            updateData.cancelAt = null;
        }
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error("Error overriding subscription:", error);
    return NextResponse.json(
      { error: "Failed to override subscription" },
      { status: 500 }
    );
  }
}
