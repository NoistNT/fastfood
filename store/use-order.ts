import type { CartItem } from '@/modules/orders/types';

import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';

// Guest contact identity typed once at checkout. Persisted alongside the
// cart so a refresh doesn't wipe it; same-device localStorage only, never
// logged, transmitted solely inside the order submit payload (mirroring the
// offline-orders queue precedent). Fulfillment fields (orderType, address,
// notes) stay ephemeral per-order state.
export interface CheckoutIdentity {
  fullName: string;
  phoneNumber: string;
  email: string;
}

const emptyCheckoutIdentity: CheckoutIdentity = {
  fullName: '',
  phoneNumber: '',
  email: '',
};

interface OrderStore {
  items: CartItem[];
  checkoutIdentity: CheckoutIdentity;
  addItem: (item: CartItem) => void;
  incrementQuantity: (productId: number) => void;
  decrementQuantity: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearOrder: () => void;
  setCheckoutIdentity: (patch: Partial<CheckoutIdentity>) => void;
}

type PersistedOrderState = Pick<OrderStore, 'items' | 'checkoutIdentity'>;

// Safe JSON storage: malformed payloads are removed and read as empty so
// rehydrate() completes and hasHydrated() flips. With the default adapter a
// corrupt fastfood_cart leaves hasHydrated() false forever — and the /order
// skeleton gate (subscribed to finish-hydration) pending with it.
const safeJsonStorage = (): PersistStorage<PersistedOrderState> => ({
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      return raw === null ? null : (JSON.parse(raw) as StorageValue<PersistedOrderState>);
    } catch {
      try {
        localStorage.removeItem(name);
      } catch {
        // storage itself unreachable — rehydrate as empty below
      }
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // quota/unavailable storage must never crash cart interactions
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // already effectively gone
    }
  },
});

const isValidCartItem = (item: unknown): item is CartItem => {
  if (typeof item !== 'object' || item === null) return false;
  const { productId, name, price, quantity } = item as Record<string, unknown>;
  return (
    typeof productId === 'number' &&
    typeof name === 'string' &&
    typeof price === 'string' &&
    typeof quantity === 'number'
  );
};

const isValidCheckoutIdentity = (identity: unknown): identity is CheckoutIdentity => {
  if (typeof identity !== 'object' || identity === null) return false;
  const { fullName, phoneNumber, email } = identity as Record<string, unknown>;
  return (
    typeof fullName === 'string' && typeof phoneNumber === 'string' && typeof email === 'string'
  );
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      items: [],
      checkoutIdentity: emptyCheckoutIdentity,
      addItem: (item) =>
        set(({ items }) => {
          const existingItemIndex = items.findIndex(
            ({ productId }) => productId === item.productId
          );

          if (existingItemIndex > -1) {
            const updatedOrder = [...items];

            updatedOrder[existingItemIndex].quantity += item.quantity;

            return { items: updatedOrder };
          }

          return { items: [...items, item] };
        }),
      incrementQuantity: (productId) =>
        set(({ items }) => {
          const updatedOrder = items.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
          );

          return { items: updatedOrder };
        }),
      decrementQuantity: (productId) =>
        set(({ items }) => {
          const updatedOrder = items.map((item) =>
            item.productId === productId && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );

          return { items: updatedOrder };
        }),
      removeItem: (productId) =>
        set(({ items }) => ({
          items: items.filter((item) => item.productId !== productId),
        })),
      clearOrder: () => set({ items: [] }),
      setCheckoutIdentity: (patch) =>
        set(({ checkoutIdentity }) => ({
          checkoutIdentity: { ...checkoutIdentity, ...patch },
        })),
    }),
    {
      name: 'fastfood_cart',
      version: 1,
      // Undefined storage on the server (no localStorage): persist degrades
      // to a plain in-memory store there.
      storage: typeof localStorage === 'undefined' ? undefined : safeJsonStorage(),
      partialize: ({ items, checkoutIdentity }) => ({ items, checkoutIdentity }),
      // Corrupt or foreign shapes fall back to the current (empty) state.
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PersistedOrderState> | undefined;
        const items = Array.isArray(persisted?.items)
          ? persisted.items.filter(isValidCartItem)
          : currentState.items;
        const checkoutIdentity = isValidCheckoutIdentity(persisted?.checkoutIdentity)
          ? persisted.checkoutIdentity
          : currentState.checkoutIdentity;
        return { ...currentState, items, checkoutIdentity };
      },
      // Manual rehydration: the /order page gates its first paint on
      // hasHydrated() so SSR HTML (empty cart) and the first client render
      // never disagree.
      skipHydration: true,
    }
  )
);
