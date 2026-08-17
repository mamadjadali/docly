import type { Metadata } from 'next'
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
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <main>{children}</main>
      </body>
    </html>
  )
}
