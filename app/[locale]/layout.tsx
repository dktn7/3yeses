import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';

import CookieConsentBanner from '../../components/CookieConsentBanner';
import IntlProvider from '../../components/IntlProvider';
import MainLayout from '../../components/MainLayout';


export default async function LocaleLayout({children, params}: {children: React.ReactNode, params: {locale: string}}) {
  const { locale } = params;

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error("Could not load messages for locale:", locale, error);
    notFound();
  }

  const isRTL = locale.startsWith('ar');
  return (
    <IntlProvider locale={locale} messages={messages}>
      <MainLayout>{children}</MainLayout>
      <CookieConsentBanner />
    </IntlProvider>
  );
}
