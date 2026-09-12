import { beforeEach, describe, expect, it, vi } from 'vitest';

const executeMock = vi.fn();
const selectResults: unknown[][] = [];

vi.mock('@/db/drizzle', () => ({
  db: {
    execute: (...args: unknown[]) => executeMock(...args),
    select: () => {
      const rows = selectResults.shift() ?? [];
      const builder = {
        from: () => builder,
        where: () => builder,
        limit: async () => rows,
        then: (resolve: (rows: unknown[]) => unknown, reject: (e: unknown) => unknown) =>
          Promise.resolve(rows).then(resolve, reject),
      };
      return builder;
    },
  },
}));

import { deductInventoryForOrder } from '@/lib/inventory-management';

describe('deductInventoryForOrder', () => {
  beforeEach(() => {
    executeMock.mockReset();
    selectResults.length = 0;
  });

  it('deducts stock and records the movement in one atomic statement', async () => {
    selectResults.push([{ productId: 7, quantity: 2 }], [{ ingredientId: 3 }]);
    executeMock.mockResolvedValue({ rows: [{ id: 'movement-1' }] });

    const result = await deductInventoryForOrder('order-1');

    expect(result).toEqual({ shortfalls: [] });
    // Decrement + movement must be a single statement — no window between them.
    expect(executeMock).toHaveBeenCalledTimes(1);
  });

  it('reports a shortfall and records nothing when stock is insufficient', async () => {
    selectResults.push([{ productId: 7, quantity: 2 }], [{ ingredientId: 3 }], [{ quantity: 1 }]);
    executeMock.mockResolvedValue({ rows: [] });

    const result = await deductInventoryForOrder('order-1');

    expect(result).toEqual({
      shortfalls: [{ ingredientId: 3, requested: 2, available: 1 }],
    });
    expect(executeMock).toHaveBeenCalledTimes(1);
  });

  it('propagates statement failures without leaking error details', async () => {
    selectResults.push([{ productId: 7, quantity: 2 }], [{ ingredientId: 3 }]);
    executeMock.mockRejectedValue(new Error('db down'));

    await expect(deductInventoryForOrder('order-1')).rejects.toThrow('Inventory deduction failed');
  });
});
