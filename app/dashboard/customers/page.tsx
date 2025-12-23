import { eq, like, or, isNull, and } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users, userRoles, roles } from '@/db/schema';
import { CustomersDashboard } from '@/modules/dashboard/components/customers-dashboard';

type CustomerWithRoles = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  roles: string[];
};

export async function getCustomers(search?: string): Promise<CustomerWithRoles[]> {
  const searchCondition = search
    ? or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
    : undefined;

  const where = and(isNull(users.deletedAt), searchCondition);

  const customers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phoneNumber: users.phoneNumber,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      roles: roles.name,
    })
    .from(users)
    .leftJoin(userRoles, eq(users.id, userRoles.userId))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(where)
    .orderBy(users.createdAt);

  // Group by user to handle multiple roles
  const userMap = new Map();
  customers.forEach((user) => {
    if (!userMap.has(user.id)) {
      userMap.set(user.id, {
        ...user,
        roles: user.roles ? [user.roles] : [],
      });
    } else {
      if (user.roles) {
        userMap.get(user.id).roles.push(user.roles);
      }
    }
  });

  return Array.from(userMap.values());
}

export async function getCustomerById(id: string): Promise<CustomerWithRoles | null> {
  const customers = await getCustomers();

  return customers.find((customer) => customer.id === id) ?? null;
}

interface Props {
  searchParams: Promise<{ search?: string }>;
}

export default async function CustomersPage({ searchParams }: Props) {
  const { search } = await searchParams;
  const customers = await getCustomers(search);

  return (
    <CustomersDashboard
      initialCustomers={customers}
      initialSearch={search}
    />
  );
}
