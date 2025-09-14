import {NextIntlClientProvider} from 'next-intl';
import { notFound } from 'next/navigation';
 
export default async function RootLayout({children, params: {locale}}: {children: React.ReactNode, params: {locale: string}}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Could not load messages for locale:", locale, error);
    notFound();
  }
 
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
