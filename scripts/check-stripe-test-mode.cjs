const { loadEnvConfig } = require('@next/env');
const Stripe = require('stripe');

loadEnvConfig(process.cwd());

const key = process.env.STRIPE_SECRET_KEY || '';
const priceIds = [process.env.STRIPE_PRICE_STANDARD_6M, process.env.STRIPE_PRICE_STANDARD_12M].filter(Boolean);
const customerId = process.env.STRIPE_TEST_CUSTOMER_ID;
const subscriptionId = process.env.STRIPE_TEST_SUBSCRIPTION_ID;

if (!key || !key.startsWith('sk_test_')) {
  console.error('Stripe test-mode check refused: STRIPE_SECRET_KEY must be a Stripe test key (sk_test_...).');
  process.exitCode = 2;
} else if (priceIds.length < 2 || !customerId || !subscriptionId) {
  const missing = [
    !process.env.STRIPE_PRICE_STANDARD_6M && 'STRIPE_PRICE_STANDARD_6M',
    !process.env.STRIPE_PRICE_STANDARD_12M && 'STRIPE_PRICE_STANDARD_12M',
    !customerId && 'STRIPE_TEST_CUSTOMER_ID',
    !subscriptionId && 'STRIPE_TEST_SUBSCRIPTION_ID',
  ].filter(Boolean);
  console.error(`Stripe test-mode check is not configured. Missing: ${missing.join(', ')}.`);
  process.exitCode = 2;
} else if (process.env.STRIPE_TEST_MUTATION_CONFIRM !== 'YES') {
  console.error('Stripe test-mode check refused to mutate without STRIPE_TEST_MUTATION_CONFIRM=YES.');
  process.exitCode = 2;
} else {
  (async () => {
    const stripe = new Stripe(key);
    const prices = await Promise.all(priceIds.map((id) => stripe.prices.retrieve(id)));
    if (prices.some((price) => price.livemode)) throw new Error('A configured Stripe price is live mode.');

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted || customer.livemode) throw new Error('Configured Stripe test customer is not usable.');

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.livemode) throw new Error('Configured Stripe subscription is live mode.');
    const originalCancelAtPeriodEnd = subscription.cancel_at_period_end;
    await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });
    await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: originalCancelAtPeriodEnd });

    console.log(JSON.stringify({
      ok: true,
      mode: 'test',
      checks: ['test prices', 'test customer', 'test subscription cancellation and restoration'],
    }, null, 2));
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
