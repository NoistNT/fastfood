'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/modules/core/ui/sheet';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Orders', href: '/dashboard/orders', icon: '📦' },
  { name: 'Customers', href: '/dashboard/customers', icon: '👥' },
  { name: 'Products', href: '/dashboard/products', icon: '🍔' },
  { name: 'Inventory', href: '/dashboard/inventory', icon: '📦' },
  { name: 'Reports', href: '/dashboard/reports', icon: '📈' },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations('Components.header');

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
      <nav className="flex flex-col space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

export default function DashboardSidebar() {
  const [open, setOpen] = useState(false);

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
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Dashboard</h2>
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
