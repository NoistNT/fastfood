'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useSyncExternalStore, useTransition } from 'react';

import { toast } from '@/modules/core/hooks/use-toast';
import { ToastAction } from '@/modules/core/ui/toast';
import { Skeleton } from '@/modules/core/ui/skeleton';
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
import {
  calculateTotal,
  reconcileCartItems,
  submitOrder,
  type CatalogProductSnapshot,
} from '@/modules/orders/utils';
import { useOrderStore, type CheckoutIdentity } from '@/store/use-order';
import { useOfflineOrders } from '@/modules/core/hooks/use-offline-orders';
import { useCSRFToken } from '@/modules/core/hooks/use-csrf-token';
import { OfflineStatus } from '@/modules/core/components/offline-status';
import { ErrorBoundary } from '@/modules/core/components/error-boundary';

export default function Page() {
  const t = useTranslations('Features.orders');
  const { items, incrementQuantity, decrementQuantity, removeItem, clearOrder } = useOrderStore();
  const setCheckoutIdentity = useOrderStore((state) => state.setCheckoutIdentity);
  const { isOnline, addOfflineOrder } = useOfflineOrders();
  const { getToken } = useCSRFToken();

  const total = useMemo(() => calculateTotal(items), [items]);

  const [isPending, startTransition] = useTransition();
  const [checkout, setCheckout] = useState<CheckoutFormState>(emptyCheckoutDetails);
  const [prefilled, setPrefilled] = useState<boolean | null>(null);

  // Cart persistence rehydrates manually: the first paint must match the
  // SSR HTML (empty cart), so renders below gate on `hydrated`.
  const hydrated = useSyncExternalStore(
    (onStoreChange) => useOrderStore.persist.onFinishHydration(onStoreChange),
    () => useOrderStore.persist.hasHydrated(),
    () => false
  );

  useEffect(() => {
    if (!useOrderStore.persist.hasHydrated()) void useOrderStore.persist.rehydrate();
  }, []);

  const [placedOrder, setPlacedOrder] = useState<{
    guest: boolean;
    id: string;
    total: string;
    claimUrl?: string;
  } | null>(null);

  // Signed-in buyers get their contact details prefilled — no re-typing.
  // Guests fall back to their persisted identity (same device). Runs only
  // after cart hydration so the stored snapshot is the rehydrated one.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    fetch('/api/auth/session')
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        const user = data?.data?.user;
        setPrefilled(Boolean(user));
        if (!user) {
          const stored = useOrderStore.getState().checkoutIdentity;
          setCheckout((state) => ({
            ...state,
            fullName: state.fullName || stored.fullName,
            phoneNumber: state.phoneNumber || stored.phoneNumber,
            email: state.email || stored.email,
          }));
          return;
        }
        setCheckout((state) => ({
          ...state,
          fullName: state.fullName || (user.name ?? ''),
          phoneNumber: state.phoneNumber || (user.phoneNumber ?? ''),
          email: state.email || (user.email ?? ''),
        }));
      })
      .catch(() => {
        // leave as null (unknown) — do not show guest prompt
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  // Identity fields persist across refreshes; fulfillment fields
  // (orderType/address/notes) stay ephemeral per-order state.
  const handleCheckoutChange = (patch: Partial<CheckoutFormState>) => {
    setCheckout((state) => ({ ...state, ...patch }));
    const identityPatch: Partial<CheckoutIdentity> = {};
    if (patch.fullName !== undefined) identityPatch.fullName = patch.fullName;
    if (patch.phoneNumber !== undefined) identityPatch.phoneNumber = patch.phoneNumber;
    if (patch.email !== undefined) identityPatch.email = patch.email;
    if (Object.keys(identityPatch).length > 0) setCheckoutIdentity(identityPatch);
  };

  // Persisted prices can lag behind menu edits: re-sync display prices
  // from the catalog once per hydration. Charges stay server-authoritative
  // at submit; a failed fetch (offline) simply keeps stored values.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    fetch('/api/products')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled) return;
        const raw = data?.data;
        if (!Array.isArray(raw)) return;
        const catalog = raw.filter((product: unknown): product is CatalogProductSnapshot => {
          if (typeof product !== 'object' || product === null) return false;
          const candidate = product as Record<string, unknown>;
          return (
            typeof candidate.id === 'number' &&
            typeof candidate.name === 'string' &&
            typeof candidate.price === 'string' &&
            typeof candidate.available === 'boolean'
          );
        });
        const current = useOrderStore.getState().items;
        if (current.length === 0) return;
        const { items: next, removedCount } = reconcileCartItems(current, catalog);
        if (JSON.stringify(next) !== JSON.stringify(current)) {
          useOrderStore.setState({ items: next });
        }
        if (removedCount > 0) {
          toast({
            title: t('cartSync.title'),
            description: t('cartSync.description'),
          });
        }
      })
      .catch(() => {
        // offline or unavailable catalog — keep the stored cart as-is
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, t]);

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
        const placed = await submitOrder({ items, total, ...details }, clearOrder);
        // The server response is authoritative: only guest orders carry a
        // claim URL. A still-pending session check must not hide it, and a
        // mint failure keeps the plain-register fallback for confirmed guests.
        setPlacedOrder({
          guest: prefilled === false || Boolean(placed.claimUrl),
          id: placed.id,
          total: placed.total,
          claimUrl: placed.claimUrl,
        });
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
    if (!placedOrder) return;
    startTransition(async () => {
      try {
        const csrfToken = await getToken();
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
          },
          body: JSON.stringify({ orderId: placedOrder.id }),
        });
        if (!response.ok) {
          throw new Error('Payment preference failed');
        }
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

  if (!hydrated) {
    return (
      <div
        className="mx-auto max-w-5xl h-full flex flex-col justify-center gap-4"
        role="status"
        aria-busy="true"
      >
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

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
              onChange={handleCheckoutChange}
            />
            <SubmitOrder
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
        {placedOrder && (
          <aside
            className="rounded-lg border p-4 space-y-2"
            aria-live="polite"
          >
            {placedOrder.guest && (
              <>
                <p className="text-sm font-medium">{t('accountNudge.title')}</p>
                <p className="text-sm text-muted-foreground">{t('accountNudge.description')}</p>
              </>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handlePay}
                disabled={isPending}
                size="sm"
                variant="default"
              >
                {t('submitOrder.checkout')} · ${placedOrder.total}
              </Button>
              {placedOrder.guest && (
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                >
                  <a href={placedOrder.claimUrl ?? '/register'}>{t('accountNudge.cta')}</a>
                </Button>
              )}
            </div>
          </aside>
        )}
      </div>
    </ErrorBoundary>
  );
}
