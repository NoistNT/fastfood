import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getCustomerById } from '../page';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations('CustomerDetail');

  const customer = await getCustomerById(id);

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
          <p className="text-muted-foreground">View and manage customer information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-sm font-medium">{customer.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="text-sm font-medium">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                <dd className="text-sm font-medium">{customer.phoneNumber ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                <dd className="text-sm font-medium capitalize">{customer.roles.join(', ')}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Member Since</dt>
                <dd className="text-sm font-medium">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Login</dt>
                <dd className="text-sm font-medium">
                  {customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleString() : 'Never'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 text-sm bg-muted rounded-md hover:bg-muted/80 transition-colors">
                {t('editCustomer')}
              </button>
              <button className="w-full text-left px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
                {t('deleteCustomer')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
