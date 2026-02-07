# Subscription System Setup Guide

## Overview
The 3yeses platform uses a paid-only subscription model with a single **Standard** plan. Users sign up with basic access and upgrade to Standard via Stripe Checkout.

## Pricing Plans

| Tier | Duration | Price | Features |
|------|----------|-------|----------|
| Standard | 6 Months | £10 | Full customization, unlimited uploads, direct messaging, priority search |
| Standard | 12 Months | £20 | Same features (auto-renew or yearly product) |

## Architecture

### Database Models
- **Subscription**: Tracks user subscription status, plan, dates, and Stripe info
- **Payment**: Records all payment transactions with Stripe integration
- **SubscriptionPlan Enum**: `FREE`, `STANDARD`
- **SubscriptionStatus Enum**: `ACTIVE`, `CANCELED`, `PAST_DUE`, `UNPAID`, `TRIALING`
- **PaymentStatus Enum**: `PENDING`, `SUCCEEDED`, `FAILED`, `REFUNDED`

### API Routes
- `GET /api/subscription/current` - Get user's current subscription
- `GET /api/subscription/plans` - List available plans
- `POST /api/subscription/create-checkout` - Create Stripe checkout session
- `POST /api/subscription/cancel` - Cancel active subscription
- `POST /api/subscription/webhook` - Handle Stripe webhooks (payment events)

### UI Pages
- `/dashboard/subscription` - Subscription management and upgrade page
- `/dashboard/subscription/success` - Post-payment success page

## Stripe Setup

### 1. Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard → Developers → API keys
3. Use **test mode** keys for development

### 2. Configure Environment Variables
Add to your `.env` file:

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_BASE_URL="http://localhost:3002"
```

### 3. Optional: Create Stripe Products (Manual Payment Flow)
If you want to use Stripe's pre-configured prices:

```bash
# Create 6-month plan
stripe products create --name="Standard Access - 6 Months"
stripe prices create --product=prod_XXX --unit-amount=1000 --currency=gbp

# Create 12-month plan
stripe products create --name="Standard Access - 12 Months"
stripe prices create --product=prod_XXX --unit-amount=2000 --currency=gbp
```

Then add price IDs to `.env`:
```env
STRIPE_PRICE_STANDARD_6M="price_..."
STRIPE_PRICE_STANDARD_12M="price_..."
```

**Note**: Current implementation uses dynamic pricing (price_data in checkout), so these are optional.

### 4. Set Up Webhooks (Required for Production)
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/subscription/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Test Webhook Locally (Development)
Install Stripe CLI:
```bash
stripe listen --forward-to localhost:3002/api/subscription/webhook
```

This will output a webhook secret - add it to your `.env`:
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## User Flow

### New User Journey
1. **Sign Up** → User creates account with basic (FREE) access
2. **Limited Features** → Can view profiles but has restrictions:
   - Basic profile only
   - Limited portfolio (5 items max)
   - Standard search visibility
3. **Upgrade Prompt** → Navigate to `/dashboard/subscription`
4. **Choose Duration** → Select 6-month (£10) or 12-month (£20) plan
5. **Stripe Checkout** → Redirected to secure Stripe payment page
6. **Payment Processing** → Stripe processes card payment
7. **Webhook Activation** → Webhook creates Subscription and Payment records
8. **Success Page** → Redirected to `/dashboard/subscription/success`
9. **Full Access** → All Standard features unlocked immediately

### Features by Plan

#### FREE (Default)
- Basic profile
- Limited portfolio (5 items)
- Standard search visibility

#### STANDARD (Paid)
- ✅ Full Profile Customization
- ✅ Unlimited Portfolio Uploads
- ✅ Direct Messaging
- ✅ Priority Search Ranking

## Implementation in Code

### Check User's Subscription
```typescript
import { getPrisma } from '@/lib/prisma';

const prisma = getPrisma();
const subscription = await prisma.subscription.findFirst({
  where: {
    userId: user.id,
    status: 'ACTIVE',
  },
});

const isPremium = subscription?.plan === 'STANDARD';
```

### Feature Gating Example
```typescript
// In your component or API route
const isPremium = await checkUserSubscription(userId);

if (!isPremium) {
  // Count existing portfolio items
  const count = await prisma.portfolioItem.count({
    where: { userId },
  });
  
  if (count >= 5) {
    return { error: 'Upgrade to Standard to upload more items' };
  }
}

// Proceed with upload...
```

### Add Subscription Link to Nav
```typescript
import Link from 'next/link';

<Link href="/dashboard/subscription">
  Upgrade to Standard
</Link>
```

## Testing

### Test Card Numbers (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any CVC, and any postal code.

### Test Workflow
1. Start dev server: `npm run dev`
2. Start Stripe webhook listener: `stripe listen --forward-to localhost:3002/api/subscription/webhook`
3. Navigate to: `http://localhost:3002/dashboard/subscription`
4. Click "Subscribe with Stripe"
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout
7. Verify redirection to success page
8. Check database for Subscription and Payment records

## Monitoring

### Check Subscriptions in Database
```sql
SELECT u.email, s.plan, s.status, s."startDate", s."endDate"
FROM "Subscription" s
JOIN "User" u ON s."userId" = u.id
WHERE s.status = 'ACTIVE'
ORDER BY s."createdAt" DESC;
```

### Check Payments
```sql
SELECT u.email, p.amount, p.status, p."createdAt"
FROM "Payment" p
JOIN "User" u ON p."userId" = u.id
ORDER BY p."createdAt" DESC;
```

## Subscription Management

### Cancel Subscription
Users can cancel from `/dashboard/subscription` page:
1. Click "Cancel Subscription" button
2. Confirm cancellation
3. Subscription status changes to `CANCELED`
4. Access remains until end date

### Renewal Flow
**Current Implementation**: One-time payments (not recurring)
- Users must manually renew when subscription expires
- Set up email reminders for expiring subscriptions

**Future Enhancement**: Recurring Subscriptions
- Modify checkout to use `mode: 'subscription'`
- Use Stripe price IDs for recurring billing
- Handle `customer.subscription.updated` webhook events

## Security Considerations

1. **API Authentication**: All subscription routes require valid JWT token
2. **Webhook Verification**: Webhook endpoint verifies Stripe signature
3. **User Validation**: Verify userId matches authenticated user
4. **Amount Validation**: Server-side price validation (never trust client)
5. **Environment Variables**: Keep Stripe keys in `.env` (never commit)

## Troubleshooting

### Subscription not activating
- Check webhook is receiving events: View Stripe Dashboard → Events
- Verify webhook signature is correct
- Check server logs for errors in `/api/subscription/webhook`
- Ensure database has Subscription and Payment tables

### Payment succeeds but no subscription
- Webhook might have failed - manually trigger from Stripe Dashboard
- Check webhook endpoint is publicly accessible (use ngrok for local testing)
- Verify metadata is passed correctly in checkout session

### TypeScript errors for Prisma models
```bash
npx prisma generate
```

### Database out of sync
```bash
npx prisma db push
npx prisma generate
```

## Production Checklist

- [ ] Set up live Stripe account
- [ ] Add live API keys to production `.env`
- [ ] Configure production webhook endpoint
- [ ] Test live payment flow
- [ ] Set up email notifications for subscriptions
- [ ] Add subscription expiry cron job
- [ ] Implement renewal reminders
- [ ] Add admin dashboard for subscription management
- [ ] Set up monitoring/alerts for failed payments
- [ ] Add refund handling
- [ ] Implement grace period for expired subscriptions
- [ ] Test subscription cancellation flow
- [ ] Document subscription policies (refund, cancellation)

## Support

For Stripe integration issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For platform issues:
- Contact: support@3yeses.com
