import { TrashIcon } from '@radix-ui/react-icons';

import { Button } from '@/modules/core/ui/button';
import { TableCell, TableRow } from '@/modules/core/ui/table';
import type { Item } from '@/modules/orders/types';
import { toFixed } from '@/modules/orders/utils';

interface OrderItemRowProps {
  key: number;
  item: Item;
  incrementQuantity: (productId: number) => void;
  decrementQuantity: (productId: number) => void;
  removeItem: (productId: number) => void;
}

export function OrderItemRow({
  item: { productId, name, price, quantity },
  incrementQuantity,
  decrementQuantity,
  removeItem,
}: OrderItemRowProps) {
  const handleDecrement = () => {
    if (quantity > 1) decrementQuantity(productId);
  };

  return (
    <TableRow
      key={productId}
      className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>${price}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Decrease quantity"
            className="size-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            type="button"
            variant="outline"
            onClick={handleDecrement}
          >
            -
          </Button>
          <input
            disabled
            className="mx-1.5 h-8 w-10 rounded-md border border-neutral-200 text-center text-sm font-semibold text-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            type="text"
            value={quantity}
          />
          <Button
            aria-label="Increase quantity"
            className="size-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            type="button"
            variant="outline"
            onClick={() => incrementQuantity(productId)}
          >
            +
          </Button>
        </div>
      </TableCell>
      <TableCell>${toFixed(String(parseFloat(price) * quantity))}</TableCell>
      <TableCell>
        <Button
          aria-label="Remove item"
          className="size-8 p-0 hover:bg-rose-50 dark:hover:bg-rose-900/20"
          type="button"
          variant="outline"
          onClick={() => removeItem(productId)}
        >
          <TrashIcon className="text-rose-400 dark:text-red-300" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
