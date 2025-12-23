'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';
import { Input } from '@/modules/core/ui/input';
import { DataTable } from '@/modules/core/components/data-table';
import { createColumns } from '@/modules/dashboard/components/customers-columns';
import { exportToCSV } from '@/lib/utils';

export type CustomerWithRoles = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  roles: string[];
};

interface CustomersDashboardProps {
  initialCustomers: CustomerWithRoles[];
  initialSearch?: string;
}

export function CustomersDashboard({ initialCustomers, initialSearch }: CustomersDashboardProps) {
  const t = useTranslations('Features.dashboard');
  const tTable = useTranslations('Common.table');

  const handleExportCSV = () => {
    exportToCSV(initialCustomers, 'customers.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-medium tracking-tighter">{t('customers.title')}</h1>
      </div>

      <form className="flex items-center space-x-2">
        <Input
          name="search"
          placeholder={t('customers.search.placeholder')}
          defaultValue={initialSearch ?? ''}
          className="max-w-sm"
        />
        <Button type="submit">Search</Button>
      </form>

      <div
        className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-primary-foreground px-2 py-0"
        suppressHydrationWarning
      >
        <DataTable
          columns={createColumns(t, tTable)}
          data={initialCustomers}
          searchColumn="name"
          onExportCSV={handleExportCSV}
        />
      </div>
    </div>
  );
}
