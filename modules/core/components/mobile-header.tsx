import { Menu } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/modules/core/ui/sheet';
import { SheetItem } from '@/modules/core/ui/sheet-item';

export function MobileHeader() {
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
          <SheetTitle>Mobile Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-y-2 mt-6">
          <SheetItem title="Order" />
          <SheetItem title="Dashboard" />
          <SheetItem title="Profile" />
        </nav>
        <SheetFooter className="absolute bottom-4 right-4">
          <Button variant="ghost">Logout</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
