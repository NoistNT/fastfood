'use client'

import type { OrderItem } from '@/modules/orders/types'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/modules/core/ui/button'
import { TableCell } from '@/modules/core/ui/table'

interface Props {
  id: string
  items: Pick<OrderItem, 'name' | 'quantity'>[]
}

export function ExpandableCell({ id, items }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <TableCell className="flex flex-col">
      <Button
        className={cn(
          'h-7 w-20 border border-neutral-300 shadow-sm hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600',
          isExpanded ? 'mb-1.5' : ''
        )}
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Ocultar' : 'Ver'}
      </Button>
      {isExpanded
        ? items.map(({ name, quantity }) => (
            <span key={id} className="my-1">
              {name} x {quantity}
            </span>
          ))
        : null}
    </TableCell>
  )
}
