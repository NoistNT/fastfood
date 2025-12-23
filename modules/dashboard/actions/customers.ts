'use server';

import { revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users, userRoles, roles } from '@/db/schema';

export async function updateUserRole(formData: FormData) {
  const userId = formData.get('userId') as string;
  const roleName = formData.get('roleName') as string;
  const t = await getTranslations('Dashboard.customers');

  try {
    // Find role
    const roleResult = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    if (roleResult.length === 0) {
      throw new Error(t('roleNotFound'));
    }
    const role = roleResult[0];

    // Remove existing roles
    await db.delete(userRoles).where(eq(userRoles.userId, userId));

    // Add new role
    await db.insert(userRoles).values({ userId, roleId: role.id });

    revalidateTag('customers', 'max');
  } catch (_error) {
    throw new Error(t('updateFailed'));
  }
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get('userId') as string;
  const t = await getTranslations('Dashboard.customers');

  try {
    // Soft delete
    await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, userId));
    revalidateTag('customers', 'max');
  } catch (_error) {
    throw new Error(t('deleteFailed'));
  }
}
