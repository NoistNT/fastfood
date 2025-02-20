import Link from 'next/link';

import { Button } from '@/modules/core/ui/button';
import { SheetClose } from '@/modules/core/ui/sheet';

interface Props {
  title: string;
}

export function SheetItem({ title }: Props) {
  return (
    <SheetClose asChild>
      <Link href={`/${title.toLowerCase()}`}>
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
