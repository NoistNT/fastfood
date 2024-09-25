import Link from 'next/link'

import { toast } from '@/modules/core/hooks/use-toast'
import { Button } from '@/modules/core/ui/button'
import { useOrderStore } from '@/store/use-order'

interface Props {
  id: number
  isAvailable: boolean
  name: string
  price: number
}

export function CardFooter({ id, isAvailable, name, price }: Props) {
  const { addItem } = useOrderStore()

  const handleAddItem = () => {
    if (!isAvailable) return

    addItem({ id, name, price, quantity: 1 })
    toast({ description: `${name} añadido al pedido` })
  }

  return (
    <div className="mt-4 flex w-full justify-center gap-4 sm:mt-0 sm:justify-end sm:gap-2">
      <Link className="w-full sm:w-32" href={`/products/${id}`}>
        <Button
          className="w-full transition-colors dark:hover:border-neutral-700 sm:w-32"
          type="button"
          variant="outline"
        >
          Más info
        </Button>
      </Link>
      <Button
        className={
          isAvailable
            ? 'w-full transition-colors dark:bg-neutral-50 sm:w-32'
            : 'w-full cursor-not-allowed bg-rose-100 font-semibold text-red-500 hover:bg-rose-100 hover:text-red-500 dark:border-neutral-700 dark:bg-rose-900 dark:text-red-200 dark:hover:bg-rose-900 sm:w-32'
        }
        type="button"
        variant={isAvailable ? 'default' : 'outline'}
        onClick={() => handleAddItem()}
      >
        {isAvailable ? 'Añadir al pedido' : 'Sin Stock'}
      </Button>
    </div>
  )
}
