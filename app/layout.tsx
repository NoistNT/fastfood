import type { Metadata } from 'next';

import { Inter as FontSans } from 'next/font/google';

import { cn } from '@/lib/utils';
import Footer from '@/modules/core/footer';
import Header from '@/modules/core/header';
import { ThemeProvider } from '@/modules/core/theme-provider';
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
      <body className={cn('min-h-screen bg-secondary font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <Toaster />
          <div className="fixed right-4 top-3.5">
            <ModeToggle />
          </div>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
