import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/db/drizzle', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

import { db } from '@/db/drizzle';
import { escapeLikePattern, findOrCreatePerson, findPersonByPhone } from '@/modules/users/persons';

const dbMock = vi.mocked(db);

interface PersonRow {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  passwordHash: string | null;
}

const row = (overrides: Partial<PersonRow> = {}): PersonRow => ({
  id: 'p1',
  name: 'Ana',
  email: null,
  phoneNumber: '5491123456789',
  passwordHash: null,
  ...overrides,
});

/** Queues result sets consumed in order by successive `.limit()` calls. */
function mockSelectQueues(queues: PersonRow[][]) {
  let index = 0;
  const limit = vi.fn(() => Promise.resolve(queues[Math.min(index++, queues.length - 1)]));
  dbMock.select.mockImplementation(
    () =>
      ({
        from: () => ({ where: () => ({ limit }) }),
      }) as never
  );
  return limit;
}

function mockInsertReturning(rows: PersonRow[], error?: unknown) {
  dbMock.insert.mockImplementation(
    () =>
      ({
        values: () => ({
          returning: () => (error ? Promise.reject(error) : Promise.resolve(rows)),
        }),
      }) as never
  );
}

describe('escapeLikePattern', () => {
  it('literalizes LIKE metacharacters', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
    expect(escapeLikePattern('ana_maria')).toBe('ana\\_maria');
    expect(escapeLikePattern('back\\slash')).toBe('back\\\\slash');
    expect(escapeLikePattern('plain')).toBe('plain');
  });
});

describe('findOrCreatePerson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reuses the person matched by normalized phone without inserting', async () => {
    mockSelectQueues([[row({ passwordHash: 'hash' })]]);

    const person = await findOrCreatePerson({
      name: 'Ana',
      phoneNumber: '+54 9 11 2345-6789',
    });

    expect(person).toEqual({
      id: 'p1',
      name: 'Ana',
      email: null,
      phoneNumber: '5491123456789',
      hasCredentials: true,
    });
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it('creates a record-only person when the phone is unknown', async () => {
    mockSelectQueues([[]]);
    mockInsertReturning([row()]);

    const person = await findOrCreatePerson({ name: 'Ana', phoneNumber: '11-2345-6789' });

    expect(person.hasCredentials).toBe(false);
    expect(dbMock.insert).toHaveBeenCalledTimes(1);
  });

  it('recovers from a concurrent-insert race on the phone unique index', async () => {
    mockSelectQueues([[], [row()]]);
    mockInsertReturning([], Object.assign(new Error('duplicate key'), { code: '23505' }));

    const person = await findOrCreatePerson({ name: 'Ana', phoneNumber: '5491123456789' });

    expect(person.id).toBe('p1');
    expect(dbMock.select).toHaveBeenCalledTimes(2);
  });

  it('without a phone, reuses only a record-only exact-name match', async () => {
    mockSelectQueues([[row({ phoneNumber: null })]]);

    const person = await findOrCreatePerson({ name: 'ANA', phoneNumber: null });

    expect(person.id).toBe('p1');
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it('falls back to creating a new person when the name-only match misses', async () => {
    mockSelectQueues([[]]);
    mockInsertReturning([row({ id: 'p2' })]);

    const person = await findOrCreatePerson({ name: 'Ana', phoneNumber: null });

    expect(person.id).toBe('p2');
    expect(dbMock.insert).toHaveBeenCalledTimes(1);
  });

  it('refuses to create a person without any name', async () => {
    mockSelectQueues([[]]);

    await expect(findOrCreatePerson({ phoneNumber: '5491123456789' })).rejects.toThrow(
      /name is required/i
    );
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it('returns null when the phone lookup has nothing to match', async () => {
    await expect(findPersonByPhone('   ')).resolves.toBe(null);
    expect(dbMock.select).not.toHaveBeenCalled();
  });
});
