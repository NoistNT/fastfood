import type { MouseEventHandler } from 'react';

import Link from 'next/link';

import { Button } from '@/modules/core/ui/button';
import { useOrderStore } from '@/store/use-order';

interface Props {
  handlePay: MouseEventHandler<HTMLButtonElement>;
  handleSubmit: MouseEventHandler<HTMLButtonElement>;
  isPending: boolean;
}

export function SubmitOrder({ handlePay, handleSubmit, isPending }: Props) {
  const { clearOrder } = useOrderStore();

  return (
    <div className="flex items-center justify-end gap-4 py-4">
      <Button
        className="dark:border dark:border-neutral-900"
        disabled={isPending}
        type="submit"
        variant={isPending ? 'secondary' : 'default'}
        onClick={handlePay}
      >
        {isPending ? 'Redirecting...' : 'Checkout'}
      </Button>
      <Button
        aria-disabled={isPending}
        className="border border-rose-200 bg-rose-50/50 text-rose-400 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-500 dark:border-rose-950 dark:bg-rose-900/10 dark:text-rose-300/70 dark:hover:border-rose-900/60 dark:hover:text-rose-300"
        type="button"
        variant="ghost"
        onClick={clearOrder}
      >
        Cancel order
      </Button>
      <Link href="/products">
        <Button
          className="border border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600"
          type="button"
          variant="secondary"
        >
          Add more
        </Button>
      </Link>
      <Button
        className="dark:border dark:border-neutral-900"
        disabled={isPending}
        type="submit"
        variant={isPending ? 'secondary' : 'default'}
        onClick={handleSubmit}
      >
        {isPending ? 'Registering...' : 'Confirm order'}
      </Button>
    </div>
  );
}
