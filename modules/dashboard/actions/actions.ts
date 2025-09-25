import { sql } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { orders } from '@/db/schema';

export async function getTotalSales(date: Date) {
  if (!date) {
    return { totalSales: 0 };
  }

  const totalSales = await db
    .select({
      total: sql<number>`sum(${orders.total})`,
    })
    .from(orders)
    .where(sql`DATE(${orders.createdAt}) = ${date.toISOString().split('T')[0]}`);

  return { totalSales: totalSales[0].total || 0 };
}
