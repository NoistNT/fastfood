import { getTranslations } from 'next-intl/server';

import { ErrorBoundary } from '@/modules/core/components/error-boundary';
import OrderIntakeForm from '@/modules/dashboard/components/order-intake-form';

export default async function NewOrderPage() {
  const t = await getTranslations('Features.dashboard.orders.intake');

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between md:mb-5">
        <h1 className="text-lg font-medium tracking-tighter md:text-xl">{t('title')}</h1>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card p-4">
        <ErrorBoundary>
          <OrderIntakeForm />
        </ErrorBoundary>
      </div>
    </div>
  );
}
