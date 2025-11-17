import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/modules/core/ui/button';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <div className="flex flex-col h-full items-center justify-center gap-6">
      <h1 className="text-5xl text-primary font-semibold tracking-tight">{t('title')}</h1>
      <p className="text-center">{t('description')}</p>
      <Button
        className="mt-5"
        variant="outline"
        asChild
      >
        <Link href="/">{t('goHome')}</Link>
      </Button>
    </div>
  );
}
