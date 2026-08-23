import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/db/drizzle', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    transaction: vi.fn(),
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

type OrderInsert = {
  userId: string;
  total: string;
  trackingCode: string;
  contactName: string;
  contactPhone: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  orderType?: string;
  paymentMethod?: string;
};

/**
 * Mocks `db.transaction()`: the orders table gets `.returning()`, auxiliary
 * tables resolve directly. Returns every captured orders-row for assertions.
 */
function mockInserts(returningQueue: Array<Record<string, string> | Error>) {
  const insertedOrders: OrderInsert[] = [];
  let attempt = 0;

  const txInsert = vi.fn((table: unknown) => {
    if (table !== orders) return { values: () => Promise.resolve([]) };
    return {
      values: (values: OrderInsert) => {
        insertedOrders.push(values);
        const outcome = returningQueue[Math.min(attempt++, returningQueue.length - 1)];
        return {
          returning: () =>
            outcome instanceof Error ? Promise.reject(outcome) : Promise.resolve([outcome]),
        };
      },
    };
  });

  const transaction = dbMock.transaction as unknown as ReturnType<typeof vi.fn>;
  transaction.mockImplementation((callback: (tx: { insert: typeof txInsert }) => unknown) =>
    callback({ insert: txInsert })
  );

  return insertedOrders;
}

const createdRow = {
  id: 'o1',
  total: '25.50',
  orderType: 'pickup',
  paymentMethod: 'cash',
  trackingCode: 'FF-ABC23456',
};

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
    const inserted = mockInserts([createdRow]);

    const result = await createIntakeOrder(intakeInput());

    expect(inserted[0].total).toBe('25.50');
    expect(result.total).toBe('25.50');
    expect(findOrCreatePersonMock).toHaveBeenCalledWith(intakeInput().person);
  });

  it('stamps the contact snapshot and blanks non-delivery fields', async () => {
    const inserted = mockInserts([createdRow]);

    await createIntakeOrder(intakeInput({ deliveryNotes: 'leave at door' }));

    expect(inserted[0]).toMatchObject({
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
    const inserted = mockInserts([{ ...createdRow, trackingCode: 'FF-DEF34567' }]);
    mockCatalog([{ id: 1, price: '10.00' }]);

    await createIntakeOrder(
      intakeInput({
        items: [{ productId: 1, quantity: 1 }],
        orderType: 'delivery',
        deliveryAddress: 'Calle Falsa 123',
        deliveryNotes: 'timbre 2',
      })
    );

    expect(inserted[0]).toMatchObject({
      deliveryAddress: 'Calle Falsa 123',
      deliveryNotes: 'timbre 2',
    });
  });

  it('rejects unknown products instead of guessing a total', async () => {
    mockCatalog([{ id: 1, price: '10.00' }]);

    await expect(createIntakeOrder(intakeInput())).rejects.toThrow(/Invalid product IDs: 2/);
  });

  it('retries the tracking code when the unique index collides', async () => {
    const inserted = mockInserts([
      Object.assign(new Error('duplicate tracking'), { code: '23505' }),
      createdRow,
    ]);

    const result = await createIntakeOrder(intakeInput());

    expect(inserted).toHaveLength(2);
    expect(result.trackingCode).toBe(inserted[1].trackingCode);
    expect(result.trackingCode).toMatch(TRACKING_CODE_PATTERN);
    expect(inserted[0].trackingCode).not.toBe(inserted[1].trackingCode);
  });
});
