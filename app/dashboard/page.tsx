import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/modules/core/ui/table';
import { OrdersRow } from '@/modules/dashboard/components/orders-row';
import { findAll } from '@/modules/orders/actions/actions';

export default async function Page() {
  const ordersWithItems = await findAll();

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-1 flex-col py-8">
      <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-6">
        Orders Dashboard
      </h1>
      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
        <Table className="w-full bg-white dark:bg-neutral-900">
          <TableHeader className="sticky top-0 bg-neutral-100 dark:bg-neutral-800">
            <TableRow className="text-neutral-600 dark:text-neutral-400">
              <TableHead className="w-1/5">Status</TableHead>
              <TableHead className="w-1/5">Total</TableHead>
              <TableHead className="w-1/5">Time</TableHead>
              <TableHead className="w-1/5">Date</TableHead>
              <TableHead className="w-1/5">Details</TableHead>
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
