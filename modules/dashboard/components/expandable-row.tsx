import { useMemo, useState } from 'react'

import { toast } from '@/modules/core/hooks/use-toast'
import { TableCell, TableRow } from '@/modules/core/ui/table'
import { updateStatus } from '@/modules/orders/actions/actions'
import { canTransition } from '@/modules/orders/helpers'
import {
  ORDER_STATUS,
  type OrderItem,
  type OrderStatus,
} from '@/modules/orders/types'

import { UpdateStatusButton } from './update-status-button'

interface Props {
  id: string
  items: Pick<OrderItem, 'name' | 'quantity'>[]
  currentStatus: OrderStatus
  statusHistory: {
    status: OrderStatus
    createdAt: Date
  }[]
  onStatusUpdate: (newStatus: OrderStatus) => void
}

export function ExpandableRow({
  id,
  items,
  currentStatus,
  statusHistory,
  onStatusUpdate,
}: Props) {
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const nextStatus = useMemo(() => {
    return Object.values(ORDER_STATUS).find(
      (status) =>
        status !== currentStatus && canTransition(currentStatus, status)
    )
  }, [currentStatus])

  const handleUpdateStatus = async () => {
    if (!nextStatus) return

    try {
      setIsChangingStatus(true)
      await updateStatus(id, nextStatus)
      onStatusUpdate(nextStatus)
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      setIsChangingStatus(false)
    }
  }

  return (
    <TableRow className="bg-white hover:bg-white dark:bg-black">
      <TableCell colSpan={5}>
        <div className="grid grid-cols-1 gap-6 p-2 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-700 dark:text-white">
              Order Details
            </h3>
            <ul className="w-full space-y-1.5">
              {items.map(({ name, quantity }) => (
                <li
                  key={name}
                  className="flex justify-between border-b border-neutral-200 p-1.5 text-gray-700 dark:border-neutral-800 dark:text-gray-300"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {name}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    x {quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-700 dark:text-white">
              Status History
            </h3>
            <ul className="w-full space-y-1.5">
              {[...statusHistory]
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                .map(({ status, createdAt }) => (
                  <li
                    key={`${status}-${createdAt.getTime()}`}
                    className="flex justify-between border-b border-neutral-200 p-1.5 text-gray-700 dark:border-neutral-800 dark:text-gray-300"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {status}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {createdAt.toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <UpdateStatusButton
          handleUpdateStatus={handleUpdateStatus}
          isChangingStatus={isChangingStatus}
          nextStatus={nextStatus!}
        />
      </TableCell>
    </TableRow>
  )
}
