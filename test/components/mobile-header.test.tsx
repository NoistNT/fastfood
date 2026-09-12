import type { UserWithRoles } from '@/types/auth';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/modules/auth/context/auth-context', () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

import { MobileHeader } from '@/modules/core/components/mobile-header';

function userWithRoles(roleName: string): UserWithRoles {
  return {
    id: 'u1',
    name: 'Sam',
    email: 'sam@example.com',
    roles: [{ name: roleName }],
  } as UserWithRoles;
}

async function openSheet() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'openMenu' }));
}

describe('MobileHeader — dashboard sheet row', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  });

  it('shows the dashboard row for staff, mirroring the desktop toolbar', async () => {
    render(
      <MobileHeader
        user={userWithRoles('staff')}
        isAuthenticated
        loading={false}
      />
    );
    await openSheet();

    const dashboardLink = await screen.findByRole('link', { name: 'dashboard' });
    expect(dashboardLink.getAttribute('href')).toBe('/dashboard');
  });

  it('shows no dashboard row for civilians', async () => {
    render(
      <MobileHeader
        user={userWithRoles('customer')}
        isAuthenticated
        loading={false}
      />
    );
    await openSheet();

    expect(await screen.findByRole('link', { name: 'menu' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'dashboard' })).not.toBeInTheDocument();
  });
});
