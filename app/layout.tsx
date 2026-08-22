import type { Metadata, Viewport } from 'next';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { JetBrains_Mono as FontMono } from 'next/font/google';

import { cn } from '@/lib/utils';
import ConditionalHeader from '@/modules/core/components/conditional-header';
import Footer from '@/modules/core/components/footer';
import { SkipToContent } from '@/modules/core/components/skip-to-content';
import { PageTransition } from '@/modules/core/components/page-transition';
import { QueryProvider } from '@/modules/core/components/query-provider';
import { KeyboardShortcuts } from '@/modules/core/components/keyboard-shortcuts';
import {
  PerformanceMonitor,
  ResourcePreloader,
} from '@/modules/core/components/performance-monitor';
import { PushNotificationManager } from '@/modules/core/components/push-notification-manager';
import { ServiceWorkerRegistration } from '@/modules/core/components/service-worker-registration';
import { ThemeProvider } from '@/modules/core/theme-provider';
import { ModeToggle } from '@/modules/core/ui/mode-toggle';
import { Toaster } from '@/modules/core/ui/toaster';
import { AuthProvider } from '@/modules/auth/context/auth-context';
import '@/app/globals.css';

const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'FastFood',
    template: '%s | FastFood',
  },
  description: 'Order your favorite fast food, fast.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FastFood',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f4f2' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1b1a' },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const messages = await getMessages();

  return (
    <html
      suppressHydrationWarning
      lang="en"
    >
      <body className={cn('min-h-screen flex flex-col font-sans antialiased', fontMono.variable)}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ThemeProvider
              disableTransitionOnChange
              enableSystem
              attribute="class"
              defaultTheme="system"
            >
              <QueryProvider>
                <SkipToContent />
                <KeyboardShortcuts />
                <ServiceWorkerRegistration />
                <PerformanceMonitor />
                <ResourcePreloader />
                <PushNotificationManager />
                <Toaster />
                <div className="fixed right-4 bottom-4 z-10">
                  <ModeToggle />
                </div>
                <ConditionalHeader />
                <main
                  id="main-content"
                  className="grow"
                  role="main"
                  aria-label="Main content"
                >
                  <PageTransition>{children}</PageTransition>
                </main>
                <Footer />
              </QueryProvider>
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
