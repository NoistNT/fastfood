import { USER_ROLES } from '@/types/auth';
import { Badge } from '@/modules/core/ui/badge';

type UserRole = typeof USER_ROLES.ADMIN | typeof USER_ROLES.CUSTOMER;

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  switch (role) {
    case USER_ROLES.ADMIN:
      return (
        <Badge
          variant="outline"
          className="bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border-0"
        >
          Admin
        </Badge>
      );
    case USER_ROLES.CUSTOMER:
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border-0"
        >
          Customer
        </Badge>
      );
    default:
      return <Badge variant="secondary">{role}</Badge>;
  }
}
