import { TrashIcon } from '@radix-ui/react-icons'

import { fixedPrice } from '@/lib/utils'
import { Button } from '@/modules/core/ui/button'
import { TableCell, TableRow } from '@/modules/core/ui/table'

interface OrderItemRowProps {
  id: number
  name: string
  price: number
  quantity: number
  incrementQuantity: (id: number) => void
  decrementQuantity: (id: number) => void
  removeItem: (id: number) => void
}

export function OrderItemRow({
  id,
  name,
  price,
  quantity,
  incrementQuantity,
  decrementQuantity,
  removeItem
}: OrderItemRowProps) {
  const handleDecrement = () => {
    if (quantity > 1) {
      decrementQuantity(id)
    }
  }

  return (
    <TableRow key={id} className="hover:bg-neutral-100">
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>${fixedPrice(price)}</TableCell>
      <TableCell>
        <Button
          aria-label="Decrease quantity"
          type="button"
          variant="outline"
          onClick={handleDecrement}
        >
          -
        </Button>
        <input
          disabled
          className="w-10 rounded-md border border-neutral-200 text-center text-sm font-semibold text-black"
          type="text"
          value={quantity}
        />
        <Button
          aria-label="Increase quantity"
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
