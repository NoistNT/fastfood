'use client'

import Link from 'next/link'

import { fixedPrice } from '@/lib/utils'
import { Button } from '@/modules/core/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/modules/core/ui/table'
import { useOrderStore } from '@/store/use-order'

export default function Order() {
  const { order, incrementQuantity, decrementQuantity } = useOrderStore()
  const subtotal = (price: number, quantity: number) =>
    fixedPrice(price * quantity)

  const total = order.reduce(
    (acc, { price, quantity }) => acc + price * quantity,
    0
  )

  const handleIncrement = (id: number) => {
    incrementQuantity(id)
  }

  const handleDecrement = (id: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      decrementQuantity(id)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Table className="border border-neutral-200 bg-white">
        <TableHeader className="bg-neutral-100">
          <TableRow className="hover:bg-neutral-100">
            <TableHead>Producto</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.map(({ id, name, price, quantity }) => (
            <TableRow key={id} className="hover:bg-neutral-100">
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell>${fixedPrice(price)}</TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDecrement(id, quantity)}
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
                  type="button"
                  variant="outline"
                  onClick={() => handleIncrement(id)}
                >
                  +
                </Button>
              </TableCell>
              <TableCell>${subtotal(price, quantity)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-neutral-100 font-semibold hover:bg-neutral-200">
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell>${fixedPrice(total)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="flex justify-end gap-2">
        <Link href="/products">
          <Button variant="outline">Seguir agregando</Button>
        </Link>
        <Button variant="default">Confirmar pedido</Button>
      </div>
    </div>
  )
}
