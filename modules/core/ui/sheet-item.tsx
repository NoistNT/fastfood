import type { LucideIcon } from 'lucide-react';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '@/modules/core/ui/button';
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
      <Button
        asChild
        variant="ghost"
        size="default"
      >
        <Link
          href={href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'w-full justify-start',
            active &&
              'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
          )}
        >
          {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
          <span>{title}</span>
        </Link>
      </Button>
    </SheetClose>
  );
}
