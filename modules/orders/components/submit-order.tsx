import Link from 'next/link'

import { Button } from '@/modules/core/ui/button'

interface Props {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
}

export function SubmitOrder({ handleSubmit, isPending }: Props) {
  return (
    <form
      className="flex items-center justify-end gap-2 py-1.5"
      onSubmit={handleSubmit}
    >
      <Link href="/products">
        <Button
          className="border border-neutral-300 hover:border-neutral-400 dark:h-10 dark:border-neutral-700 dark:hover:border-neutral-600"
          type="button"
          variant="secondary"
        >
          Seguir agregando
        </Button>
      </Link>
      <Button aria-disabled={isPending} type="submit" variant="default">
        {isPending ? 'Registrando pedido...' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}
