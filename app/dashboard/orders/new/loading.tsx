import { getTranslations } from 'next-intl/server';

import { TableSkeleton } from '@/modules/core/ui/skeleton-components';

export default async function NewOrderLoading() {
  const t = await getTranslations('Features.dashboard.orders.intake');

  return (
    <div
      role="status"
      aria-busy="true"
    >
      <p className="sr-only">{t('loadingMessage')}</p>
      <div aria-hidden="true">
        <TableSkeleton
          rows={8}
          columns={4}
        />
      </div>
    </div>
  );
}
