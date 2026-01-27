import type { InferSelectModel } from 'drizzle-orm';
import type { users, roles } from '@/db/schema';

export enum USER_ROLES {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export type User = InferSelectModel<typeof users>;
export type Role = InferSelectModel<typeof roles>;

export type UserWithRoles = User & { roles: Role[] };
