import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import { AllLocales } from '@/utils/AppConfig';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!AllLocales.includes(locale as string)) {
    notFound();
  }

  return {
    locale: locale as string,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
