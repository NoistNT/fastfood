import type { OrderWithItems } from '@/modules/orders/types'

import { TableCell, TableRow } from '@/modules/core/ui/table'
import { ExpandableCell } from '@/modules/dashboard/components/expandable-cell'

interface OrderItemRowProps {
  orderWithItems: OrderWithItems
}

export function OrdersRow({
  orderWithItems: {
    order: { id, status, total, createdAt },
    items
  }
}: OrderItemRowProps) {
  return (
    <TableRow className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
      <TableCell className="w-1/5">{status}</TableCell>
      <TableCell className="w-1/5">${total}</TableCell>
      <TableCell className="w-1/5">{createdAt.toLocaleTimeString()}</TableCell>
      <TableCell className="w-1/5">{createdAt.toLocaleDateString()}</TableCell>
      <ExpandableCell id={id} items={items} />
    </TableRow>
  )
}
