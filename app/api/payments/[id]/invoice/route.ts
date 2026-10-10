import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import PDFDocument from 'pdfkit';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

function formatMoney(amount: number, currency: string, locale = 'en-GB') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatStripeAddress(address?: Stripe.Address | null) {
  if (!address) return '';
  return [
    [address.line1, address.line2].filter(Boolean).join(', '),
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean).join(' | ');
}

function createInvoicePdf({
  mode,
  invoiceNumber,
  invoiceDate,
  customerName,
  customerEmail,
  description,
  amount,
  currency,
  status,
  paymentReference,
  periodEnd,
  sellerName,
  sellerAddress,
  sellerTaxId,
  paymentDate,
  servicePeriod,
  subtotal,
  taxAmount,
  locale,
  variation,
}: {
  mode: 'light' | 'dark';
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  paymentReference: string;
  periodEnd?: string | null;
  sellerName: string;
  sellerAddress: string;
  sellerTaxId?: string | null;
  paymentDate: string;
  servicePeriod: string;
  subtotal: number;
  taxAmount: number;
  locale: string;
  variation: 'signal' | 'night' | 'ledger';
}) {
  const doc = new PDFDocument({ size: 'A4', margin: 0, info: { Title: `3YESES invoice ${invoiceNumber}`, Author: '3YESES' } });
  const chunks: Buffer[] = [];
  const night = mode === 'dark' || variation === 'night';
  const ledger = variation === 'ledger' && !night;
  const paper = night ? '#090D16' : ledger ? '#F0ECE4' : '#F4F7FF';
  const panel = night ? '#111827' : '#FFFFFF';
  const softPanel = night ? '#16243B' : ledger ? '#E7E0D4' : '#E8F0FF';
  const ink = night ? '#F8FAFC' : '#15171B';
  const muted = night ? '#B7C5DA' : '#53627A';
  const line = night ? '#29405F' : ledger ? '#D4C9BA' : '#C9D8F3';
  const red = night ? '#FF6B6B' : '#B91C1C';
  const blue = night ? '#66A3FF' : '#2563EB';
  const header = night ? '#142B55' : '#B91C1C';
  const money = formatMoney(amount, currency, locale);
  const subtotalMoney = formatMoney(subtotal, currency, locale);
  const taxMoney = formatMoney(taxAmount, currency, locale);
  const shortReference = paymentReference.length > 25
    ? `${paymentReference.slice(0, 12)}...${paymentReference.slice(-8)}`
    : paymentReference;

  doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
  const output = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  doc.rect(0, 0, 595.28, 841.89).fill(paper);
  doc.rect(0, 0, 595.28, 118).fill(header);
  doc.rect(0, 0, 16, 841.89).fill(red);
  doc.rect(16, 110, 579.28, 8).fill(blue);

  // The angled signal bars are the recognisable 3YESES visual signature.
  for (let index = 0; index < 7; index += 1) {
    const x = 310 + index * 46;
    doc.save().fillOpacity(night ? 0.28 : 0.18).fillColor(index % 2 ? '#FFFFFF' : blue);
    doc.moveTo(x, 0).lineTo(x + 28, 0).lineTo(x - 34, 118).lineTo(x - 62, 118).closePath().fill();
    doc.restore();
  }

  // Recreate the 3YESES swooping-check logo as native PDF vectors for crisp exports.
  doc.roundedRect(42, 36, 46, 46, 10).fill('#FFFFFF');
  doc.save().lineWidth(2.4).strokeColor(blue);
  doc.circle(65, 59, 13).stroke();
  doc.strokeColor(red).moveTo(59, 59).lineTo(63, 63).lineTo(72, 54).lineCap('round').lineJoin('round').stroke();
  doc.restore();
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(27).text('3YESES', 102, 38, { characterSpacing: 0.8 });
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9).text('MAKE YOUR PRESENCE COUNT.', 104, 78, { characterSpacing: 1.6 });
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(27).text('INVOICE', 390, 39, { align: 'right', width: 145 });
  doc.fillColor('#FFFFFF').font('Helvetica').fontSize(9).text(invoiceNumber, 390, 78, { align: 'right', width: 145 });

  doc.roundedRect(48, 150, 499, 158, 18).fill(panel);
  doc.fillColor(red).rect(48, 150, 8, 158).fill();
  doc.fillColor(muted).font('Helvetica-Bold').fontSize(9).text('YOUR WORK, IN FOCUS.', 80, 180, { characterSpacing: 1.5 });
  doc.fillColor(ink).font('Helvetica-Bold').fontSize(21).text(description, 80, 205, { width: 295, height: 52, ellipsis: true });
  doc.fillColor(muted).font('Helvetica').fontSize(10).text(periodEnd ? `Access available through ${periodEnd}` : 'A private record of your 3YESES access.', 80, 252, { width: 300 });
  doc.fillColor(red).font('Helvetica-Bold').fontSize(30).text(money, 80, 270);
  doc.fillColor(muted).font('Helvetica-Bold').fontSize(9).text(status, 422, 181, { align: 'right', width: 90 });
  doc.roundedRect(422, 202, 90, 28, 14).fill(status === 'PAID' ? '#DDF7E7' : night ? '#1E4B91' : '#DBEAFE');
  doc.fillColor(status === 'PAID' ? '#137A42' : night ? '#F8FAFC' : '#1E3A8A').font('Helvetica-Bold').fontSize(9).text(status, 422, 212, { align: 'center', width: 90 });

  doc.fillColor(muted).font('Helvetica-Bold').fontSize(9).text('FROM', 80, 346);
  doc.fillColor(ink).font('Helvetica-Bold').fontSize(11).text(sellerName, 80, 363, { width: 185 });
  doc.fillColor(muted).font('Helvetica').fontSize(8.5).text(sellerAddress || '3yeses.online', 80, 380, { width: 185 });
  doc.fillColor(muted).font('Helvetica').fontSize(8.5).text(sellerTaxId ? `Tax ID: ${sellerTaxId}` : 'Tax ID: Not provided', 80, 397, { width: 185 });
  doc.fillColor(muted).font('Helvetica-Bold').fontSize(9).text('BILLED TO', 290, 346);
  doc.fillColor(ink).font('Helvetica-Bold').fontSize(11).text(customerName || '3YESES member', 290, 363, { width: 220 });
  doc.fillColor(muted).font('Helvetica').fontSize(9).text(customerEmail, 290, 380, { width: 220 });
  doc.fillColor(muted).font('Helvetica').fontSize(8.5).text(`Invoice date: ${invoiceDate}`, 290, 397, { width: 220 });

  doc.moveTo(80, 435).lineTo(515, 435).strokeColor(line).lineWidth(1).stroke();
  doc.fillColor(muted).font('Helvetica-Bold').fontSize(9).text('INVOICE DETAILS', 80, 458, { characterSpacing: 1 });
  doc.fillColor(muted).font('Helvetica').fontSize(9).text(`Payment date: ${paymentDate}`, 80, 478, { width: 210 });
  doc.fillColor(muted).font('Helvetica').fontSize(9).text(`Service period: ${servicePeriod}`, 80, 495, { width: 300 });
  doc.fillColor(muted).font('Helvetica').fontSize(9).text('Payment reference', 350, 458, { align: 'right', width: 165 });
  doc.fillColor(ink).font('Helvetica').fontSize(8.5).text(shortReference, 350, 478, { align: 'right', width: 165 });
  doc.fillColor(muted).font('Helvetica').fontSize(7.5).text(paymentReference, 350, 494, { align: 'right', width: 165, lineBreak: false });

  doc.moveTo(80, 530).lineTo(515, 530).strokeColor(line).lineWidth(1).stroke();
  doc.fillColor(muted).font('Helvetica-Bold').fontSize(9).text('DESCRIPTION', 80, 550);
  doc.fillColor(muted).font('Helvetica-Bold').fontSize(9).text('AMOUNT', 420, 550, { align: 'right', width: 95 });
  doc.fillColor(ink).font('Helvetica').fontSize(11).text(description, 80, 575, { width: 315, height: 24, ellipsis: true });
  doc.fillColor(ink).font('Helvetica-Bold').fontSize(11).text(subtotalMoney, 420, 575, { align: 'right', width: 95 });
  doc.fillColor(muted).font('Helvetica').fontSize(9).text('Subtotal', 350, 610, { align: 'right', width: 85 });
  doc.fillColor(ink).font('Helvetica').fontSize(10).text(subtotalMoney, 440, 610, { align: 'right', width: 75 });
  doc.fillColor(muted).font('Helvetica').fontSize(9).text(taxAmount > 0 ? 'Tax' : 'Tax not charged', 350, 628, { align: 'right', width: 85 });
  doc.fillColor(ink).font('Helvetica').fontSize(10).text(taxMoney, 440, 628, { align: 'right', width: 75 });
  doc.moveTo(80, 650).lineTo(515, 650).strokeColor(line).lineWidth(1).stroke();
  doc.fillColor(muted).font('Helvetica-Bold').fontSize(9).text('TOTAL PAID', 350, 676, { align: 'right', width: 85 });
  doc.fillColor(red).font('Helvetica-Bold').fontSize(22).text(money, 440, 669, { align: 'right', width: 75 });

  doc.roundedRect(80, 715, 435, 58, 14).fill(softPanel);
  doc.fillColor(red).font('Helvetica-Bold').fontSize(11).text('SEEN WITH INTENT.', 102, 734, { characterSpacing: 1 });
  doc.fillColor(muted).font('Helvetica').fontSize(8.5).text('Thank you for making your public presence count with 3YESES.', 102, 753, { width: 370 });
  doc.moveTo(80, 800).lineTo(515, 800).strokeColor(line).lineWidth(1).stroke();
  doc.fillColor(muted).font('Helvetica').fontSize(8.5).text('3YESES | Make your presence count.', 80, 817);
  doc.fillColor(muted).font('Helvetica').fontSize(8.5).text('support@3yeses.online', 350, 817, { width: 165, align: 'right' });
  doc.end();

  return output;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateUser(req);
  if (!auth.authenticated || !auth.user) return auth.response!;

  const { id } = await params;
  const payment = await prisma.payment.findFirst({
    where: { id, userId: auth.user.userId },
    select: {
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
      description: true,
      stripeInvoiceId: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!payment?.stripeInvoiceId) {
    return NextResponse.json({ error: 'Invoice unavailable' }, { status: 404 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const invoice = await stripe.invoices.retrieve(payment.stripeInvoiceId);
    const account = await stripe.accounts.retrieve();
    const searchParams = new URL(req.url).searchParams;
    const modeParam = searchParams.get('mode');
    const mode = modeParam === 'dark' ? 'dark' : 'light';
    const requestedLocale = searchParams.get('locale') || 'en-GB';
    const locale = /^[a-z]{2}(-[A-Z]{2})?$/i.test(requestedLocale) ? requestedLocale : 'en-GB';
    const requestedVariation = searchParams.get('variation');
    const variation = requestedVariation === 'ledger' || requestedVariation === 'night'
      ? requestedVariation
      : mode === 'dark' ? 'night' : 'signal';
    const period = await prisma.subscription.findFirst({
      where: { userId: auth.user.userId, status: { in: ['ACTIVE', 'TRIALING'] } },
      orderBy: { createdAt: 'desc' },
      select: { currentPeriodEnd: true },
    });
    const invoiceDate = new Date((invoice.created ?? payment.createdAt.getTime() / 1000) * 1000).toLocaleDateString(locale);
    const periodEnd = period?.currentPeriodEnd?.toLocaleDateString(locale) ?? null;
    const taxAmount = (invoice.total_taxes ?? []).reduce((total, taxLine) => total + taxLine.amount, 0);
    const sellerName = invoice.account_name ?? account.company?.name ?? account.business_profile?.name ?? '3YESES';
    const sellerAddress = formatStripeAddress(account.company?.address ?? account.business_profile?.support_address) || '3yeses.online';
    const sellerTaxId = (invoice.account_tax_ids ?? [])
      .map((taxId) => typeof taxId === 'string' ? taxId : 'value' in taxId ? taxId.value : taxId.id)
      .join(', ') || null;
    const subtotal = invoice.subtotal ?? Math.max(payment.amount - taxAmount, 0);
    const paymentDate = new Date((invoice.status_transitions?.paid_at ?? invoice.created ?? payment.createdAt.getTime() / 1000) * 1000).toLocaleDateString(locale);
    const pdf = await createInvoicePdf({
      mode,
      invoiceNumber: invoice.number ?? payment.stripeInvoiceId,
      invoiceDate,
      customerName: payment.user.name ?? '3YESES member',
      customerEmail: payment.user.email,
      description: payment.description ?? '3YESES Standard Access',
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status === 'SUCCEEDED' ? 'PAID' : payment.status,
      paymentReference: payment.stripeInvoiceId,
      periodEnd,
      sellerName,
      sellerAddress,
      sellerTaxId,
      paymentDate,
      servicePeriod: periodEnd ? `${invoiceDate} - ${periodEnd}` : invoiceDate,
      subtotal,
      taxAmount,
      locale,
      variation,
    });
    const filename = `3YESES-invoice-${invoice.number ?? payment.stripeInvoiceId}.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Invoice download error:', error);
    return NextResponse.json({ error: 'Failed to download invoice' }, { status: 500 });
  }
}
