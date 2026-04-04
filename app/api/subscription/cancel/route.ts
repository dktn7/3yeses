export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: decoded.userId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel on Stripe (at period end to give access until paid-through date)
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      // DB will be updated to CANCELED via the webhook when the period ends.
      // Mark cancelAt immediately so the UI can reflect it.
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAt: subscription.currentPeriodEnd ?? undefined },
      });
    } else {
      // No Stripe sub (legacy / manual) — cancel immediately in DB
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Subscription will be canceled at the end of the current billing period.',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
