import { getSession } from '@/lib/auth/session';

export const hasRole = async (roleName: string) => {
  const session = await getSession();
  return !session?.roles ? false : session.roles.some((role) => role.name === roleName);
};
