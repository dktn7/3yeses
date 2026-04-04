export type SubscriptionDuration = '6_months' | '12_months';

export interface PricingPlan {
  id: string;
  name: string;
  duration: SubscriptionDuration;
  durationLabel: string;
  price: number; // in pence
  priceDisplay: string;
  stripePriceId?: string; // To be set in environment
  features: string[];
}

export const SUBSCRIPTION_FEATURES = {
  FREE: [
    'No platform access',
    'Subscription required at sign-up',
  ],
  STANDARD: [
    'Full Profile Customization',
    'Unlimited Portfolio Uploads',
    'Priority Search Ranking',
    'Full Dashboard Analytics',
  ],
};

export const PRICING_PLANS: Record<string, PricingPlan> = {
  STANDARD_6M: {
    id: 'standard_6m',
    name: 'Standard Access',
    duration: '6_months',
    durationLabel: '6 months',
    price: 1000, // £10 in pence
    priceDisplay: '£10',
    stripePriceId: process.env.STRIPE_PRICE_STANDARD_6M,
    features: SUBSCRIPTION_FEATURES.STANDARD,
  },
  STANDARD_12M: {
    id: 'standard_12m',
    name: 'Standard Access',
    duration: '12_months',
    durationLabel: '12 months',
    price: 2000, // £20 in pence
    priceDisplay: '£20',
    stripePriceId: process.env.STRIPE_PRICE_STANDARD_12M,
    features: SUBSCRIPTION_FEATURES.STANDARD,
  },
};

export const DEFAULT_PLAN = null; // No subscription by default

export function getPlanByDuration(duration: SubscriptionDuration): PricingPlan {
  return duration === '6_months' ? PRICING_PLANS.STANDARD_6M : PRICING_PLANS.STANDARD_12M;
}

export function calculateEndDate(startDate: Date, duration: SubscriptionDuration): Date {
  const endDate = new Date(startDate);
  if (duration === '6_months') {
    endDate.setMonth(endDate.getMonth() + 6);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  return endDate;
}
