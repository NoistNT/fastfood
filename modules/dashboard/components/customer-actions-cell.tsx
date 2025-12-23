'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { USER_ROLES } from '@/types/auth';
import { Button } from '@/modules/core/ui/button';
import { toastNotifications } from '@/lib/toast-notifications';

type CustomerWithRoles = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  roles: string[];
};

interface CustomerActionsCellProps {
  user: CustomerWithRoles;
}

export function CustomerActionsCell({ user }: CustomerActionsCellProps) {
  const router = useRouter();

  const t = useTranslations('Features.dashboard');
  const tCommon = useTranslations('Common');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isAdmin = user.roles.includes(USER_ROLES.ADMIN);

  const handleRoleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/customers/${user.id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: isAdmin ? USER_ROLES.CUSTOMER : USER_ROLES.ADMIN }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'Failed to update role');
      }

      toastNotifications.success.roleUpdated();
      router.refresh();
    } catch (error) {
      toastNotifications.error.genericError(
        error instanceof Error ? error.message : t('customers.toast.updateError')
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('customers.confirmDelete'))) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/customers/${user.id}/delete`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'Failed to delete user');
      }

      toastNotifications.success.customerDeleted();
      router.refresh();
    } catch (error) {
      toastNotifications.error.genericError(
        error instanceof Error ? error.message : t('customers.toast.deleteError')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={handleRoleUpdate}
        disabled={isUpdating}
        variant="outline"
        size="sm"
      >
        {isUpdating
          ? tCommon('actions.update')
          : isAdmin
            ? tCommon('actions.demote')
            : tCommon('actions.promote')}
      </Button>
      <Button
        onClick={handleDelete}
        disabled={isDeleting}
        variant="destructive"
        size="sm"
      >
        {isDeleting ? 'Deleting...' : tCommon('actions.delete')}
      </Button>
    </div>
  );
}
