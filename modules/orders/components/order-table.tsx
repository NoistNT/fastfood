import { fixedPrice } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/modules/core/ui/table'
import { OrderItemRow } from '@/modules/orders/components/order-item-row'

interface OrderTableProps {
  items: {
    id: number
    name: string
    price: number
    quantity: number
  }[]
  incrementQuantity: (id: number) => void
  decrementQuantity: (id: number) => void
  removeItem: (id: number) => void
  total: number
}

export default function OrderTable({
  items,
  incrementQuantity,
  decrementQuantity,
  removeItem,
  total
}: OrderTableProps) {
  return (
    <Table className="border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
        <TableRow className="text-neutral-600 dark:text-neutral-400">
          <TableHead>Producto</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Subtotal</TableHead>
          <TableHead className="w-0">Quitar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(({ id, name, price, quantity }) => (
          <OrderItemRow
            key={id}
            decrementQuantity={decrementQuantity}
            id={id}
            incrementQuantity={incrementQuantity}
            name={name}
            price={price}
            quantity={quantity}
            removeItem={removeItem}
          />
        ))}
      </TableBody>
      <TableFooter>
        <TableRow className="bg-neutral-100 font-semibold hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell colSpan={4}>${fixedPrice(total)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
