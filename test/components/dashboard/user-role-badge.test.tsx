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
      'bg-red-500/15',
      'text-red-700',
      'hover:bg-red-500/25',
      'dark:bg-red-500/10',
      'dark:text-red-400',
      'dark:hover:bg-red-500/20',
      'border-0'
    );
  });

  it('renders customer badge with correct styling', () => {
    render(<UserRoleBadge role={USER_ROLES.CUSTOMER} />);

    const badge = screen.getByText('Customer');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'bg-blue-500/15',
      'text-blue-700',
      'hover:bg-blue-500/25',
      'dark:bg-blue-500/10',
      'dark:text-blue-400',
      'dark:hover:bg-blue-500/20',
      'border-0'
    );
  });
});
