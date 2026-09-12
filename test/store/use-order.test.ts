import { beforeEach, describe, expect, it, vi } from 'vitest';

// This repo's jsdom setup exposes no localStorage (window exists, storage
// is undefined), so provide an in-memory Storage BEFORE the store module
// evaluates — createJSONStorage binds whatever getStorage() returns at
// import time.
function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    key: (index: number) => [...data.keys()][index] ?? null,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, String(value));
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    clear: () => {
      data.clear();
    },
  };
}

vi.stubGlobal('localStorage', createMemoryStorage());

const { useOrderStore } = await import('@/store/use-order');

const STORAGE_KEY = 'fastfood_cart';

function resetStore() {
  localStorage.removeItem(STORAGE_KEY);
  useOrderStore.setState({
    items: [],
    checkoutIdentity: { fullName: '', phoneNumber: '', email: '' },
  });
}

describe('useOrderStore persistence', () => {
  beforeEach(() => {
    resetStore();
  });

  it('writes cart items through to localStorage', () => {
    useOrderStore.getState().addItem({ productId: 1, name: 'Burger', price: '8.99', quantity: 2 });

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const envelope = JSON.parse(raw as string) as {
      state: { items: unknown[] };
      version: number;
    };
    expect(envelope.version).toBe(1);
    expect(envelope.state.items).toEqual([
      { productId: 1, name: 'Burger', price: '8.99', quantity: 2 },
    ]);
  });

  it('persists the checkout identity to storage', () => {
    useOrderStore
      .getState()
      .setCheckoutIdentity({ fullName: 'Jane', phoneNumber: '123', email: 'j@e.com' });

    // Storage is the reload boundary: whatever lands here survives.
    const raw = localStorage.getItem(STORAGE_KEY);
    const envelope = JSON.parse(raw as string) as {
      state: { checkoutIdentity: unknown };
    };
    expect(envelope.state.checkoutIdentity).toEqual({
      fullName: 'Jane',
      phoneNumber: '123',
      email: 'j@e.com',
    });
  });

  it('rehydrates cart items stored by a previous session', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          items: [{ productId: 5, name: 'Salad', price: '6.99', quantity: 1 }],
          checkoutIdentity: { fullName: 'Jane', phoneNumber: '123', email: '' },
        },
        version: 1,
      })
    );

    await useOrderStore.persist.rehydrate();

    expect(useOrderStore.getState().items).toEqual([
      { productId: 5, name: 'Salad', price: '6.99', quantity: 1 },
    ]);
    expect(useOrderStore.getState().checkoutIdentity).toEqual({
      fullName: 'Jane',
      phoneNumber: '123',
      email: '',
    });
  });

  it('falls back to empty state on corrupt storage', async () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');

    await useOrderStore.persist.rehydrate();

    expect(useOrderStore.getState().items).toEqual([]);
    expect(useOrderStore.getState().checkoutIdentity).toEqual({
      fullName: '',
      phoneNumber: '',
      email: '',
    });
    // Hydration must complete (not hang the /order skeleton gate) and the
    // malformed payload must be evicted so the next load starts clean.
    expect(useOrderStore.persist.hasHydrated()).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clearOrder empties the persisted cart', () => {
    useOrderStore.getState().addItem({ productId: 1, name: 'Burger', price: '8.99', quantity: 1 });
    useOrderStore.getState().clearOrder();

    expect(useOrderStore.getState().items).toEqual([]);
    const raw = localStorage.getItem(STORAGE_KEY);
    const envelope = JSON.parse(raw as string) as { state: { items: unknown[] } };
    expect(envelope.state.items).toEqual([]);
  });
});
