'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { toast } from '@/modules/core/hooks/use-toast';
import { ToastAction } from '@/modules/core/ui/toast';
import { Button } from '@/modules/core/ui/button';
import { EmptyOrder } from '@/modules/orders/components/empty-order';
import { OrderTable } from '@/modules/orders/components/order-table';
import { SubmitOrder } from '@/modules/orders/components/submit-order';
import {
  CheckoutDetailsForm,
  emptyCheckoutDetails,
  type CheckoutFormState,
  toCheckoutDetails,
} from '@/modules/orders/components/checkout-details';
import { calculateTotal, submitOrder } from '@/modules/orders/utils';
import { useOrderStore } from '@/store/use-order';
import { useOfflineOrders } from '@/modules/core/hooks/use-offline-orders';
import { useCSRFToken } from '@/modules/core/hooks/use-csrf-token';
import { OfflineStatus } from '@/modules/core/components/offline-status';
import { ErrorBoundary } from '@/modules/core/components/error-boundary';

export default function Page() {
  const t = useTranslations('Features.orders');
  const { items, incrementQuantity, decrementQuantity, removeItem, clearOrder } = useOrderStore();
  const { isOnline, addOfflineOrder } = useOfflineOrders();
  const { getToken } = useCSRFToken();

  const total = useMemo(() => calculateTotal(items), [items]);

  const [isPending, startTransition] = useTransition();
  const [checkout, setCheckout] = useState<CheckoutFormState>(emptyCheckoutDetails);
  const [prefilled, setPrefilled] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ guest: boolean } | null>(null);

  // Signed-in buyers get their contact details prefilled — no re-typing.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/session')
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        const user = data?.data?.user;
        setPrefilled(Boolean(user));
        if (!user) return;
        setCheckout((state) => ({
          ...state,
          fullName: state.fullName || (user.name ?? ''),
          phoneNumber: state.phoneNumber || (user.phoneNumber ?? ''),
          email: state.email || (user.email ?? ''),
        }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    if (!checkout.fullName.trim() || !checkout.phoneNumber.trim()) {
      toast({
        title: t('submitToast.errorTitle'),
        description: t('checkout.fullName'),
        variant: 'destructive',
      });
      return;
    }
    if (checkout.orderType === 'delivery' && !checkout.deliveryAddress.trim()) {
      toast({
        title: t('submitToast.errorTitle'),
        description: t('checkout.address'),
        variant: 'destructive',
      });
      return;
    }
    startTransition(async () => {
      try {
        const details = toCheckoutDetails(checkout);

        // Check if online
        if (!isOnline) {
          // Save order offline
          addOfflineOrder({ items, total, details });
          clearOrder();
          return;
        }

        // Submit order online
        await submitOrder({ items, total, ...details }, clearOrder);
        if (!prefilled) {
          try {
            sessionStorage.setItem(
              'guest_checkout_claim',
              JSON.stringify({
                name: details.person.fullName,
                phone: details.person.phoneNumber,
                email: details.person.email ?? '',
              })
            );
          } catch {
            // ignore storage errors (private mode, quota)
          }
          setPlacedOrder({ guest: true });
        } else {
          setPlacedOrder(null);
        }
        toast({
          title: t('submitToast.successTitle'),
          description: t('submitToast.successDescription'),
        });
      } catch (_error) {
        // If online submission fails, try offline storage
        if (isOnline) {
          addOfflineOrder({ items, total, details: toCheckoutDetails(checkout) });
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
        const csrfToken = await getToken();
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
          },
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

  if (!items.length && !placedOrder) return <EmptyOrder />;

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-5xl h-full flex flex-col justify-center">
        <OfflineStatus />
        {items.length > 0 && (
          <>
            <OrderTable
              decrementQuantity={decrementQuantity}
              incrementQuantity={incrementQuantity}
              items={items}
              removeItem={removeItem}
              total={total}
            />
            <CheckoutDetailsForm
              value={checkout}
              onChange={(patch) => setCheckout((s) => ({ ...s, ...patch }))}
            />
            <SubmitOrder
              handlePay={handlePay}
              handleSubmit={handleSubmit}
              isPending={
                isPending ||
                !checkout.fullName.trim() ||
                !checkout.phoneNumber.trim() ||
                (checkout.orderType === 'delivery' && !checkout.deliveryAddress.trim())
              }
            />
          </>
        )}
        {placedOrder?.guest && (
          <aside
            className="rounded-lg border p-4 space-y-2"
            aria-live="polite"
          >
            <p className="text-sm font-medium">{t('accountNudge.title')}</p>
            <p className="text-sm text-muted-foreground">{t('accountNudge.description')}</p>
            <Button
              asChild
              size="sm"
              variant="default"
            >
              <a href="/register">{t('accountNudge.cta')}</a>
            </Button>
          </aside>
        )}
      </div>
    </ErrorBoundary>
  );
}
