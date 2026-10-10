import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const prisma = getPrisma();

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: decoded.userId,
        stripeCustomerId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      select: { stripeCustomerId: true },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer is linked to this account' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const locale = typeof body.locale === 'string' ? body.locale : 'en-gb';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || process.env.NEXT_PUBLIC_APP_URL
      || 'http://localhost:3000';
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${baseUrl}/${locale}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal session error:', error);
    return NextResponse.json({ error: 'Unable to open payment settings' }, { status: 500 });
  }
}
