import type { MouseEventHandler } from 'react';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';
import { useOrderStore } from '@/store/use-order';

interface Props {
  handleSubmit: MouseEventHandler<HTMLButtonElement>;
  isPending: boolean;
}

export function SubmitOrder({ handleSubmit, isPending }: Props) {
  const t = useTranslations('Features.orders.submitOrder');
  const { clearOrder } = useOrderStore();

  return (
    <div className="flex items-center justify-end gap-4 py-4">
      <Button
        aria-disabled={isPending}
        type="button"
        variant="destructive-soft"
        onClick={clearOrder}
      >
        {t('cancel')}
      </Button>
      <Link href="/products">
        <Button
          type="button"
          variant="secondary"
        >
          {t('addMore')}
        </Button>
      </Link>
      <Button
        disabled={isPending}
        type="submit"
        variant={isPending ? 'secondary' : 'default'}
        onClick={handleSubmit}
      >
        {isPending ? t('registering') : t('confirm')}
      </Button>
    </div>
  );
}
