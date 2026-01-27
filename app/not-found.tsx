import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { Button } from '@/modules/core/ui/button';

export default async function NotFound() {
  const t = await getTranslations('Components.errors.notFound');

  return (
    <div className="flex flex-col h-full items-center justify-center gap-6">
      <h1 className="text-5xl text-primary font-semibold tracking-tight">{t('title')}</h1>
      <p className="text-center">{t('description')}</p>
      <div className="mt-5">
        <Button
          variant="outline"
          asChild
        >
          <Link href="/">{t('goHome')}</Link>
        </Button>
      </div>
    </div>
  );
}
