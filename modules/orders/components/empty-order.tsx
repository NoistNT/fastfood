import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';

export function EmptyOrder() {
  const t = useTranslations('Orders');
  return (
    <div className="mx-auto h-full flex max-w-5xl flex-1 flex-col justify-center items-center gap-y-6">
      <p className="text-center md:text-lg text-muted-foreground tracking-tighter">
        {t('emptyOrder')}
      </p>
      <Link
        className="mx-auto"
        href="/products"
      >
        <Button
          variant="outline"
          className="tracking-tight transition-colors duration-200 dark:hover:border-neutral-700"
        >
          {t('addProducts')}
        </Button>
      </Link>
    </div>
  );
}
