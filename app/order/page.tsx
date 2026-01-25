'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useTransition } from 'react';

import { toast } from '@/modules/core/hooks/use-toast';
import { ToastAction } from '@/modules/core/ui/toast';
import { EmptyOrder } from '@/modules/orders/components/empty-order';
import { OrderTable } from '@/modules/orders/components/order-table';
import { SubmitOrder } from '@/modules/orders/components/submit-order';
import { calculateTotal, submitOrder } from '@/modules/orders/utils';
import { useOrderStore } from '@/store/use-order';
import { useOfflineOrders } from '@/modules/core/hooks/use-offline-orders';
import { OfflineStatus } from '@/modules/core/components/offline-status';
import { ErrorBoundary } from '@/modules/core/components/error-boundary';

export default function Page() {
  const t = useTranslations('Features.orders');
  const { items, incrementQuantity, decrementQuantity, removeItem, clearOrder } = useOrderStore();
  const { isOnline, addOfflineOrder } = useOfflineOrders();

  const total = useMemo(() => calculateTotal(items), [items]);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        // Check if online
        if (!isOnline) {
          // Save order offline
          addOfflineOrder({ items, total });
          clearOrder();
          return;
        }

        // Submit order online
        await submitOrder({ items, total }, clearOrder);
        toast({
          title: t('submitToast.successTitle'),
          description: t('submitToast.successDescription'),
        });
      } catch (_error) {
        // If online submission fails, try offline storage
        if (isOnline) {
          addOfflineOrder({ items, total });
          clearOrder();
        } else {
          toast({
            title: t('submitToast.errorTitle'),
            description: t('submitToast.errorDescription'),
            action: (
              <ToastAction
                altText={t('submitToast.actionText')}
                onClick={handleSubmit}
              >
                {t('submitToast.actionText')}
              </ToastAction>
            ),
          });
        }
      }
    });
  };

  const handlePay = async () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Order Payment',
            quantity: items.length,
            price: +total,
          }),
        });
        const data = await response.json();
        window.location.href = data.init_point;
      } catch (_error) {
        toast({
          title: t('handlePayToast.errorTitle'),
          description: t('handlePayToast.errorDescription'),
        });
      }
    });
  };

  if (!items.length) return <EmptyOrder />;

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-5xl h-full flex flex-col justify-center">
        <OfflineStatus />
        <OrderTable
          decrementQuantity={decrementQuantity}
          incrementQuantity={incrementQuantity}
          items={items}
          removeItem={removeItem}
          total={total}
        />
        <SubmitOrder
          handlePay={handlePay}
          handleSubmit={handleSubmit}
          isPending={isPending}
        />
      </div>
    </ErrorBoundary>
  );
}
