import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { toast } from '@/modules/core/hooks/use-toast';
import { useScreenReaderAnnouncement } from '@/modules/core/components/screen-reader-announcement';
import { Button } from '@/modules/core/ui/button';
import { useOrderStore } from '@/store/use-order';

interface Props {
  productId: number;
  available: boolean;
  name: string;
  price: string;
}

export function CardFooter({ productId, available, name, price }: Props) {
  const t = useTranslations('CardFooter');
  const { addItem } = useOrderStore();
  const { announce } = useScreenReaderAnnouncement();

  const handleAddItem = () => {
    if (!available) return;
    addItem({ productId, name, price, quantity: 1 });
    toast({ description: `${name} ${t('addedToOrder')}` });

    // Announce to screen readers
    announce(`${name} has been added to your order`, 'polite');
  };

  return (
    <footer
      className="mt-4 flex w-full justify-center gap-4 sm:mt-0 sm:justify-end sm:gap-2"
      aria-label="Product actions"
    >
      <Link
        className="w-full sm:w-32"
        href={`/products/${productId}`}
        aria-label={`View details for ${name}`}
      >
        <Button
          className="w-full transition-colors tracking-tighter dark:hover:border-neutral-700 sm:w-32"
          type="button"
          variant="outline"
          aria-describedby={`product-${productId}-price`}
        >
          {t('moreInfo')}
        </Button>
      </Link>
      <Button
        className={
          available
            ? 'w-full tracking-tighter transition-colors dark:bg-neutral-50 sm:w-32'
            : 'w-full tracking-tighter cursor-not-allowed bg-rose-100 font-semibold text-red-500 hover:bg-rose-100 hover:text-red-500 dark:border-neutral-700 dark:bg-rose-900 dark:text-red-200 dark:hover:bg-rose-900 sm:w-32'
        }
        type="button"
        variant={available ? 'default' : 'outline'}
        onClick={() => handleAddItem()}
        disabled={!available}
        aria-label={available ? `Add ${name} to order for $${price}` : `${name} is out of stock`}
        aria-describedby={`product-${productId}-status`}
        data-testid="add-to-cart-button"
      >
        {available ? t('addToOrder') : t('outOfStock')}
      </Button>
      <div
        id={`product-${productId}-status`}
        className="sr-only"
      >
        {available ? 'In stock' : 'Out of stock'}
      </div>
    </footer>
  );
}
