import { create } from 'zustand';

import type { Item } from '@/modules/orders/types';

interface OrderStore {
  items: Item[];
  addItem: (item: Item) => void;
  incrementQuantity: (productId: number) => void;
  decrementQuantity: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearOrder: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  items: [],
  addItem: (item) =>
    set(({ items }) => {
      const existingItemIndex = items.findIndex(({ productId }) => productId === item.productId);

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
}));
