import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from './config';

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locales.includes(locale as Locale) ? locale : 'en';
  return {
    messages: (await import(`./messages/${validLocale}.json`)).default,
  };
});
