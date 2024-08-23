import type { Metadata } from 'next'

import { Inter as FontSans } from 'next/font/google'

import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/modules/core/theme-provider'
import { ModeToggle } from '@/modules/core/ui/mode-toggle'

import Footer from './footer'
import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: 'Fast Food',
  description: 'Fast food app'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <div className="fixed right-4 top-6 z-[150]">
            <ModeToggle />
          </div>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
