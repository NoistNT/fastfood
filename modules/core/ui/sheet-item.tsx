import Link from 'next/link';

import { Button } from '@/modules/core/ui/button';
import { SheetClose } from '@/modules/core/ui/utils-sheet';

interface Props {
  title: string;
  href: string;
}

export function SheetItem({ title, href }: Props) {
  return (
    <SheetClose asChild>
      <Link href={href}>
        <Button
          variant="ghost"
          className="w-full"
        >
          {title}
        </Button>
      </Link>
    </SheetClose>
  );
}
