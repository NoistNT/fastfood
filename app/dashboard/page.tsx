import type { OrderWithItems } from '@/modules/orders/types'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/modules/core/ui/table'
import { OrdersRow } from '@/modules/dashboard/components/orders-row'
import { findAll } from '@/modules/orders/actions/actions'

export default async function Page() {
  const orders: OrderWithItems[] = await findAll()

  return (
    <div className="mx-auto max-w-5xl">
      <Table className="border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
          <TableRow className="text-neutral-600 dark:text-neutral-400">
            <TableHead className="w-1/5">Estado</TableHead>
            <TableHead className="w-1/5">Total</TableHead>
            <TableHead className="w-1/5">Hora</TableHead>
            <TableHead className="w-1/5">Fecha</TableHead>
            <TableHead className="w-1/5">Detalles</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <OrdersRow key={Number(order.id)} order={order} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
