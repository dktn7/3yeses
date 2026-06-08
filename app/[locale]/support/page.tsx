import { getMessages } from 'next-intl/server';
import SupportPageClient, { FaqItem } from './SupportPageClient';

export default async function SupportPage() {
  const messages = await getMessages();
  const faqItems = Array.isArray(messages.support?.faqItems) ? messages.support.faqItems as FaqItem[] : [];

  return <SupportPageClient faqItems={faqItems} />;
}
