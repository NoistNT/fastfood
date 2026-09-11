import crypto from 'crypto';

import { and, eq, gt, isNull } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { claimTokens, users } from '@/db/schema';

/** Short-lived by design: enough for a WhatsApp round-trip, useless to steal later. */
export const CLAIM_TOKEN_TTL_MS = 15 * 60 * 1000;

const TOKEN_FORMAT = /^[0-9a-f]{64}$/;

export interface ClaimPreview {
  personId: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
}

/** SHA-256 hex; only hashes rest in the table, never the bearer token. */
export function hashClaimToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function liveClaimCondition(tokenHash: string) {
  return and(
    eq(claimTokens.tokenHash, tokenHash),
    isNull(claimTokens.usedAt),
    gt(claimTokens.expiresAt, new Date())
  );
}

/** Mints a single-use bearer token for a person; returns the raw token once. */
export async function mintClaimToken(personId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await db.insert(claimTokens).values({
    tokenHash: hashClaimToken(token),
    personId,
    expiresAt: new Date(Date.now() + CLAIM_TOKEN_TTL_MS),
  });
  return token;
}

/**
 * Resolves a token to a client-safe person snapshot, or null when unknown,
 * expired, used, or attached to a deleted person. Read-only; consuming is a
 * separate atomic step. Expiry is lazy — no cron to operate.
 */
export async function previewClaim(token: string): Promise<ClaimPreview | null> {
  if (!TOKEN_FORMAT.test(token)) return null;
  const [row] = await db
    .select({
      personId: claimTokens.personId,
      name: users.name,
      email: users.email,
      phoneNumber: users.phoneNumber,
    })
    .from(claimTokens)
    .innerJoin(users, eq(claimTokens.personId, users.id))
    .where(and(liveClaimCondition(hashClaimToken(token)), isNull(users.deletedAt)))
    .limit(1);
  return row ?? null;
}

/**
 * Atomically consumes a token (conditional UPDATE … RETURNING, same pattern
 * as the inventory decrement): concurrent redeems cannot double-spend it.
 * Returns the person id, or null when the token is unknown, expired, or
 * already used.
 */
export async function consumeClaimToken(token: string): Promise<string | null> {
  if (!TOKEN_FORMAT.test(token)) return null;
  const [consumed] = await db
    .update(claimTokens)
    .set({ usedAt: new Date() })
    .where(liveClaimCondition(hashClaimToken(token)))
    .returning({ personId: claimTokens.personId });
  return consumed?.personId ?? null;
}
