import { USER_ROLES } from '@/types/auth';
import { Badge } from '@/modules/core/ui/badge';

type UserRole = typeof USER_ROLES.ADMIN | typeof USER_ROLES.CUSTOMER;

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  switch (role) {
    case USER_ROLES.ADMIN:
      return <Badge variant="destructive">Admin</Badge>;
    case USER_ROLES.CUSTOMER:
      return <Badge variant="info">Customer</Badge>;
    default:
      return <Badge variant="secondary">{role}</Badge>;
  }
}
