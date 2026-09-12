import { beforeEach, describe, expect, it, vi } from 'vitest';

const catalogRows = vi.fn();

vi.mock('@/db/drizzle', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: async () => catalogRows(),
      }),
    }),
  },
}));

import { computeOrderTotal } from '@/modules/orders/pricing';

describe('computeOrderTotal', () => {
  beforeEach(() => {
    catalogRows.mockReset();
    catalogRows.mockResolvedValue([
      { id: 1, price: '10.50' },
      { id: 2, price: '2.00' },
    ]);
  });

  it('computes totals from catalog prices only', async () => {
    const total = await computeOrderTotal([
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 3 },
    ]);

    expect(total).toBe('27.00');
  });

  it('sums repeated line items for the same product', async () => {
    const total = await computeOrderTotal([
      { productId: 2, quantity: 1 },
      { productId: 2, quantity: 4 },
    ]);

    expect(total).toBe('10.00');
  });

  it('rejects unknown product ids', async () => {
    await expect(computeOrderTotal([{ productId: 99, quantity: 1 }])).rejects.toThrow(
      /Invalid product IDs/
    );
  });
});
