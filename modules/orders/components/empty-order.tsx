import Link from 'next/link';

import { Button } from '@/modules/core/ui/button';

export function EmptyOrder() {
  return (
    <div className="mx-auto h-full flex max-w-5xl flex-1 flex-col justify-center items-center gap-y-6">
      <p className="text-center md:text-lg text-muted-foreground tracking-tight">
        You don&apos;t have any products in your order
      </p>
      <Link
        className="mx-auto"
        href="/products"
      >
        <Button
          variant="outline"
          className="tracking-tight transition-colors duration-200 dark:hover:border-neutral-700"
        >
          Add products
        </Button>
      </Link>
    </div>
  );
}
