import type { CartItem } from '@/modules/orders/types';

import { Minus, Plus, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Fragment, useState } from 'react';

import { Button } from '@/modules/core/ui/button';
import { ConfirmationDialog } from '@/modules/core/ui/confirmation-dialog';
import { TableCell, TableRow } from '@/modules/core/ui/table';
import { toFixed } from '@/modules/orders/utils';

interface OrderItemRowProps {
  key: number;
  item: CartItem;
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
  const t = useTranslations('Common');

  const [isRemoveConfirmationOpen, setRemoveConfirmationOpen] = useState(false);

  const handleDecrement = () => {
    if (quantity > 1) decrementQuantity(productId);
  };

  const handleRemove = () => {
    removeItem(productId);
    setRemoveConfirmationOpen(false);
  };

  return (
    <Fragment>
      <TableRow
        key={productId}
        className="dark:hover:bg-muted/50 hover:bg-neutral-200 text-muted-foreground font-medium"
      >
        <TableCell>
          <Link href={`/products/${productId}`}>
            <span className="hover:underline cursor-pointer">{name}</span>
          </Link>
        </TableCell>
        <TableCell>${price}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              aria-label="Decrease quantity"
              className="size-8 p-0 bg-transparent text-muted-foreground shadow-none hover:shadow-none border border-neutral-300 dark:border-muted"
              type="button"
              variant="outline"
              onClick={handleDecrement}
            >
              <Minus className="size-4" />
            </Button>
            <span className="text-center text-sm font-semibold text-muted-foreground w-4">
              {quantity}
            </span>
            <Button
              aria-label="Increase quantity"
              className="size-8 p-0 bg-transparent text-muted-foreground shadow-none hover:shadow-none border border-neutral-300 dark:border-muted"
              type="button"
              variant="outline"
              onClick={() => incrementQuantity(productId)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </TableCell>
        <TableCell>${toFixed(String(parseFloat(price) * quantity))}</TableCell>
        <TableCell>
          <Button
            aria-label="Remove item"
            className="size-8 p-0 bg-transparent hover:bg-rose-200 dark:hover:bg-rose-900/20 text-primary shadow-none hover:shadow-none border border-neutral-300 dark:border-muted"
            type="button"
            variant="outline"
            onClick={() => setRemoveConfirmationOpen(true)}
          >
            <Trash2Icon className="text-rose-400 dark:text-rose-800" />
          </Button>
        </TableCell>
      </TableRow>
      <ConfirmationDialog
        open={isRemoveConfirmationOpen}
        onOpenChange={setRemoveConfirmationOpen}
        onConfirm={handleRemove}
        title={t('dialog.title')}
        description={
          <Fragment>
            {t('dialog.description')} <span className="font-bold text-foreground">{name}?</span>
          </Fragment>
        }
        cancelText={t('actions.cancel')}
        confirmText={t('actions.confirm')}
      />
    </Fragment>
  );
}
