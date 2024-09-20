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
    <Table className="border border-neutral-200 bg-white">
      <TableHeader className="bg-neutral-100">
        <TableRow className="hover:bg-neutral-100">
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
        <TableRow className="bg-neutral-100 font-semibold hover:bg-neutral-200">
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell colSpan={4}>${fixedPrice(total)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
