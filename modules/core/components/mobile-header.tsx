import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';
import { SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/modules/core/ui/sheet';
import { Sheet, SheetTrigger } from '@/modules/core/ui/utils-sheet';
import { SheetItem } from '@/modules/core/ui/sheet-item';

export function MobileHeader() {
  const t = useTranslations('Header');
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="text-primary " />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="bg-popover backdrop-blur-sm border-l"
      >
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-y-2 mt-6">
          <SheetItem
            title={t('order')}
            href="/order"
          />
          <SheetItem
            title={t('dashboard')}
            href="/dashboard"
          />
          <SheetItem
            title={t('profile')}
            href="/profile"
          />
        </nav>
        <SheetFooter className="absolute bottom-4 right-4">
          <Button variant="ghost">{t('logout')}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
