import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/core/ui/table'
import { OrdersRow } from '@/modules/dashboard/components/orders-row'
import { findAll } from '@/modules/orders/actions/actions'

export default async function Page() {
  const ordersWithItems = await findAll()

  return (
    <div className="mx-auto max-w-5xl">
      <Table className="border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900">
        <TableHeader className="bg-neutral-200 dark:bg-neutral-800">
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
  )
}
