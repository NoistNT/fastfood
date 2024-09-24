import type { OrderWithItems } from '@/modules/orders/types'

import { TableCell, TableRow } from '@/modules/core/ui/table'
import { ExpandableCell } from '@/modules/dashboard/components/expandable-cell'

interface OrderItemRowProps {
  key: number
  order: OrderWithItems
}

export function OrdersRow({
  key,
  order: { id, total, status, createdAt, items }
}: OrderItemRowProps) {
  return (
    <TableRow
      key={key}
      className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <TableCell className="w-1/5">{status}</TableCell>
      <TableCell className="w-1/5">${total}</TableCell>
      <TableCell className="w-1/5">{createdAt.toLocaleTimeString()}</TableCell>
      <TableCell className="w-1/5">{createdAt.toLocaleDateString()}</TableCell>
      <ExpandableCell id={id} items={items} />
    </TableRow>
  )
}
