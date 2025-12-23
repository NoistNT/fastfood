'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/modules/auth/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/modules/core/ui/avatar';
import { Button } from '@/modules/core/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/modules/core/ui/dropdown-menu';

export default function DashboardHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Generate breadcrumbs based on pathname
  const generateBreadcrumbs = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Always start with Dashboard
    breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });

    if (segments.includes('customers')) {
      breadcrumbs.push({ label: 'Customers', href: '/dashboard/customers' });
      if (segments.length > 2 && segments[2] !== '') {
        breadcrumbs.push({ label: 'Details', href: null });
      }
    } else if (segments.includes('products')) {
      breadcrumbs.push({ label: 'Products', href: '/dashboard/products' });
    } else if (segments.includes('inventory')) {
      breadcrumbs.push({ label: 'Inventory', href: '/dashboard/inventory' });
    } else if (segments.includes('orders')) {
      breadcrumbs.push({ label: 'Orders', href: '/dashboard/orders' });
    } else if (segments.includes('reports')) {
      breadcrumbs.push({ label: 'Reports', href: '/dashboard/reports' });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs(pathname);

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-background border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <nav
            className="flex"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center space-x-4">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <li key={crumb.label}>
                    <div className="flex items-center">
                      {index > 0 && <span className="text-muted-foreground mx-2">/</span>}
                      {isLast || !crumb.href ? (
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isLast ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {crumb.label}
                        </span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Profile Avatar */}
          <div className="flex items-center space-x-4">
            <div suppressHydrationWarning>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src=""
                        alt={user?.name ?? 'User'}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
