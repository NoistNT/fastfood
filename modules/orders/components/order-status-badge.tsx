import { useTranslations } from 'next-intl';

import { Badge } from '@/modules/core/ui/badge';
import { type OrderStatus, ORDER_STATUS } from '@/modules/orders/types';

const statusVariants: Record<OrderStatus, 'warning' | 'info' | 'success'> = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.PROCESSING]: 'info',
  [ORDER_STATUS.SHIPPED]: 'success',
  [ORDER_STATUS.DELIVERED]: 'success',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations('Features.dashboard.table.row');

  return <Badge variant={statusVariants[status] ?? 'secondary'}>{t(`status.${status}`)}</Badge>;
}
