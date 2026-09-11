'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/modules/core/ui/button';
import { Input } from '@/modules/core/ui/input';
import { DataTable } from '@/modules/core/components/data-table';
import { createColumns } from '@/modules/dashboard/components/customers-columns';
import {
  CustomerFormDialog,
  type DirectoryPerson,
} from '@/modules/dashboard/components/customer-form-dialog';
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
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<DirectoryPerson | null>(null);

  const handleExportCSV = () => {
    exportToCSV(initialCustomers, 'customers.csv');
  };

  const handleNewPerson = () => {
    setEditingPerson(null);
    setDialogOpen(true);
  };

  const handleEditPerson = (user: CustomerWithRoles) => {
    setEditingPerson({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-medium tracking-tighter">{t('customers.title')}</h1>
        <Button onClick={handleNewPerson}>{t('customers.newPerson')}</Button>
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
        className="overflow-hidden rounded-lg border border-border bg-card px-2 py-0"
        suppressHydrationWarning
      >
        <DataTable
          columns={createColumns(t, tTable, handleEditPerson)}
          data={initialCustomers}
          searchColumn="name"
          onExportCSV={handleExportCSV}
        />
      </div>
      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        person={editingPerson}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
