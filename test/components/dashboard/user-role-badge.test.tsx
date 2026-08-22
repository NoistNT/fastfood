import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { USER_ROLES } from '@/types/auth';
import { UserRoleBadge } from '@/modules/dashboard/components/user-role-badge';

describe('UserRoleBadge', () => {
  it('renders admin badge with correct styling', () => {
    render(<UserRoleBadge role={USER_ROLES.ADMIN} />);

    const badge = screen.getByText('Admin');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'border-destructive/40',
      'bg-destructive/10',
      'text-destructive',
      'dark:border-destructive/30',
      'dark:bg-destructive/[8%]'
    );
  });

  it('renders customer badge with correct styling', () => {
    render(<UserRoleBadge role={USER_ROLES.CUSTOMER} />);

    const badge = screen.getByText('Customer');
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
