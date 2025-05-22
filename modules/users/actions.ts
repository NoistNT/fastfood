'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import type { User } from '@/modules/users/types';

export const findAllUsers = async (): Promise<User[]> => {
  return await db.query.users.findMany();
};

export const findUserById = async (id: string) => {
  return await db.query.users.findFirst({ where: eq(users.id, id) });
};

export const createUser = async (
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
): Promise<User> => {
  const [newUser] = await db.insert(users).values(user).returning();
  return newUser;
};

export const updateUser = async (
  id: string,
  user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<User | null> => {
  const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
  return updatedUser;
};

export const deleteUser = async (id: string): Promise<void> => {
  await db.delete(users).where(eq(users.id, id));
};
