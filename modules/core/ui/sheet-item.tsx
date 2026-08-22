import type { LucideIcon } from 'lucide-react';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import { SheetClose } from '@/modules/core/ui/utils-sheet';

interface Props {
  title: string;
  href: string;
  icon?: LucideIcon;
  active?: boolean;
}

export function SheetItem({ title, href, icon: Icon, active = false }: Props) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
        <span>{title}</span>
      </Link>
    </SheetClose>
  );
}
