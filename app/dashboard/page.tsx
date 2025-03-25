import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/modules/core/ui/table';
import { findAll } from '@/modules/orders/actions/actions';
import { OrdersRow } from '@/modules/orders/components/orders-row';

export default async function Page() {
  const ordersWithItems = await findAll();

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-1 flex-col py-8 px-1.5">
      <h1 className="text-lg md:text-xl font-medium text-primary tracking-tighter mb-4 md:mb-5">
        Orders Dashboard
      </h1>
      <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-gradient-to-r from-pink-100 to-violet-200 dark:from-indigo-950 dark:to-purple-950 tracking-tight">
            <TableRow>
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
