'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Menu as MenuIcon,
  Package,
  Sandwich,
  Users,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/modules/core/ui/sheet';
import { cn } from '@/lib/utils';

const navigation = [
  { labelKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { labelKey: 'orders', href: '/dashboard/orders', icon: ClipboardList },
  { labelKey: 'customers', href: '/dashboard/customers', icon: Users },
  { labelKey: 'products', href: '/dashboard/products', icon: Sandwich },
  { labelKey: 'inventory', href: '/dashboard/inventory', icon: Package },
  { labelKey: 'reports', href: '/dashboard/reports', icon: BarChart3 },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations('Components.header');
  const tNav = useTranslations('Components.sidebar');

  return (
    <>
      <Link
        href="/"
        onClick={onNavigate}
      >
        <h1 className="text-xl text-primary font-semibold tracking-tighter hover:text-primary/80 transition-colors mt-5 mb-8">
          {t('title')}
        </h1>
      </Link>
      <nav
        className="flex flex-col space-y-2"
        aria-label={t('dashboard')}
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{tNav(item.labelKey)}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

export default function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  const tNav = useTranslations('Components.sidebar');

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet
        open={open}
        onOpenChange={setOpen}
      >
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">{tNav('toggle')}</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{tNav('dashboard')}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:absolute md:inset-y-0 md:left-0">
        <div className="flex flex-col bg-card backdrop-blur-sm border-r overflow-y-auto h-full">
          <div className="grow flex flex-col px-4">
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  );
}
