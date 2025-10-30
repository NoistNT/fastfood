import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Orders.table');
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-primary-foreground">
      <Table className="w-full">
        <TableHeader className="sticky top-0 bg-white dark:bg-black tracking-tight">
          <TableRow>
            <TableHead className="w-2/5 text-primary">{t('columns.product')}</TableHead>
            <TableHead className="w-1/5 text-primary">{t('columns.price')}</TableHead>
            <TableHead className="w-1/5 text-primary">{t('columns.quantity')}</TableHead>
            <TableHead className="w-1/5 text-primary">{t('columns.subtotal')}</TableHead>
            <TableHead className="w-0 text-primary">{t('columns.remove')}</TableHead>
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
        <TableFooter className="sticky bottom-0 bg-white dark:bg-black outline-1 outline-neutral-300 dark:outline-neutral-700">
          <TableRow className="font-semibold">
            <TableCell
              colSpan={4}
              className="text-primary"
            >
              {t('footer.total')}
            </TableCell>
            <TableCell
              colSpan={1}
              className="text-primary"
            >
              ${toFixed(total)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
