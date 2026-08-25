import { beforeEach, describe, expect, it, vi } from 'vitest';

const selectResults: unknown[][] = [];
const insertedRows: unknown[][] = [];

vi.mock('@/db/drizzle', () => ({
  db: {
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
    insert: () => ({
      values: () => ({
        returning: async () => {
          const [rowOrError] = insertedRows.shift() ?? [];
          if (rowOrError instanceof Error) throw rowOrError;
          return [rowOrError];
        },
      }),
    }),
  },
}));

import { findOrCreatePerson } from '@/modules/users/persons';

const personRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  name: 'John Doe',
  email: null,
  phoneNumber: null,
  passwordHash: null,
  ...overrides,
});

describe('findOrCreatePerson dedupe precedence', () => {
  beforeEach(() => {
    selectResults.length = 0;
    insertedRows.length = 0;
  });

  it('returns the email match and consults nothing else', async () => {
    selectResults.push([personRow({ id: 'p-email', email: 'jhon_doe@gmail.com' })]);

    const person = await findOrCreatePerson({
      name: 'John Doe',
      phoneNumber: '+54 9 11 1111-1111',
      email: 'Jhon_Doe@Gmail.com',
    });

    expect(person.id).toBe('p-email');
    expect(selectResults).toHaveLength(0);
  });

  it('falls back to the phone match when the email is unknown', async () => {
    selectResults.push([], [personRow({ id: 'p-phone', phoneNumber: '+5491111111111' })]);

    const person = await findOrCreatePerson({
      name: 'John Doe',
      phoneNumber: '+54 9 11 1111-1111',
      email: 'new@example.com',
    });

    expect(person.id).toBe('p-phone');
    expect(selectResults).toHaveLength(0);
  });

  it('creates a fresh identity on email miss without name-based reuse', async () => {
    // Two selects (email, phone) both miss; creation must follow immediately.
    selectResults.push([], []);
    insertedRows.push([
      personRow({ id: 'p-new', email: 'jhondoe@gmail.com', phoneNumber: '+5491122222222' }),
    ]);

    const person = await findOrCreatePerson({
      name: 'John Doe',
      phoneNumber: '+54 9 11 2222-2222',
      email: 'jhondoe@gmail.com',
    });

    expect(person.id).toBe('p-new');
    expect(selectResults).toHaveLength(0);
  });

  it('keeps record-only exact-name reuse when neither email nor phone is given', async () => {
    selectResults.push([personRow({ id: 'p-name' })]);

    const person = await findOrCreatePerson({ name: 'John Doe' });

    expect(person.id).toBe('p-name');
    expect(selectResults).toHaveLength(0);
  });

  it('recovers a concurrent-insert race through the phone unique index', async () => {
    // Select #1: phone pre-check misses; select #2 (after the unique
    // violation) recovers the winner of the insert race.
    selectResults.push([], [personRow({ id: 'p-raced', phoneNumber: '+5491133333333' })]);
    insertedRows.push([Object.assign(new Error('duplicate key'), { code: '23505' })]);

    const person = await findOrCreatePerson({
      name: 'John Doe',
      phoneNumber: '+54 9 11 3333-3333',
    });

    expect(person.id).toBe('p-raced');
  });
});
