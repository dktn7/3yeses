import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { calculateEndDate } from '@/lib/subscription-config';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata
        const userId = session.metadata?.userId;
        const duration = session.metadata?.duration as '6_months' | '12_months';
        const plan = session.metadata?.plan;

        if (!userId || !duration || !plan) {
          console.error('Missing metadata in checkout session');
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = calculateEndDate(startDate, duration);

        // Create subscription record
        await prisma.subscription.create({
          data: {
            userId,
            plan: 'STANDARD',
            status: 'ACTIVE',
            startDate,
            endDate,
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
            stripeCustomerId: session.customer as string,
          },
        });

        // Create payment record
        await prisma.payment.create({
          data: {
            userId,
            amount: session.amount_total || 0,
            currency: session.currency?.toUpperCase() || 'GBP',
            status: 'SUCCEEDED',
            stripePaymentIntentId: session.payment_intent as string,
            metadata: {
              sessionId: session.id,
              duration,
            },
          },
        });

        console.log('Subscription created for user:', userId);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment record if it exists
        await prisma.payment.updateMany({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'SUCCEEDED',
          },
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await prisma.payment.updateMany({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'FAILED',
          },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
