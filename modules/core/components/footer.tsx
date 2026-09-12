import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Components.footer');
  const exploreItems = [
    {
      title: t('navigation.home'),
      href: '/',
    },
    {
      title: t('navigation.menu'),
      href: '/products',
    },
    {
      title: t('navigation.order'),
      href: '/order',
    },
  ];

  return (
    <footer
      className="w-full py-10 bg-background/50 dark:bg-background/75 backdrop-blur-sm text-primary border-t"
      role="contentinfo"
      aria-label={t('landmark')}
    >
      <div className="container mx-auto">
        <div className="grid gap-10 items-start sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left">
              {t('title')}
            </h2>
            <p className="text-lg max-w-lg text-primary/75 text-left">{t('description')}</p>
          </div>
          <nav
            className="flex flex-col gap-4"
            aria-label={t('navigation.landmark')}
          >
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {t('exploreHeading')}
            </h3>
            <ul className="flex flex-col gap-3">
              {exploreItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-base hover:text-primary/75 transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {t('visitUsHeading')}
            </h3>
            <div className="flex flex-col text-sm leading-relaxed tracking-tight text-muted-foreground">
              <p>{t('address.street')}</p>
              <p>{t('address.city')}</p>
              <p>{t('phone')}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {t('legalHeading')}
            </h3>
            <div className="flex flex-col text-sm leading-relaxed tracking-tight text-muted-foreground">
              <span>{t('tos')}</span>
              <span>{t('privacyPolicy')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
