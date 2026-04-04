export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Create Stripe checkout session (recurring subscription)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/${locale}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale}/pricing`,
      metadata: {
        userId: decoded.userId,
        duration,
        plan: 'STANDARD',
      },
    });

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