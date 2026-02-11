import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, localeDirection, type Locale } from '@/i18n/config';
import PublicHeader from '@/components/public/Header';
import PublicFooter from '@/components/public/Footer';
import '@/styles/globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = localeDirection[locale as Locale] || 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
        <link rel="alternate" hrefLang="en" href={`${process.env.NEXT_PUBLIC_SITE_URL}/en`} />
        <link rel="alternate" hrefLang="ar" href={`${process.env.NEXT_PUBLIC_SITE_URL}/ar`} />
        <link rel="alternate" hrefLang="x-default" href={`${process.env.NEXT_PUBLIC_SITE_URL}`} />
      </head>
      <body className={`min-h-screen flex flex-col ${dir === 'rtl' ? 'font-arabic' : 'font-sans'}`}>
        <NextIntlClientProvider messages={messages}>
          <PublicHeader locale={locale} />
          <main className="flex-1">{children}</main>
          <PublicFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
