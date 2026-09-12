import { sql } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { orders } from '@/db/schema';
import { getBusinessTimeZone, toBusinessDateKey } from '@/lib/dates';

export async function getTotalSales(date: Date) {
  if (!date) return { totalSales: 0 };

  // Business-day comparison (same naive-wall reasoning as the charts feed:
  // declare UTC first, then convert). The key is the business day
  // containing the passed instant.
  const timeZone = getBusinessTimeZone();
  const dayKey = toBusinessDateKey(date);

  const totalSales = await db
    .select({ total: sql<number>`sum(${orders.total})` })
    .from(orders)
    .where(sql`DATE(${orders.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE ${timeZone}) = ${dayKey}`);

  return { totalSales: totalSales[0].total || 0 };
}
