import { useTranslations } from 'next-intl';

import { Badge } from '@/modules/core/ui/badge';

interface ProductAvailabilityBadgeProps {
  available: boolean;
}

export function ProductAvailabilityBadge({ available }: ProductAvailabilityBadgeProps) {
  const t = useTranslations('Common');

  return (
    <Badge variant={available ? 'success' : 'destructive'}>
      {t(available ? 'status.products.available' : 'status.products.unavailable')}
    </Badge>
  );
}
