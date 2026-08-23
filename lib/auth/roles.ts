import { USER_ROLES, type Role } from '@/types/auth';

/**
 * Roles that may operate /dashboard: ADMIN is an owner, STAFF is the
 * always-present manager who runs daily operations.
 */
export const OPERATIONAL_ROLES: readonly USER_ROLES[] = [USER_ROLES.ADMIN, USER_ROLES.STAFF];

export function hasOperationalRole(roles?: Pick<Role, 'name'>[]): boolean {
  if (!roles) return false;
  return roles.some((role) => (OPERATIONAL_ROLES as readonly string[]).includes(role.name));
}
