import type { Item } from '@/modules/orders/types'

import { TrashIcon } from '@radix-ui/react-icons'

import { fixedPrice } from '@/lib/utils'
import { Button } from '@/modules/core/ui/button'
import { TableCell, TableRow } from '@/modules/core/ui/table'

interface OrderItemRowProps {
  key: number
  item: Item
  incrementQuantity: (id: number) => void
  decrementQuantity: (id: number) => void
  removeItem: (id: number) => void
}

export function OrderItemRow({
  item: { id, name, price, quantity },
  incrementQuantity,
  decrementQuantity,
  removeItem
}: OrderItemRowProps) {
  const handleDecrement = () => {
    if (quantity > 1) decrementQuantity(id)
  }

  return (
    <TableRow
      key={id}
      className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>${fixedPrice(price)}</TableCell>
      <TableCell>
        <Button
          aria-label="Decrease quantity"
          className="size-8 p-0 dark:hover:border-neutral-700"
          type="button"
          variant="outline"
          onClick={handleDecrement}
        >
          -
        </Button>
        <input
          disabled
          className="mx-1.5 h-7 w-8 rounded-md border border-neutral-200 text-center text-sm font-semibold text-black dark:border-neutral-700 dark:text-white"
          type="text"
          value={quantity}
        />
        <Button
          aria-label="Increase quantity"
          className="size-8 p-0 dark:hover:border-neutral-700"
          type="button"
          variant="outline"
          onClick={() => incrementQuantity(id)}
        >
          +
        </Button>
      </TableCell>
      <TableCell>${fixedPrice(price * quantity)}</TableCell>
      <TableCell>
        <Button
          aria-label="Remove item"
          className="size-8 p-0 hover:bg-red-500"
          type="button"
          variant="outline"
          onClick={() => removeItem(id)}
        >
          <TrashIcon />
        </Button>
      </TableCell>
    </TableRow>
  )
}
