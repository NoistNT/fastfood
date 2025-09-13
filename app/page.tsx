import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';

export default function Page() {
  const t = useTranslations();
  return (
    <div className="flex h-full items-center justify-center tracking-tight">
      <Link href="/products">
        <Button
          type="button"
          variant="outline"
          className="p-4.5 font-semibold tracking-tight transition-colors duration-200 dark:hover:border-neutral-700"
        >
          {t('getStarted')}
        </Button>
      </Link>
    </div>
  );
}
