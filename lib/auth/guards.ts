import { hasOperationalRole } from '@/lib/auth/roles';
import { getSession } from '@/lib/auth/session';

export type RoleGuardResult =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getSession>>> }
  | { ok: false; reason: 'unauthorized' | 'forbidden' };

/** Backwards-compatible alias for the original admin-only guard result. */
export type AdminGuardResult = RoleGuardResult;

/**
 * Guards an admin-only operation. Returns the authenticated user when the
 * request comes from a signed-in user holding the `admin` role, otherwise a
 * falsy result with a `reason` so the caller can respond with 401 (no session)
 * or 403 (authenticated but not admin).
 *
 * The `/api` routes are excluded from middleware protection, so every
 * admin mutation must enforce its own authorization.
 */
export async function requireAdmin(): Promise<RoleGuardResult> {
  const user = await getSession();
  if (!user) return { ok: false, reason: 'unauthorized' };

  const isAdmin = user.roles.some((role) => role.name === 'admin');
  if (!isAdmin) return { ok: false, reason: 'forbidden' };

  return { ok: true, user };
}

/**
 * Guards an operational (staff or admin) operation — e.g. order intake and
 * customer lookup. Same contract as `requireAdmin`.
 */
export async function requireOperationalRole(): Promise<RoleGuardResult> {
  const user = await getSession();
  if (!user) return { ok: false, reason: 'unauthorized' };

  if (!hasOperationalRole(user.roles)) return { ok: false, reason: 'forbidden' };

  return { ok: true, user };
}
