import type { MouseEventHandler } from 'react'

import Link from 'next/link'

import { Button } from '@/modules/core/ui/button'

interface Props {
  handleSubmit: MouseEventHandler<HTMLButtonElement>
  isPending: boolean
}

export function SubmitOrder({ handleSubmit, isPending }: Props) {
  return (
    <div className="flex items-center justify-end gap-2 py-1.5">
      <Link href="/products">
        <Button
          className="border border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600"
          type="button"
          variant="secondary"
        >
          Seguir agregando
        </Button>
      </Link>
      <Button
        aria-disabled={isPending}
        className="dark:border dark:border-neutral-900"
        type="submit"
        variant="default"
        onClick={handleSubmit}
      >
        {isPending ? 'Registrando pedido' : 'Confirmar pedido'}
      </Button>
    </div>
  )
}
