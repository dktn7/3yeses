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

// Stripe exposes billing-period timestamps on subscription items in newer API versions.
function getPeriodDates(subscription: Stripe.Subscription) {
  const item = subscription.items?.data?.[0] as any;
  const start = (subscription as any).current_period_start ?? item?.current_period_start;
  const end = (subscription as any).current_period_end ?? item?.current_period_end;

  return {
    currentPeriodStart: start ? new Date(start * 1000) : null,
    currentPeriodEnd: end ? new Date(end * 1000) : null,
  };
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const value = (invoice as any).subscription
    ?? (invoice as any).parent?.subscription_details?.subscription;
  return typeof value === 'string' ? value : value?.id ?? null;
}

function getInvoicePaymentIntentId(invoice: Stripe.Invoice) {
  const value = (invoice as any).payment_intent;
  const legacy = typeof value === 'string' ? value : value?.id ?? null;
  if (legacy) return legacy;
  const payments = (invoice as any).payments?.data ?? [];
  const invoicePayment = payments.find((payment: any) => payment?.payment_intent);
  const current = invoicePayment?.payment_intent;
  return typeof current === 'string' ? current : current?.id ?? null;
}

async function recordPaymentWithLedger(
  prisma: ReturnType<typeof getPrisma>,
  input: {
    userId: string;
    amount: number;
    currency: string;
    status: 'SUCCEEDED' | 'FAILED';
    stripePaymentIntentId?: string | null;
    stripeInvoiceId?: string | null;
    description: string;
    metadata: Record<string, unknown>;
    subscriptionId?: string;
  },
) {
  const or = [
    input.stripePaymentIntentId ? { stripePaymentIntentId: input.stripePaymentIntentId } : null,
    input.stripeInvoiceId ? { stripeInvoiceId: input.stripeInvoiceId } : null,
    input.metadata.sessionId ? { metadata: { path: ['sessionId'], equals: input.metadata.sessionId } } : null,
  ].filter(Boolean) as any[];

  const existing = or.length
    ? await prisma.payment.findFirst({ where: { userId: input.userId, OR: or } })
    : null;

  const payment = existing
    ? await prisma.payment.update({
        where: { id: existing.id },
        data: {
          status: input.status,
          stripePaymentIntentId: input.stripePaymentIntentId ?? existing.stripePaymentIntentId,
          stripeInvoiceId: input.stripeInvoiceId ?? existing.stripeInvoiceId,
        },
      })
    : await prisma.payment.create({
        data: {
          userId: input.userId,
          amount: input.amount,
          currency: input.currency,
          status: input.status,
          stripePaymentIntentId: input.stripePaymentIntentId ?? null,
          stripeInvoiceId: input.stripeInvoiceId ?? null,
          description: input.description,
          metadata: input.metadata as any,
        },
      });

  const transaction = await prisma.financialTransaction.findFirst({
    where: { paymentId: payment.id, type: 'PAYMENT' },
  });
  if (transaction) {
    await prisma.financialTransaction.update({
      where: { id: transaction.id },
      data: { status: input.status === 'FAILED' ? 'FAILED' : 'COMPLETED' },
    });
  } else {
    await prisma.financialTransaction.create({
      data: {
        userId: input.userId,
        type: 'PAYMENT',
        amount: input.amount,
        currency: input.currency,
        status: input.status === 'FAILED' ? 'FAILED' : 'COMPLETED',
        subscriptionId: input.subscriptionId,
        paymentId: payment.id,
        stripeId: input.stripePaymentIntentId,
        invoiceId: input.stripeInvoiceId,
        description: input.description,
        metadata: input.metadata as any,
      },
    });
  }

  return { payment, wasExisting: Boolean(existing) };
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
    try {
      await prisma.stripeWebhookEvent.create({
        data: { eventId: event.id, type: event.type },
      });
    } catch (error: any) {
      // Stripe retries delivery. A unique event receipt makes the handler
      // idempotent across process restarts and concurrent deliveries.
      if (error?.code === 'P2002') {
        const previous = await prisma.stripeWebhookEvent.findUnique({ where: { eventId: event.id } });
        if (previous?.status === 'COMPLETED') {
          return NextResponse.json({ received: true, duplicate: true });
        }
        if (previous?.status === 'PROCESSING') {
          const staleAt = new Date(Date.now() - 5 * 60 * 1000);
          if (!previous.updatedAt || previous.updatedAt > staleAt) {
            return NextResponse.json({ received: false, processing: true }, { status: 409 });
          }
        }
        await prisma.stripeWebhookEvent.delete({ where: { eventId: event.id } });
        await prisma.stripeWebhookEvent.create({ data: { eventId: event.id, type: event.type } });
      } else {
        throw error;
      }
    }

    switch (event.type) {
      // ── Existing subscriber extension paid through Checkout ────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata ?? {};

        if (session.mode === 'payment' && metadata.extension === 'true') {
          if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
            console.warn('Extension checkout is not paid yet:', session.id, session.payment_status);
            break;
          }
          const subscription = await prisma.subscription.findFirst({
            where: {
              id: metadata.subscriptionId,
              userId: metadata.userId,
              status: { in: ['ACTIVE', 'TRIALING'] },
            },
          });

          if (!subscription) {
            console.error('Extension checkout references no active subscription', session.id);
            break;
          }

          const months = metadata.duration === '12_months' ? 12 : 6;
          const invoiceId = (session as any).invoice as string | null;
          const paymentIntentId = (session.payment_intent as string | null) ?? null;
          const existingPayment = await prisma.payment.findFirst({
            where: {
              userId: metadata.userId,
              OR: [
                ...(invoiceId ? [{ stripeInvoiceId: invoiceId }] : []),
                ...(paymentIntentId ? [{ stripePaymentIntentId: paymentIntentId }] : []),
                { metadata: { path: ['sessionId'], equals: session.id } },
              ],
            },
            select: { id: true },
          });

          // Stripe can deliver the same event more than once. Only the first
          // delivery may extend access; the payment/ledger write is also keyed
          // by the session/invoice/payment-intent identifiers.
          if (!existingPayment) {
            const paidThrough = subscription.currentPeriodEnd && subscription.currentPeriodEnd > new Date()
              ? subscription.currentPeriodEnd
              : new Date();
            const extendedPeriodEnd = addMonths(paidThrough, months);

            await prisma.$transaction(async (tx) => {
              const replay = await tx.payment.findFirst({
                where: {
                  userId: metadata.userId,
                  metadata: { path: ['sessionId'], equals: session.id },
                },
                select: { id: true },
              });
              if (replay) return;
              await tx.subscription.update({
                where: { id: subscription.id },
                data: { currentPeriodEnd: extendedPeriodEnd, cancelAt: null },
              });
              await recordPaymentWithLedger(tx as any, {
                userId: metadata.userId,
                amount: session.amount_total ?? 0,
                currency: ((session.currency ?? 'gbp') as string).toUpperCase(),
                status: 'SUCCEEDED',
                stripePaymentIntentId: paymentIntentId,
                stripeInvoiceId: invoiceId,
                description: `Standard Access extension - ${months} months`,
                metadata: { sessionId: session.id, duration: metadata.duration, extension: true },
                subscriptionId: subscription.id,
              });
            });
          }

          // The extension is a one-time payment. Stop the old recurring
          // cycle so stacking access cannot also create a future renewal.
          if (metadata.stripeSubscriptionId) {
            await stripe.subscriptions.update(metadata.stripeSubscriptionId, {
              cancel_at_period_end: true,
            });
          }

          console.log('Subscription extended for user:', metadata.userId);
          break;
        }

        if (session.mode !== 'subscription') break;

        const userId = metadata.userId;
        const duration = metadata.duration as '6_months' | '12_months' | undefined;

        if (!userId || !duration) {
          console.error('Missing metadata in checkout session', session.id);
          break;
        }

        const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string) as any;
        const period = getPeriodDates(stripeSub);

        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: stripeSub.id },
          create: {
            userId,
            plan: 'STANDARD',
            status: mapStripeStatus(stripeSub.status),
            startDate: new Date((stripeSub as any).start_date * 1000),
            currentPeriodStart: period.currentPeriodStart,
            currentPeriodEnd: period.currentPeriodEnd,
            stripeSubscriptionId: stripeSub.id,
            stripeCustomerId: session.customer as string,
            stripePriceId: stripeSub.items.data[0]?.price.id,
          },
          update: {
            status: mapStripeStatus(stripeSub.status),
            currentPeriodStart: period.currentPeriodStart,
            currentPeriodEnd: period.currentPeriodEnd,
            stripeCustomerId: session.customer as string,
          },
        });

        // Create a payment record for the initial invoice.
        if (session.payment_intent || (session as any).invoice) {
          const localSubscription = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: stripeSub.id } });
          await recordPaymentWithLedger(prisma, {
            userId,
            amount: session.amount_total ?? 0,
            currency: (session.currency ?? 'gbp').toUpperCase(),
            status: 'SUCCEEDED',
            stripePaymentIntentId: session.payment_intent as string | null,
            stripeInvoiceId: (session as any).invoice as string | null,
            description: `Standard Access - ${duration === '6_months' ? '6 months' : '12 months'}`,
            metadata: { sessionId: session.id, duration },
            subscriptionId: localSubscription?.id,
          });
        }

        console.log('Subscription created/updated for user:', userId);
        break;
      }

      // ── Checkout completed (subscription created via Checkout) ──────────
      // ── Subscription renewed, updated, or status changed ────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const period = getPeriodDates(sub);
        const existing = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: sub.id } });
        const preservedEnd = existing?.currentPeriodEnd && period.currentPeriodEnd
          ? (existing.currentPeriodEnd > period.currentPeriodEnd ? existing.currentPeriodEnd : period.currentPeriodEnd)
          : period.currentPeriodEnd;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: mapStripeStatus(sub.status as any),
            currentPeriodStart: period.currentPeriodStart,
            currentPeriodEnd: preservedEnd,
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
        const existing = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: sub.id } });
        if (existing?.currentPeriodEnd && existing.currentPeriodEnd > new Date()) {
          // A one-time extension may intentionally run past Stripe's original
          // recurring period. Preserve that paid-through date.
          console.log('Preserving locally extended access period:', sub.id);
          break;
        }
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
        // Record every paid subscription invoice. The Checkout Session may not
        // contain the first payment intent/invoice, while this event does.
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        const paymentIntentId = getInvoicePaymentIntentId(invoice);
        if (subscriptionId) {
          const sub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
          });
          if (sub && paymentIntentId) {
            await recordPaymentWithLedger(prisma, {
              userId: sub.userId,
              amount: (invoice as any).amount_paid,
              currency: ((invoice as any).currency ?? 'gbp').toUpperCase(),
              status: 'SUCCEEDED',
              stripePaymentIntentId: paymentIntentId,
              stripeInvoiceId: invoice.id,
              description: (invoice as any).billing_reason === 'subscription_cycle'
                ? 'Standard Access renewal'
                : 'Standard Access subscription',
              metadata: { invoiceId: invoice.id },
              subscriptionId: sub.id,
            });
          }
        }
        break;
      }

      // ── Invoice payment failed ────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        if (subscriptionId) {
          const subscription = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
          });
          if (subscription) {
            await prisma.subscription.update({ where: { id: subscription.id }, data: { status: 'PAST_DUE' } });
            const existingPayment = await prisma.payment.findFirst({
              where: { userId: subscription.userId, stripeInvoiceId: invoice.id },
              select: { id: true },
            });
            if (!existingPayment) {
              await recordPaymentWithLedger(prisma, {
                userId: subscription.userId,
                amount: (invoice as any).amount_due ?? 0,
                currency: ((invoice as any).currency ?? 'gbp').toUpperCase(),
                status: 'FAILED',
                stripeInvoiceId: invoice.id,
                description: 'Standard Access renewal payment failed',
                metadata: { invoiceId: invoice.id },
                subscriptionId: subscription.id,
              });
            }
          }
        }
        console.warn('Invoice payment failed:', invoice.id);
        break;
      }

      // ── Refund completed ────────────────────────────────────────────────
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
        if (paymentIntentId) {
          await prisma.payment.updateMany({
            where: { stripePaymentIntentId: paymentIntentId },
            data: { status: 'REFUNDED' },
          });
          await prisma.financialTransaction.updateMany({
            where: { stripeId: paymentIntentId },
            data: { status: 'REFUNDED' },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await prisma.stripeWebhookEvent.update({
      where: { eventId: event.id },
      data: { status: 'COMPLETED', processedAt: new Date() },
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    await prisma.stripeWebhookEvent.updateMany({
      where: { eventId: event.id },
      data: { status: 'FAILED' },
    }).catch(() => undefined);
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
