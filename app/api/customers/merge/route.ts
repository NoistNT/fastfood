import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { and, count, eq, inArray, isNull } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { claimTokens, orders, roles, userRoles, users } from '@/db/schema';
import { apiError, apiSuccess, ERROR_CODES } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { errorMessage, logError } from '@/lib/log-error';

const mergeIdsSchema = z.object({
  winnerId: z.uuid('Invalid winner ID'),
  loserId: z.uuid('Invalid loser ID'),
});

const mergeBodySchema = mergeIdsSchema.refine((value) => value.winnerId !== value.loserId, {
  message: 'Cannot merge a person into themselves',
});

interface MergePerson {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  passwordHash: string | null;
}

async function loadLivePerson(id: string): Promise<MergePerson | null> {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phoneNumber: users.phoneNumber,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);
  return row ?? null;
}

async function roleIdsOf(personId: string): Promise<number[]> {
  const rows = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(eq(userRoles.userId, personId));
  return rows.map((row) => row.roleId);
}

function checkAdminGuard(guard: { ok: boolean; reason?: string }) {
  if (guard.ok) return null;
  return {
    reason: guard.reason === 'forbidden' ? ERROR_CODES.FORBIDDEN : ERROR_CODES.UNAUTHORIZED,
    message: guard.reason === 'forbidden' ? 'Forbidden' : 'Authentication required',
    status: guard.reason === 'forbidden' ? 403 : 401,
  } as const;
}

async function checkCsrf(request: Request) {
  const csrfToken = await getCSRFTokenFromRequest(request);
  if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
    return apiError(ERROR_CODES.CSRF_INVALID, 'Invalid CSRF token', { status: 403 });
  }
  return null;
}

/**
 * GET /api/customers/merge?winnerId=&loserId= — previews what a merge
 * would do without changing anything: order count moving, roles the winner
 * gains, contact fields that get filled, and the validation verdict.
 */
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    const denied = checkAdminGuard(guard);
    if (denied) {
      return apiError(denied.reason, denied.message, { status: denied.status });
    }

    const { winnerId, loserId } = mergeIdsSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    if (winnerId === loserId) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Cannot merge a person into themselves', {
        status: 400,
      });
    }

    const [winner, loser] = await Promise.all([loadLivePerson(winnerId), loadLivePerson(loserId)]);
    if (!winner || !loser) {
      return apiError(ERROR_CODES.NOT_FOUND, 'Person not found', { status: 404 });
    }
    if (loser.passwordHash) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Only record-only people can be merged away', {
        status: 400,
      });
    }

    const [winnerRoles, loserRoles, orderRows, tokenRows] = await Promise.all([
      roleIdsOf(winnerId),
      roleIdsOf(loserId),
      db.select({ value: count() }).from(orders).where(eq(orders.userId, loserId)),
      db.select({ value: count() }).from(claimTokens).where(eq(claimTokens.personId, loserId)),
    ]);
    const grantingIds = loserRoles.filter((roleId) => !winnerRoles.includes(roleId));
    const grantingNames =
      grantingIds.length > 0
        ? (
            await db.select({ name: roles.name }).from(roles).where(inArray(roles.id, grantingIds))
          ).map((row) => row.name)
        : [];

    return apiSuccess({
      winner: { id: winner.id, name: winner.name },
      loser: { id: loser.id, name: loser.name },
      ordersMoving: orderRows[0]?.value ?? 0,
      rolesGranting: grantingNames,
      tokensInvalidated: tokenRows[0]?.value ?? 0,
      fieldsFilling: [
        ...(!winner.email && loser.email ? (['email'] as const) : []),
        ...(!winner.phoneNumber && loser.phoneNumber ? (['phoneNumber'] as const) : []),
      ],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, error.issues[0].message, { status: 400 });
    }
    logError('customers', 'Merge preview failed', { cause: errorMessage(error) });
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to preview merge', { status: 500 });
  }
}

/**
 * POST /api/customers/merge — merges a duplicate (loser) into the surviving
 * identity (winner) in one atomic batch: orders repointed, roles unioned,
 * empty contact fields filled, loser claim tokens invalidated (soft-delete
 * does not cascade), loser soft-deleted. Loser must be record-only and
 * alive; duplicating credentials across identities is never allowed.
 * ADMIN only.
 */
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    const denied = checkAdminGuard(guard);
    if (denied) {
      return apiError(denied.reason, denied.message, { status: denied.status });
    }

    const csrfFailed = await checkCsrf(request);
    if (csrfFailed) return csrfFailed;

    const { winnerId, loserId } = mergeBodySchema.parse(await request.json());

    const [winner, loser] = await Promise.all([loadLivePerson(winnerId), loadLivePerson(loserId)]);
    if (!winner || !loser) {
      return apiError(ERROR_CODES.NOT_FOUND, 'Person not found', { status: 404 });
    }
    if (loser.passwordHash) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Only record-only people can be merged away', {
        status: 400,
      });
    }

    const [winnerRoles, loserRoles, orderRows] = await Promise.all([
      roleIdsOf(winnerId),
      roleIdsOf(loserId),
      db.select({ value: count() }).from(orders).where(eq(orders.userId, loserId)),
    ]);
    const rolesGranting = loserRoles.filter((roleId) => !winnerRoles.includes(roleId));
    const fieldsFilling = [
      ...(!winner.email && loser.email ? (['email'] as const) : []),
      ...(!winner.phoneNumber && loser.phoneNumber ? (['phoneNumber'] as const) : []),
    ];
    const fillPatch: { email?: string | null; phoneNumber?: string | null } = {};
    if (fieldsFilling.includes('email')) fillPatch.email = loser.email;
    if (fieldsFilling.includes('phoneNumber')) fillPatch.phoneNumber = loser.phoneNumber;

    await db.batch([
      db.update(orders).set({ userId: winnerId }).where(eq(orders.userId, loserId)),
      // No unique arbiter games: the UNIQUE(user_id, role_id) constraint
      // makes a repeated merge a harmless no-op instead of duplicating rows.
      ...(rolesGranting.length > 0
        ? [
            db
              .insert(userRoles)
              .values(rolesGranting.map((roleId) => ({ userId: winnerId, roleId })))
              .onConflictDoNothing(),
          ]
        : []),
      ...(fieldsFilling.length > 0
        ? [
            db
              .update(users)
              .set({ ...fillPatch, updatedAt: new Date() })
              .where(eq(users.id, winnerId)),
          ]
        : []),
      db.delete(claimTokens).where(eq(claimTokens.personId, loserId)),
      db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, loserId)),
    ]);

    return apiSuccess({
      merged: {
        winnerId,
        loserId,
        ordersMoved: orderRows[0]?.value ?? 0,
        rolesGranted: rolesGranting,
        fieldsFilled: fieldsFilling,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, error.issues[0].message, { status: 400 });
    }
    logError('customers', 'Person merge failed', { cause: errorMessage(error) });
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to merge people', { status: 500 });
  }
}
