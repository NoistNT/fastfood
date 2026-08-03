import { getSession } from '@/lib/auth/session';

export type AdminGuardResult =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getSession>>> }
  | { ok: false; reason: 'unauthorized' | 'forbidden' };

/**
 * Guards an admin-only operation. Returns the authenticated user when the
 * request comes from a signed-in user holding the `admin` role, otherwise a
 * falsy result with a `reason` so the caller can respond with 401 (no session)
 * or 403 (authenticated but not admin).
 *
 * The `/api` routes are excluded from middleware protection, so every
 * admin mutation must enforce its own authorization.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const user = await getSession();
  if (!user) return { ok: false, reason: 'unauthorized' };

  const isAdmin = user.roles.some((role) => role.name === 'admin');
  if (!isAdmin) return { ok: false, reason: 'forbidden' };

  return { ok: true, user };
}
