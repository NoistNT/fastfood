import { and, eq, ilike, isNull, like, or } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { isUniqueViolation } from '@/lib/db-errors';
import { normalizePhoneNumber } from '@/lib/phone';
import { recordOnlyNameReuseCondition } from '@/modules/users/person-filters';

export interface PersonInput {
  name?: string | null;
  phoneNumber?: string | null;
}

/**
 * Client-safe projection of a person row. The credential material never
 * leaves the server; callers only learn whether credentials exist.
 */
export interface PersonRecord {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  hasCredentials: boolean;
}

const personColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  phoneNumber: users.phoneNumber,
  passwordHash: users.passwordHash,
};

type PersonRow = {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  passwordHash: string | null;
};

function toPersonRecord(row: PersonRow): PersonRecord {
  const { passwordHash, ...rest } = row;
  return { ...rest, hasCredentials: passwordHash !== null };
}

/** Finds a non-deleted person by normalized phone number, or null. */
export async function findPersonByPhone(
  phoneNumber: string | null | undefined
): Promise<PersonRecord | null> {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) return null;

  const [row] = await db
    .select(personColumns)
    .from(users)
    .where(and(eq(users.phoneNumber, normalized), isNull(users.deletedAt)))
    .limit(1);

  return row ? toPersonRecord(row) : null;
}

/** Literalizes SQL LIKE metacharacters so user input matches itself only. */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/**
 * Full-text-ish lookup for the intake customer picker: case-insensitive
 * partial match on name, plus partial match on the normalized phone digits
 * when the query contains any.
 */
export async function searchPersons(query: string, limit = 8): Promise<PersonRecord[]> {
  const digits = normalizePhoneNumber(query);
  const pattern = `%${escapeLikePattern(query)}%`;
  const conditions = [ilike(users.name, pattern)];
  if (digits) conditions.push(like(users.phoneNumber, `%${digits}%`));

  const rows = await db
    .select(personColumns)
    .from(users)
    .where(and(isNull(users.deletedAt), or(...conditions)))
    .orderBy(users.name)
    .limit(limit);

  return rows.map(toPersonRecord);
}

/**
 * Single dedupe entry point shared by staff intake and checkout:
 * a normalized-phone match always wins; without a phone, an exact-name
 * record-only person may be reused; otherwise a new record-only person
 * (null passwordHash) is created.
 *
 * Name-only reuse is deliberately conservative to avoid attaching orders to
 * the wrong real account — duplicates get merged by the directory tool.
 */
export async function findOrCreatePerson(input: PersonInput): Promise<PersonRecord> {
  const normalized = normalizePhoneNumber(input.phoneNumber);
  const name = input.name?.trim() ?? '';

  if (normalized) {
    const existing = await findPersonByPhone(normalized);
    if (existing) return existing;
  }

  if (!normalized && name) {
    const [row] = await db
      .select(personColumns)
      .from(users)
      .where(recordOnlyNameReuseCondition(name))
      .limit(1);

    if (row) return toPersonRecord(row);
  }

  if (!name) throw new Error('A name is required to create a person');

  try {
    const [created] = await db
      .insert(users)
      .values({ name, phoneNumber: normalized || null })
      .returning(personColumns);
    return toPersonRecord(created);
  } catch (error) {
    // A concurrent insert raced the partial unique index on phone_number;
    // the winner of that race is the person we wanted all along.
    if (normalized && isUniqueViolation(error)) {
      const raced = await findPersonByPhone(normalized);
      if (raced) return raced;
    }
    throw error;
  }
}
