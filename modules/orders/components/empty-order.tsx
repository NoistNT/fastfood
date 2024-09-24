import Link from 'next/link'

import { Button } from '@/modules/core/ui/button'

export function EmptyOrder() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-y-10 py-60">
      <p className="text-center text-secondary-foreground">
        No hay productos en el pedido
      </p>
      <Link className="mx-auto" href="/products">
        <Button variant="default">Añadir productos</Button>
      </Link>
    </div>
  )
}
