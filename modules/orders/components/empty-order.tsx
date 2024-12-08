import Link from 'next/link';

import { Button } from '@/modules/core/ui/button';

export function EmptyOrder() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-y-10 py-60">
      <p className="text-center text-secondary-foreground">
        You don&apos;t have any products in your order
      </p>
      <Link
        className="mx-auto"
        href="/products"
      >
        <Button variant="default">Add products</Button>
      </Link>
    </div>
  );
}
