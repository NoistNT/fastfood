import Link from 'next/link';

export default function Footer() {
  const navigationItems = [
    {
      title: 'Home',
      href: '/',
      description: '',
    },
    {
      title: 'Menu',
      description: 'Explore our delicious offerings.',
      items: [
        {
          title: 'Burgers',
          href: '/menu/burgers',
        },
        {
          title: 'Pizzas',
          href: '/menu/pizzas',
        },
        {
          title: 'Sandwichs',
          href: '/menu/sandwichs',
        },
      ],
    },
    {
      title: 'About Us',
      description: 'Learn more about our story.',
      items: [
        {
          title: 'Our Story',
          href: '/about',
        },
        {
          title: 'Franchise',
          href: '/franchise',
        },
        {
          title: 'Contact Us',
          href: '/contact',
        },
      ],
    },
  ];

  return (
    <footer className="w-full py-10 bg-background/50 dark:bg-background/75 backdrop-blur-sm text-primary">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="flex gap-8 flex-col items-start">
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left">
                FastFood
              </h2>
              <p className="text-lg max-w-lg text-primary/75 text-left">
                Serving the best fast food in town!
              </p>
            </div>
            <div className="flex gap-20 flex-row">
              <div className="flex flex-col text-sm max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                <p>123 Fast Food Lane</p>
                <p>Food City, FC 12345</p>
                <p>Phone: (123) 456-7890</p>
              </div>
              <div className="flex flex-col text-sm max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                <Link href="/">Terms of Service</Link>
                <Link href="/">Privacy Policy</Link>
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
                  {item.items &&
                    item.items.map((subItem) => (
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
