import { useTranslations } from 'next-intl';

import { USER_ROLES } from '@/types/auth';
import { Badge } from '@/modules/core/ui/badge';

type UserRole = typeof USER_ROLES.ADMIN | typeof USER_ROLES.STAFF;

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const t = useTranslations('Features.dashboard.customers.roleBadges');

  switch (role) {
    case USER_ROLES.ADMIN:
      return <Badge variant="destructive">{t('admin')}</Badge>;
    case USER_ROLES.STAFF:
      return <Badge variant="info">{t('staff')}</Badge>;
    default:
      return <Badge variant="secondary">{role}</Badge>;
  }
}
