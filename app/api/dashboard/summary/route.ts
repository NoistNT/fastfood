import { sql, desc, count } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { orders, users, products } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

export async function GET() {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
    }

    // Get total counts
    const [orderStats] = await db
      .select({
        totalOrders: count(),
        totalRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders);

    const [customerStats] = await db
      .select({
        totalCustomers: count(),
      })
      .from(users)
      .where(sql`${users.deletedAt} IS NULL`);

    const [productStats] = await db
      .select({
        totalProducts: count(),
      })
      .from(products);

    // Get recent orders for the dashboard
    const recentOrdersData = await db
      .select({
        id: orders.id,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    // Convert total to number for each order
    const recentOrders = recentOrdersData.map((order) => ({
      ...order,
      total: Number(order.total),
    }));

    return apiSuccess({
      totalRevenue: Number(orderStats?.totalRevenue) || 0,
      totalOrders: Number(orderStats?.totalOrders) || 0,
      totalCustomers: Number(customerStats?.totalCustomers) || 0,
      totalProducts: Number(productStats?.totalProducts) || 0,
      recentOrders,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch dashboard data', { status: 500 });
  }
}
