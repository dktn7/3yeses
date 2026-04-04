'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  durationLabel: string;
  price: number;
  priceDisplay: string;
  features: string[];
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch plans
      const plansRes = await fetch('/api/subscription/plans');
      const plansData = await plansRes.json();
      setPlans(plansData.plans || []);

      // Fetch current subscription
      const subRes = await fetch('/api/subscription/current', {
        credentials: 'include',
      });
      const subData = await subRes.json();
      setCurrentSubscription(subData);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (duration: string) => {
    setSubscribing(duration);
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ duration }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to create subscription. Please try again.');
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Subscription canceled successfully');
        fetchData();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isSubscribed = currentSubscription?.plan === 'STANDARD' && 
                       currentSubscription?.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose the plan that's right for you.
          </h1>
          {isSubscribed && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-400 font-medium">
                You're currently subscribed to Standard Access
              </p>
              <p className="text-gray-300 text-sm mt-1">
                Valid until: {new Date(currentSubscription.endDate).toLocaleDateString()}
              </p>
              <button
                onClick={handleCancel}
                className="mt-3 text-red-400 hover:text-red-300 text-sm underline"
              >
                Cancel Subscription
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            For Talents
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-gray-800/50 border border-blue-500/50 rounded-xl p-8 backdrop-blur-sm"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-blue-400">
                    {plan.priceDisplay}
                  </span>
                  <span className="text-gray-400 ml-2">
                    / {plan.durationLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.duration)}
                disabled={subscribing !== null || isSubscribed}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {subscribing === plan.duration ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : isSubscribed ? (
                  'Current Plan'
                ) : (
                  'Subscribe with Stripe'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Secure payment processing by Stripe</p>
          <p className="mt-2">
            Questions? Contact us at support@3yeses.online
          </p>
        </div>
      </div>
    </div>
  );
}
