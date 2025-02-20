import type { Metadata } from 'next';

import { Inter as FontSans } from 'next/font/google';

import { cn } from '@/lib/utils';
import Footer from '@/modules/core/components/footer';
import Header from '@/modules/core/components/header';
import { ThemeProvider } from '@/modules/core/theme-provider';
import { BackgroundWall } from '@/modules/core/ui/background-wall';
import { ModeToggle } from '@/modules/core/ui/mode-toggle';
import { Toaster } from '@/modules/core/ui/toaster';

import './globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Fast Food',
  description: 'Fast food app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
    >
      <body className={cn('min-h-screen flex flex-col font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <Toaster />
          <div className="fixed right-4 bottom-4 z-10">
            <ModeToggle />
          </div>
          <Header />
          <BackgroundWall />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
