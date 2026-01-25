import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Components.footer');
  const navigationItems = [
    {
      title: t('navigation.home'),
      href: '/',
    },
    {
      title: t('navigation.menu'),
      items: [
        {
          title: t('menu.burgers'),
          href: '/menu/burgers',
        },
        {
          title: t('menu.pizzas'),
          href: '/menu/pizzas',
        },
        {
          title: t('menu.sandwiches'),
          href: '/menu/sandwiches',
        },
      ],
    },
    {
      title: t('navigation.about'),
      items: [
        {
          title: t('about.story'),
          href: '/about',
        },
        {
          title: t('about.franchise'),
          href: '/franchise',
        },
        {
          title: t('about.contact'),
          href: '/contact',
        },
      ],
    },
  ];

  return (
    <footer
      className="w-full py-10 bg-background/50 dark:bg-background/75 backdrop-blur-sm text-primary"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
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
                <Link href="/">{t('tos')}</Link>
                <Link href="/">{t('privacyPolicy')}</Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-10 items-start">
            {navigationItems.map((item) => (
              <div
                key={item.title}
                className="flex gap-1 flex-col items-start"
              >
                <div className="flex flex-col gap-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xl">{item.title}</span>
                    </Link>
                  ) : (
                    <p className="text-xl">{item.title}</p>
                  )}
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.href}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-muted-foreground">{subItem.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
