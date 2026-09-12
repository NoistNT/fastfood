import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';

export default function Page() {
  const t = useTranslations('Home');
  return (
    <div className="flex h-full items-center justify-center">
      <Link href="/products">
        <Button
          size="lg"
          type="button"
          variant="outline"
        >
          {t('getStarted')}
        </Button>
      </Link>
    </div>
  );
}
