import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/',
}));

// Mock next-intl — keys are asserted directly
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the auth context
const mockLogout = vi.fn();
vi.mock('@/modules/auth/context/auth-context', () => ({
  useAuth: () => ({
    user: null,
    logout: mockLogout,
  }),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: vi.fn(),
  }),
}));

// Mock fetch (session endpoint)
const mockFetch = vi.fn();
global.fetch = mockFetch;

import Header from '@/modules/core/components/header';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: { name: string }[];
};

function mockSession(user: SessionUser | null) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: { user } }),
  });
}

async function openUserMenu() {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'userMenu' }));
  await screen.findByRole('menu');
}

describe('Header — Information Architecture rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  });

  it('guest variant is auth-actions only: Login + primary Sign Up, no navigation or preferences', async () => {
    mockSession(null);
    render(<Header />);

    expect(await screen.findByRole('link', { name: 'login' })).toBeInTheDocument();
    const signUpLink = await screen.findByRole('link', { name: 'register' });
    expect(signUpLink).toHaveClass('bg-primary');

    // Every destination is auth-gated: no Menu icon, no theme toggle, no cart, no account
    expect(screen.queryByRole('link', { name: 'menu' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'toggleTheme' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'viewCart' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'userMenu' })).not.toBeInTheDocument();
  });

  it('authed customer has Profile only inside the avatar menu, never in the top nav', async () => {
    mockSession({
      id: 'u1',
      name: 'Jane',
      email: 'jane@example.com',
      roles: [{ name: 'customer' }],
    });
    render(<Header />);

    await screen.findByRole('button', { name: 'userMenu' });

    // Not a top-level destination
    expect(screen.queryByRole('link', { name: 'profile' })).not.toBeInTheDocument();

    // Civilians get no dashboard entry point
    expect(screen.queryByRole('link', { name: 'dashboard' })).not.toBeInTheDocument();

    // Cart links to /order
    const cartLink = screen.getByRole('link', { name: 'viewCart' });
    expect(cartLink.getAttribute('href')).toBe('/order');

    await openUserMenu();

    expect(screen.getByRole('menuitem', { name: 'profile' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'dashboard' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'logout' })).toBeInTheDocument();
  });

  it('dashboard is a toolbar icon for operational roles only, not a menu item', async () => {
    mockSession({ id: 'u2', name: 'Ada', email: 'ada@example.com', roles: [{ name: 'admin' }] });
    render(<Header />);

    const dashboardLink = await screen.findByRole('link', { name: 'dashboard' });
    expect(dashboardLink.getAttribute('href')).toBe('/dashboard');

    // Not in the account menu anymore
    await openUserMenu();
    expect(screen.queryByRole('menuitem', { name: 'dashboard' })).not.toBeInTheDocument();
  });

  it('staff sees the dashboard toolbar icon too — no URL-only dead ends', async () => {
    mockSession({ id: 'u3', name: 'Sam', email: 'sam@example.com', roles: [{ name: 'staff' }] });
    render(<Header />);

    const dashboardLink = await screen.findByRole('link', { name: 'dashboard' });
    expect(dashboardLink.getAttribute('href')).toBe('/dashboard');
  });

  it('theme controls live inside the avatar menu for authed users', async () => {
    mockSession({
      id: 'u1',
      name: 'Jane',
      email: 'jane@example.com',
      roles: [{ name: 'customer' }],
    });
    render(<Header />);

    await screen.findByRole('button', { name: 'userMenu' });

    // No standalone toggle once authenticated
    expect(screen.queryByRole('button', { name: 'toggleTheme' })).not.toBeInTheDocument();

    await openUserMenu();
    expect(screen.getByRole('menuitem', { name: 'theme' })).toBeInTheDocument();
  });

  it('resolves to the guest variant while the session is loading', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<Header />);

    expect(screen.queryByRole('button', { name: 'userMenu' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'login' })).not.toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();

    return waitFor(() => expect(mockFetch).toHaveBeenCalled());
  });
});
