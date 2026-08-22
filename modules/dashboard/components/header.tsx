'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useAuth } from '@/modules/auth/context/auth-context';
import { UserMenu } from '@/modules/core/components/user-menu';

export default function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

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
            {user && (
              <UserMenu
                user={{
                  id: user.id,
                  name: user.name,
                  email: user.email,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
