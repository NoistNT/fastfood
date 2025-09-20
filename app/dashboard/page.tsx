import { getTranslations } from 'next-intl/server';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/modules/core/ui/table';
import { findAll } from '@/modules/orders/actions/actions';
import { OrdersRow } from '@/modules/orders/components/orders-row';

export default async function Page() {
  const ordersWithItems = await findAll();
  const t = await getTranslations('Dashboard');

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-1 flex-col py-8 px-1.5">
      <h1 className="text-lg md:text-xl font-medium text-primary tracking-tighter mb-4 md:mb-5">
        {t('title')}
      </h1>
      <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-gradient-to-r from-pink-100 to-violet-200 dark:from-indigo-950 dark:to-purple-950 tracking-tight">
            <TableRow>
              <TableHead className="w-1/5">{t('table.header.status')}</TableHead>
              <TableHead className="w-1/5">{t('table.header.total')}</TableHead>
              <TableHead className="w-1/5">{t('table.header.time')}</TableHead>
              <TableHead className="w-1/5">{t('table.header.date')}</TableHead>
              <TableHead className="w-1/5">{t('table.header.details')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersWithItems.map((orderWithItems) => (
              <OrdersRow
                key={Number(orderWithItems.order.id)}
                orderWithItems={orderWithItems}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
