import Link from 'next/link';

import { toast } from '@/modules/core/hooks/use-toast';
import { Button } from '@/modules/core/ui/button';
import { useOrderStore } from '@/store/use-order';

interface Props {
  productId: number;
  isAvailable: boolean;
  name: string;
  price: string;
}

export function CardFooter({ productId, isAvailable, name, price }: Props) {
  const { addItem } = useOrderStore();

  const handleAddItem = () => {
    if (!isAvailable) return;

    addItem({ productId, name, price, quantity: 1 });
    toast({ description: `${name} added to order` });
  };

  return (
    <div className="mt-4 flex w-full justify-center gap-4 sm:mt-0 sm:justify-end sm:gap-2">
      <Link
        className="w-full sm:w-32"
        href={`/products/${productId}`}
      >
        <Button
          className="w-full transition-colors tracking-tighter dark:hover:border-neutral-700 sm:w-32"
          type="button"
          variant="outline"
        >
          More info
        </Button>
      </Link>
      <Button
        className={
          isAvailable
            ? 'w-full tracking-tighter transition-colors dark:bg-neutral-50 sm:w-32'
            : 'w-full tracking-tighter cursor-not-allowed bg-rose-100 font-semibold text-red-500 hover:bg-rose-100 hover:text-red-500 dark:border-neutral-700 dark:bg-rose-900 dark:text-red-200 dark:hover:bg-rose-900 sm:w-32'
        }
        type="button"
        variant={isAvailable ? 'default' : 'outline'}
        onClick={() => handleAddItem()}
      >
        {isAvailable ? 'Add to order' : 'Out of stock'}
      </Button>
    </div>
  );
}
