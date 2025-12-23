import { getTranslations } from 'next-intl/server';

import { getTotalSales } from '@/modules/dashboard/actions/actions';

export default async function TotalSales({ date }: { date: Date }) {
  const { totalSales } = await getTotalSales(date);
  const t = await getTranslations('Features.dashboard');

  const formattedTotalSales = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalSales);

  return (
    <span className="text-primary text-sm font-medium bg-primary-foreground px-2 py-2 rounded-md shadow-xs">
      {date && `${t('totalSales')}: ${formattedTotalSales}`}
    </span>
  );
}
