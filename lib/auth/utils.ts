import { getSession } from '@/lib/auth/session';

export const hasRole = async (roleName: string) => {
  const session = await getSession();
  if (!session || !session.roles) return false;
  return session.roles.some((role) => role.name === roleName);
};
