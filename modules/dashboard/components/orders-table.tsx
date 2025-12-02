import { getTranslations } from 'next-intl/server';

import { findAll } from '@/modules/orders/actions/actions';
import { OrdersRow } from '@/modules/orders/components/orders-row';
import { TableBody, TableCell, TableRow } from '@/modules/core/ui/table';

export default async function OrdersTable({ date }: { date: Date }) {
  const orders = await findAll(date);
  const t = await getTranslations('Dashboard');

  return orders.length > 0 ? (
    <TableBody>
      {orders.map((dashboardOrderWithItems) => (
        <OrdersRow
          key={dashboardOrderWithItems.order.id}
          orderWithItems={dashboardOrderWithItems}
        />
      ))}
    </TableBody>
  ) : (
    <TableBody>
      <TableRow>
        <TableCell
          colSpan={5}
          className="text-center text-base text-muted-foreground tracking-tighter"
        >
          {t('table.empty')}
        </TableCell>
      </TableRow>
    </TableBody>
  );
}
