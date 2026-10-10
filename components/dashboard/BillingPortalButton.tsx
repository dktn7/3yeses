'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { DashboardButton } from './DashboardPrimitives';

export function BillingPortalButton({ label }: { label: string }) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locale }),
      });
      const data: { url?: string } = await response.json();
      if (!response.ok || !data.url) throw new Error('Billing portal unavailable');
      window.location.assign(data.url);
    } catch (error) {
      console.error('Unable to open billing portal:', error);
      setLoading(false);
    }
  };

  return (
    <DashboardButton variant="secondary" onClick={() => void openPortal()} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CreditCard className="h-4 w-4" aria-hidden="true" />}
      {loading ? 'Opening...' : label}
    </DashboardButton>
  );
}
