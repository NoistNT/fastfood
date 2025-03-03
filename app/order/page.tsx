'use client';

import { useMemo, useTransition } from 'react';

import { toast } from '@/modules/core/hooks/use-toast';
import { ToastAction } from '@/modules/core/ui/toast';
import { EmptyOrder } from '@/modules/orders/components/empty-order';
import { OrderTable } from '@/modules/orders/components/order-table';
import { SubmitOrder } from '@/modules/orders/components/submit-order';
import { ORDER_STATUS } from '@/modules/orders/types';
import { calculateTotal, submitOrder } from '@/modules/orders/utils';
import { useOrderStore } from '@/store/use-order';

export default function Page() {
  const { items, incrementQuantity, decrementQuantity, removeItem, clearOrder } = useOrderStore();

  const total = useMemo(() => calculateTotal(items), [items]);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        await submitOrder(
          {
            items,
            total,
            statusHistory: [{ status: ORDER_STATUS.PENDING, createdAt: new Date() }],
          },
          clearOrder
        );
        toast({
          title: 'Done!',
          description: 'Your order has been registered.',
        });
      } catch (error) {
        toast({
          title: 'Something went wrong',
          description: 'Your order could not be registered.',
          action: (
            <ToastAction
              altText="Try again"
              onClick={handleSubmit}
            >
              Try again
            </ToastAction>
          ),
        });
      }
    });
  };

  if (!items.length) return <EmptyOrder />;

  return (
    <div className="mx-auto max-w-5xl h-full flex flex-col justify-center">
      <OrderTable
        decrementQuantity={decrementQuantity}
        incrementQuantity={incrementQuantity}
        items={items}
        removeItem={removeItem}
        total={total}
      />
      <SubmitOrder
        handleSubmit={handleSubmit}
        isPending={isPending}
      />
    </div>
  );
}
