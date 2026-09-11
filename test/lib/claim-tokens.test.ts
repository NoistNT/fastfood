import { beforeEach, describe, expect, it, vi } from 'vitest';

const selectRows: unknown[][] = [];
const updateRows: unknown[][] = [];
const insertedValues: unknown[] = [];

function makeSelectBuilder(rows: unknown[]) {
  const builder: any = {};
  builder.from = () => builder;
  builder.innerJoin = () => builder;
  builder.where = () => builder;
  builder.limit = async () => rows;
  builder.then = (resolve: any, reject: any) => Promise.resolve(rows).then(resolve, reject);
  return builder;
}

vi.mock('@/db/drizzle', () => ({
  db: {
    select: () => makeSelectBuilder(selectRows.shift() ?? []),
    insert: () => ({
      values: (values: unknown) => {
        insertedValues.push(values);
        return {};
      },
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: async () => updateRows.shift() ?? [],
        }),
      }),
    }),
  },
}));

import {
  consumeClaimToken,
  hashClaimToken,
  mintClaimToken,
  previewClaim,
} from '@/modules/users/claim-tokens';

const HEX64 = /^[0-9a-f]{64}$/;

describe('claim tokens', () => {
  beforeEach(() => {
    selectRows.length = 0;
    updateRows.length = 0;
    insertedValues.length = 0;
  });

  it('hashes deterministically to 64 hex chars', () => {
    const a = hashClaimToken('abc');
    expect(a).toMatch(HEX64);
    expect(hashClaimToken('abc')).toBe(a);
    expect(hashClaimToken('abd')).not.toBe(a);
  });

  it('mints a bearer token while storing only its hash', async () => {
    const token = await mintClaimToken('person-1');

    expect(token).toMatch(HEX64);
    expect(insertedValues).toHaveLength(1);
    const stored = insertedValues[0] as Record<string, unknown>;
    expect(stored.personId).toBe('person-1');
    expect(stored.tokenHash).toMatch(HEX64);
    expect(stored.tokenHash).not.toBe(token);
    const ttl = (stored.expiresAt as Date).getTime() - Date.now();
    expect(ttl).toBeGreaterThan(14 * 60 * 1000);
    expect(ttl).toBeLessThanOrEqual(15 * 60 * 1000);
  });

  it('previews a live claim as a client-safe snapshot', async () => {
    selectRows.push([{ personId: 'person-1', name: 'Ana', email: null, phoneNumber: '54911' }]);

    const preview = await previewClaim('f'.repeat(64));

    expect(preview).toEqual({
      personId: 'person-1',
      name: 'Ana',
      email: null,
      phoneNumber: '54911',
    });
  });

  it('rejects malformed tokens without touching the database', async () => {
    expect(await previewClaim('not-a-token')).toBeNull();
    expect(await consumeClaimToken('')).toBeNull();
    expect(selectRows).toHaveLength(0);
  });

  it('returns null for expired, used, or unknown claims', async () => {
    selectRows.push([]);
    expect(await previewClaim('f'.repeat(64))).toBeNull();
  });

  it('consumes a live token exactly once', async () => {
    updateRows.push([{ personId: 'person-1' }]);
    expect(await consumeClaimToken('f'.repeat(64))).toBe('person-1');

    updateRows.push([]);
    expect(await consumeClaimToken('f'.repeat(64))).toBeNull();
  });
});
