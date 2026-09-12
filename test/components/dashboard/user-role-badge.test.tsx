import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock next-intl — keys are asserted directly
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

import { USER_ROLES } from '@/types/auth';
import { UserRoleBadge } from '@/modules/dashboard/components/user-role-badge';

describe('UserRoleBadge', () => {
  it('renders admin badge with correct styling', () => {
    render(<UserRoleBadge role={USER_ROLES.ADMIN} />);

    const badge = screen.getByText('Features.dashboard.customers.roleBadges.admin');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'border-destructive/40',
      'bg-destructive/10',
      'text-destructive',
      'dark:border-destructive/30',
      'dark:bg-destructive/[8%]'
    );
  });

  it('renders staff badge with correct styling', () => {
    render(<UserRoleBadge role={USER_ROLES.STAFF} />);

    const badge = screen.getByText('Features.dashboard.customers.roleBadges.staff');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'border-info/40',
      'bg-info/10',
      'text-info',
      'dark:border-info/30',
      'dark:bg-info/[8%]'
    );
  });
});
