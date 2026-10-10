export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { getPlanByDuration } from '@/lib/subscription-config';

const PRICE_IDS: Record<string, string> = {
  '6_months': process.env.STRIPE_PRICE_STANDARD_6M!,
  '12_months': process.env.STRIPE_PRICE_STANDARD_12M!,
};

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

    const { duration, locale = 'en-gb' } = await req.json();

    if (!duration || !['6_months', '12_months'].includes(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be 6_months or 12_months' },
        { status: 400 }
      );
    }

    const priceId = PRICE_IDS[duration];
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe Price ID not configured for duration: ${duration}` },
        { status: 500 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || process.env.NEXT_PUBLIC_APP_URL
      || 'http://localhost:3000';
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: decoded.userId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const blockedSubscription = await prisma.subscription.findFirst({
      where: {
        userId: decoded.userId,
        status: { in: ['PAST_DUE', 'UNPAID'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (blockedSubscription) {
      return NextResponse.json(
        {
          error: 'Your existing subscription needs attention before a new checkout can be started.',
          code: 'SUBSCRIPTION_REQUIRES_ACTION',
          status: blockedSubscription.status,
        },
        { status: 409 },
      );
    }

    const plan = getPlanByDuration(duration);
    const isExtension = Boolean(activeSubscription?.stripeCustomerId && activeSubscription.stripeSubscriptionId);
    // Protect against double-clicks and concurrent requests before the first
    // Checkout Session has reached the database/webhook.
    const idempotencyKey = `checkout-${decoded.userId}-${Math.floor(Date.now() / 300000)}`;

    if (activeSubscription && !isExtension) {
      return NextResponse.json(
        {
          error: 'Your account already has an active subscription. Use the billing portal to update it.',
          code: 'SUBSCRIPTION_ALREADY_ACTIVE',
        },
        { status: 409 },
      );
    }

    const session = isExtension
      ? await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          customer: activeSubscription!.stripeCustomerId!,
          invoice_creation: { enabled: true },
          line_items: [{
            price_data: {
              currency: 'gbp',
              unit_amount: plan.price,
              product_data: {
                name: `3YESES Standard Access extension - ${plan.durationLabel}`,
              },
            },
            quantity: 1,
          }],
          success_url: `${baseUrl}/${locale}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/${locale}/dashboard/subscription`,
          metadata: {
            userId: decoded.userId,
            duration,
            plan: 'STANDARD',
            extension: 'true',
            subscriptionId: activeSubscription!.id,
            stripeSubscriptionId: activeSubscription!.stripeSubscriptionId,
          },
        }, { idempotencyKey })
      : await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'subscription',
          customer_email: user.email,
          line_items: [{
            price: priceId,
            quantity: 1,
          }],
          success_url: `${baseUrl}/${locale}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/${locale}/pricing`,
          metadata: {
            userId: decoded.userId,
            duration,
            plan: 'STANDARD',
          },
        }, { idempotencyKey });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
