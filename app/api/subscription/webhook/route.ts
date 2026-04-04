import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/** Map Stripe subscription status → DB SubscriptionStatus */
function mapStripeStatus(status: Stripe.Subscription.Status): 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIALING' {
  switch (status) {
    case 'active': return 'ACTIVE';
    case 'trialing': return 'TRIALING';
    case 'past_due': return 'PAST_DUE';
    case 'unpaid': return 'UNPAID';
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
    default:
      return 'CANCELED';
  }
}

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
      // ── Checkout completed (subscription created via Checkout) ──────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const userId = session.metadata?.userId;
        const duration = session.metadata?.duration as '6_months' | '12_months' | undefined;

        if (!userId || !duration) {
          console.error('Missing metadata in checkout session', session.id);
          break;
        }

        // Retrieve the full Stripe subscription to get billing period info
        const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string) as any;

        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: stripeSub.id },
          create: {
            userId,
            plan: 'STANDARD',
            status: mapStripeStatus(stripeSub.status),
            startDate: new Date((stripeSub as any).start_date * 1000),
            currentPeriodStart: new Date((stripeSub as any).current_period_start * 1000),
            currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
            stripeSubscriptionId: stripeSub.id,
            stripeCustomerId: session.customer as string,
            stripePriceId: stripeSub.items.data[0]?.price.id,
          },
          update: {
            status: mapStripeStatus(stripeSub.status),
            currentPeriodStart: new Date((stripeSub as any).current_period_start * 1000),
            currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
            stripeCustomerId: session.customer as string,
          },
        });

        // Create a payment record for the invoice
        if (session.payment_intent) {
          await prisma.payment.create({
            data: {
              userId,
              amount: session.amount_total ?? 0,
              currency: (session.currency ?? 'gbp').toUpperCase(),
              status: 'SUCCEEDED',
              stripePaymentIntentId: session.payment_intent as string,
              description: `Standard Access — ${duration === '6_months' ? '6 months' : '12 months'}`,
              metadata: { sessionId: session.id, duration },
            },
          });
        }

        console.log('Subscription created/updated for user:', userId);
        break;
      }

      // ── Subscription renewed, updated, or status changed ────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: mapStripeStatus(sub.status as any),
            currentPeriodStart: new Date((sub as any).current_period_start * 1000),
            currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
            cancelAt: (sub as any).cancel_at ? new Date((sub as any).cancel_at * 1000) : null,
            canceledAt: (sub as any).canceled_at ? new Date((sub as any).canceled_at * 1000) : null,
          },
        });
        console.log('Subscription updated:', sub.id, sub.status);
        break;
      }

      // ── Subscription deleted / fully canceled ────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: 'CANCELED',
            canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : new Date(),
          },
        });
        console.log('Subscription canceled:', sub.id);
        break;
      }

      // ── Invoice paid (renewal payment) ──────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Only record renewal invoices (not the first — that's handled by checkout.session.completed)
        if ((invoice as any).billing_reason === 'subscription_cycle' && (invoice as any).subscription) {
          const sub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: (invoice as any).subscription as string },
          });
          if (sub && (invoice as any).payment_intent) {
            await prisma.payment.create({
              data: {
                userId: sub.userId,
                amount: (invoice as any).amount_paid,
                currency: ((invoice as any).currency ?? 'gbp').toUpperCase(),
                status: 'SUCCEEDED',
                stripePaymentIntentId: (invoice as any).payment_intent as string,
                stripeInvoiceId: (invoice as any).id,
                description: 'Standard Access — renewal',
                metadata: { invoiceId: (invoice as any).id },
              },
            });
          }
        }
        break;
      }

      // ── Invoice payment failed ────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: (invoice as any).subscription as string },
            data: { status: 'PAST_DUE' },
          });
        }
        console.warn('Invoice payment failed:', invoice.id);
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
