'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Download, Loader2 } from 'lucide-react';
import { DashboardButton } from './DashboardPrimitives';

export function InvoiceDownloadButton({ paymentId, label, invoiceId }: { paymentId: string; label: string; invoiceId: string }) {
  const [downloading, setDownloading] = useState(false);
  const locale = useLocale();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      const variation = mode === 'dark' ? 'night' : 'signal';
      const response = await fetch(`/api/payments/${paymentId}/invoice?mode=${mode}&variation=${variation}&locale=${encodeURIComponent(locale)}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Invoice download failed');

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1] ?? `3YESES-invoice-${invoiceId}.pdf`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DashboardButton
      variant="secondary"
      className="max-w-full px-3 py-2 text-xs"
      onClick={() => void handleDownload()}
      disabled={downloading}
      aria-label={`${label} ${invoiceId}`}
    >
      {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
      <span className="truncate">{label}</span>
    </DashboardButton>
  );
}
