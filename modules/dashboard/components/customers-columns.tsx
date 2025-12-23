'use client';

import type { ColumnDef } from '@tanstack/react-table';

import Link from 'next/link';

import { USER_ROLES } from '@/types/auth';
import { DataTableColumnHeader } from '@/modules/core/components/data-table-column-header';
import { CustomerActionsCell } from '@/modules/dashboard/components/customer-actions-cell';
import { UserRoleBadge } from '@/modules/dashboard/components/user-role-badge';

type CustomerWithRoles = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  roles: string[];
};

export const createColumns = (
  t: (key: string) => string,
  tTable?: (key: string) => string
): ColumnDef<CustomerWithRoles>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('customers.table.columns.name')}
      />
    ),
    cell: ({ row }) => {
      const name: string = row.getValue('name');
      const customerId = row.original.id;
      return (
        <Link
          href={`/dashboard/customers/${customerId}`}
          className="font-medium text-primary hover:text-primary/80 hover:underline"
        >
          {name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('customers.table.columns.email')}
      />
    ),
    cell: ({ row }) => {
      const email: string = row.getValue('email');
      return <span>{email}</span>;
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('customers.table.columns.phone')}
      />
    ),
    cell: ({ row }) => {
      const phone: string | null = row.getValue('phoneNumber');
      return <span>{phone ?? '-'}</span>;
    },
  },
  {
    accessorKey: 'roles',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('customers.table.columns.role')}
      />
    ),
    cell: ({ row }) => {
      const roles: string[] = row.getValue('roles');
      return (
        <div className="flex flex-wrap gap-1">
          {roles.length > 0 ? (
            roles.map((role) => (
              <UserRoleBadge
                key={role}
                role={role as typeof USER_ROLES.ADMIN | typeof USER_ROLES.CUSTOMER}
              />
            ))
          ) : (
            <UserRoleBadge role={USER_ROLES.CUSTOMER} />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'lastLoginAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={tTable ? tTable('columns.lastLogin') : 'Last Login'}
      />
    ),
    cell: ({ row }) => {
      const lastLogin: Date | null = row.getValue('lastLoginAt');
      return <span>{lastLogin ? new Date(lastLogin).toLocaleDateString() : 'Never'}</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={tTable ? tTable('columns.created') : 'Created'}
      />
    ),
    cell: ({ row }) => {
      const createdAt: Date = row.getValue('createdAt');
      return <span>{new Date(createdAt).toLocaleDateString()}</span>;
    },
  },
  {
    id: 'actions',
    header: t('customers.table.columns.actions'),
    cell: ({ row }) => <CustomerActionsCell user={row.original} />,
  },
];
