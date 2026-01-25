import { useTranslations } from 'next-intl';

import { Badge } from '@/modules/core/ui/badge';
import { type OrderStatus, ORDER_STATUS } from '@/modules/orders/types';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations('Features.dashboard.table.row');

  switch (status) {
    case ORDER_STATUS.PENDING:
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20 border-0"
        >
          {t('status.PENDING')}
        </Badge>
      );
    case ORDER_STATUS.PROCESSING:
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border-0"
        >
          {t('status.PROCESSING')}
        </Badge>
      );
    case ORDER_STATUS.SHIPPED:
      return (
        <Badge
          variant="outline"
          className="bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border-0"
        >
          {t('status.SHIPPED')}
        </Badge>
      );
    case ORDER_STATUS.DELIVERED:
      return (
        <Badge
          variant="outline"
          className="bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border-0"
        >
          {t('status.DELIVERED')}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
