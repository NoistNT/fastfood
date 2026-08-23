import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/db/drizzle', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    batch: vi.fn(),
  },
}));

vi.mock('@/modules/users/persons', () => ({
  findOrCreatePerson: vi.fn(),
}));

import { db } from '@/db/drizzle';
import { orders } from '@/db/schema';
import { TRACKING_CODE_PATTERN } from '@/lib/tracking-code';
import { createIntakeOrder, type IntakeOrderInput } from '@/modules/orders/actions/intake';
import { findOrCreatePerson } from '@/modules/users/persons';

const dbMock = vi.mocked(db);
const findOrCreatePersonMock = vi.mocked(findOrCreatePerson);

const person = {
  id: 'p1',
  name: 'Ana',
  email: null,
  phoneNumber: '5491123456789',
  hasCredentials: false,
};

interface OrderValues {
  id?: string;
  userId?: string;
  total?: string;
  trackingCode?: string;
  contactName?: string;
  contactPhone?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  orderType?: string;
  paymentMethod?: string;
}

function intakeInput(overrides: Partial<IntakeOrderInput> = {}): IntakeOrderInput {
  return {
    person: { name: 'Ana', phoneNumber: '5491123456789' },
    items: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
    orderType: 'pickup',
    paymentMethod: 'cash',
    ...overrides,
  };
}

/** Catalog rows returned by the price lookup; queued per test. */
function mockCatalog(rows: { id: number; price: string }[]) {
  dbMock.select.mockImplementation(
    () =>
      ({
        from: () => ({ where: () => Promise.resolve(rows) }),
      }) as never
  );
}

/**
 * Records every `values()` payload per table and mocks `db.batch()` as the
 * atomic unit: first attempt optionally rejects (e.g. tracking collision).
 */
function mockAtomicWrites(failingAttempt?: Error) {
  const batches: unknown[][] = [];
  const ordersValues: OrderValues[] = [];
  const dependentValues: { orderId: string }[] = [];
  let attempt = 0;

  const insert = vi.fn((table: unknown) => ({
    values: (values: Record<string, unknown>) => {
      if (table === orders) {
        ordersValues.push(values);
      } else if (Array.isArray(values)) {
        dependentValues.push(...(values as { orderId: string }[]));
      } else {
        dependentValues.push(values as { orderId: string });
      }
      return { table };
    },
  }));

  dbMock.insert.mockImplementation(insert as never);
  dbMock.batch.mockImplementation(((queries: unknown[]) => {
    batches.push(queries);
    if (attempt === 0 && failingAttempt) {
      attempt += 1;
      return Promise.reject(failingAttempt);
    }
    return Promise.resolve(queries.map(() => []));
  }) as never);

  return { batches, ordersValues, dependentValues };
}

describe('createIntakeOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findOrCreatePersonMock.mockResolvedValue(person);
    mockCatalog([
      { id: 1, price: '10.00' },
      { id: 2, price: '5.50' },
    ]);
  });

  it('computes the total server-side from catalog prices', async () => {
    const { ordersValues } = mockAtomicWrites();

    const result = await createIntakeOrder(intakeInput());

    expect(ordersValues[0].total).toBe('25.50');
    expect(result.total).toBe('25.50');
    expect(findOrCreatePersonMock).toHaveBeenCalledWith(intakeInput().person);
  });

  it('persists order, status history and items in one atomic batch', async () => {
    const { batches, ordersValues, dependentValues } = mockAtomicWrites();

    const result = await createIntakeOrder(intakeInput());

    expect(batches[0]).toHaveLength(3);
    expect(ordersValues[0].id).toBe(result.id);
    expect(dependentValues).toHaveLength(3);
    expect(dependentValues.every((value) => value.orderId === result.id)).toBe(true);
  });

  it('stamps the contact snapshot and blanks non-delivery fields', async () => {
    const { ordersValues } = mockAtomicWrites();

    await createIntakeOrder(intakeInput({ deliveryNotes: 'leave at door' }));

    expect(ordersValues[0]).toMatchObject({
      userId: person.id,
      contactName: 'Ana',
      contactPhone: '5491123456789',
      deliveryAddress: '',
      deliveryNotes: '',
      orderType: 'pickup',
      paymentMethod: 'cash',
    });
  });

  it('keeps delivery fields only on delivery orders', async () => {
    const { ordersValues } = mockAtomicWrites();
    mockCatalog([{ id: 1, price: '10.00' }]);

    await createIntakeOrder(
      intakeInput({
        items: [{ productId: 1, quantity: 1 }],
        orderType: 'delivery',
        deliveryAddress: 'Calle Falsa 123',
        deliveryNotes: 'timbre 2',
      })
    );

    expect(ordersValues[0]).toMatchObject({
      deliveryAddress: 'Calle Falsa 123',
      deliveryNotes: 'timbre 2',
    });
  });

  it('rejects unknown products instead of guessing a total', async () => {
    mockCatalog([{ id: 1, price: '10.00' }]);
    mockAtomicWrites();

    await expect(createIntakeOrder(intakeInput())).rejects.toThrow(/Invalid product IDs: 2/);
  });

  it('retries with a fresh unit when the batch collides on tracking code', async () => {
    const { batches, ordersValues } = mockAtomicWrites(
      Object.assign(new Error('duplicate tracking'), { code: '23505' })
    );

    const result = await createIntakeOrder(intakeInput());

    expect(batches).toHaveLength(2);
    expect(result.trackingCode).toMatch(TRACKING_CODE_PATTERN);
    expect(ordersValues[0].trackingCode).not.toBe(ordersValues[1].trackingCode);
    expect(ordersValues[0].id).not.toBe(ordersValues[1].id);
  });

  it('gives up after the configured attempts when collisions persist', async () => {
    let attempts = 0;
    dbMock.batch.mockImplementation((() => {
      attempts += 1;
      return Promise.reject(Object.assign(new Error('dup'), { code: '23505' }));
    }) as never);

    await expect(createIntakeOrder(intakeInput())).rejects.toThrow(/Could not allocate/i);
    expect(attempts).toBe(5);
  });
});
