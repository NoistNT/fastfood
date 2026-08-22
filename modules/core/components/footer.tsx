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
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="flex gap-8 flex-col items-start">
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left">
                {t('title')}
              </h2>
              <p className="text-lg max-w-lg text-primary/75 text-left">{t('description')}</p>
            </div>
            <div className="flex gap-20 flex-row">
              <div className="flex flex-col text-sm max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                <p>{t('address.street')}</p>
                <p>{t('address.city')}</p>
                <p>{t('phone')}</p>
              </div>
              <div className="flex flex-col text-sm max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                <span>{t('tos')}</span>
                <span>{t('privacyPolicy')}</span>
              </div>
            </div>
          </div>
          <nav
            className="grid grid-cols-1 gap-4 sm:justify-items-end items-start"
            aria-label={t('navigation.landmark')}
          >
            <ul className="flex flex-col items-start gap-3 sm:items-end">
              {exploreItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xl hover:text-primary/75 transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
