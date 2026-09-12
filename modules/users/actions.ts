'use server';

import type { User } from '@/modules/users/types';

import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users } from '@/db/schema';

// Never serialize credential material to clients: every user read projects
// these columns explicitly instead of spreading the full row.
const safeUserColumns = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  lastLoginAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

// User rows cross the server/client boundary (profile pages are server
// components rendering client islands) — the hash must never be among them.
export type SafeUser = Omit<User, 'passwordHash'>;

export const findAllUsers = async (): Promise<SafeUser[]> => {
  return await db.query.users.findMany({ columns: safeUserColumns });
};

export const findUserById = async (id: string) => {
  return await db.query.users.findFirst({ columns: safeUserColumns, where: eq(users.id, id) });
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
