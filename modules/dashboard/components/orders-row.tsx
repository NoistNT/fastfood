'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/modules/core/ui/button'
import { TableCell, TableRow } from '@/modules/core/ui/table'

interface OrderItemRowProps {
  key: number
  order: {
    id: string
    items: { name: string; quantity: number; subtotal: number }[]
    total: number
    status: string
    createdAt: Date
  }
}

export function OrdersRow({
  order: { id, total, status, createdAt, items }
}: OrderItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <TableRow
      key={id}
      className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <TableCell className="w-1/5">{status}</TableCell>
      <TableCell className="w-1/5">${total}</TableCell>
      <TableCell className="w-1/5">{createdAt.toLocaleTimeString()}</TableCell>
      <TableCell className="w-1/5">{createdAt.toLocaleDateString()}</TableCell>
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
    </TableRow>
  )
}
