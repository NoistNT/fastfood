import Link from 'next/link';

import { Button } from '@/modules/core/ui/button';

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-black px-4 py-3.5 text-white transition-colors ease-in-out">
      <Link href="/">
        <h1 className="text-2xl font-bold hover:text-neutral-300">Fastfood</h1>
      </Link>
      <nav className="flex items-center gap-x-2">
        <Link href="/dashboard">
          <Button variant="secondary">Dashboard</Button>
        </Link>
        <Link
          className="mr-[4.5rem] sm:mr-20"
          href="/order"
        >
          <Button variant="secondary">Order</Button>
        </Link>
      </nav>
    </header>
  );
}
