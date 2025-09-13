import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { MobileHeader } from '@/modules/core/components/mobile-header';
import { Button } from '@/modules/core/ui/button';

export default function Header() {
  const t = useTranslations('Header');
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-background/50 dark:bg-background/75 backdrop-blur-sm px-4 py-3.5 text-primary shadow-lg dark:shadow-neutral-900/50 transition-colors ease-in-out">
      <Link href="/">
        <h1 className="text-2xl text-primary font-semibold tracking-tighter hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors duration-200">
          {t('title')}
        </h1>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-x-4">
        <Link href="/order">
          <Button
            variant="ghost"
            className="tracking-tight"
          >
            {t('order')}
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="tracking-tight"
          >
            {t('dashboard')}
          </Button>
        </Link>
        <Link href="/profile">
          <Button
            variant="ghost"
            className="tracking-tight"
          >
            {t('profile')}
          </Button>
        </Link>
      </nav>

      {/* Mobile Navigation */}
      <MobileHeader />
    </header>
  );
}
