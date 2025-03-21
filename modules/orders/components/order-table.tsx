import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/core/ui/table';
import { OrderItemRow } from '@/modules/orders/components/order-item-row';
import type { Item } from '@/modules/orders/types';
import { toFixed } from '@/modules/orders/utils';

interface OrderTableProps {
  items: Item[];
  incrementQuantity: (id: number) => void;
  decrementQuantity: (id: number) => void;
  removeItem: (id: number) => void;
  total: string;
}

export function OrderTable({
  items,
  incrementQuantity,
  decrementQuantity,
  removeItem,
  total,
}: OrderTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
      <Table className="w-full bg-white dark:bg-neutral-900">
        <TableHeader className="sticky top-0 bg-neutral-100 dark:bg-neutral-800">
          <TableRow className="text-neutral-600 dark:text-neutral-400">
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Subtotal</TableHead>
            <TableHead className="w-0">Remove</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <OrderItemRow
              key={item.productId}
              decrementQuantity={decrementQuantity}
              incrementQuantity={incrementQuantity}
              item={item}
              removeItem={removeItem}
            />
          ))}
        </TableBody>
        <TableFooter className="sticky bottom-0 bg-neutral-100 dark:bg-neutral-800">
          <TableRow className="font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700">
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell colSpan={4}>${toFixed(total)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
