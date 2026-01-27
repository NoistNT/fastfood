import { useTranslations } from 'next-intl';

import { Badge } from '@/modules/core/ui/badge';

interface ProductAvailabilityBadgeProps {
  available: boolean;
}

export function ProductAvailabilityBadge({ available }: ProductAvailabilityBadgeProps) {
  const t = useTranslations('Common');

  if (available) {
    return (
      <Badge
        variant="outline"
        className="bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border-0"
      >
        {t('status.products.available')}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border-0"
    >
      {t('status.products.unavailable')}
    </Badge>
  );
}
