import { USER_ROLES, type Role } from '@/types/auth';

/**
 * Roles that may operate /dashboard: ADMIN is the admin role, STAFF is the
 * always-present manager who runs daily operations.
 */
export const OPERATIONAL_ROLES: readonly USER_ROLES[] = [USER_ROLES.ADMIN, USER_ROLES.STAFF];

export function hasOperationalRole(roles?: Pick<Role, 'name'>[]): boolean {
  if (!roles) return false;
  return roles.some((role) => (OPERATIONAL_ROLES as readonly string[]).includes(role.name));
}

// Profile reads authorize by identity, not by URL: civilians see only
// themselves, operational roles (admin/staff) may view anyone — e.g. the
// dashboard customers flow. Everyone else gets notFound(), which also
// avoids confirming whether an id exists.
export function canViewProfile(
  viewer: { id: string; roles?: Pick<Role, 'name'>[] } | null,
  targetId: string
): boolean {
  if (!viewer) return false;
  if (viewer.id === targetId) return true;
  return hasOperationalRole(viewer.roles);
}
