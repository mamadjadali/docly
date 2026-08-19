import type { Metadata } from 'next'
import Script from 'next/script'
import { Vazirmatn } from 'next/font/google'
import React from 'react'

import './styles.css'

const vazirmatn = Vazirmatn({
  display: 'swap',
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
})

export const metadata: Metadata = {
  description: 'آخرین تغییرات و بهبودهای پروژه‌ها',
  title: {
    default: 'داکلی',
    template: '%s | داکلی',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="fa" dir="auto" className={vazirmatn.variable}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
  try {
    const storedTheme = localStorage.getItem('theme');
    const theme = storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
      ? storedTheme
      : 'system';

    const isDark = theme === 'dark'
      ? true
      : theme === 'light'
        ? false
        : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    document.documentElement.classList.toggle('dark', Boolean(isDark));
  } catch {
    // Ignore errors (e.g. storage blocked) and fall back to default (no .dark).
  }
})();`}
        </Script>
      </head>

      <body className="min-h-screen bg-background font-sans antialiased">
        <main>{children}</main>
      </body>
    </html>
  )
}
