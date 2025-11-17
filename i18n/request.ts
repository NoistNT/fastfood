import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  const accept = (await headers()).get('accept-language') || '';
  const locale = accept.startsWith('es') ? 'es' : 'en';
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
