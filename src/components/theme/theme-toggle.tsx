'use client'

import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function readStoredTheme(): 'light' | 'dark' | 'system' | null {
  try {
    const value = window.localStorage.getItem('theme')
    if (value === 'light' || value === 'dark' || value === 'system') return value
    return value ? 'system' : null
  } catch {
    return null
  }
}

function getIsDark(): boolean {
  const stored = readStoredTheme()

  if (stored === 'dark') return true
  if (stored === 'light') return false

  // Default (storedTheme is null or 'system'): follow OS preference.
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  return document.documentElement.classList.contains('dark')
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  )
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Safe access during the client render/hydration phase.
    if (typeof window === 'undefined') return false
    return getIsDark()
  })

  const onToggle = useCallback(() => {
    const nextIsDark = !isDark
    setIsDark(nextIsDark)

    try {
      window.localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
    } catch {
      // Ignore storage failures; theme class still updates for the current session.
    }

    document.documentElement.classList.toggle('dark', nextIsDark)
  }, [isDark])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => void onToggle()}
      aria-label={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <SunIcon
          className={cn(
            'absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
            isDark ? 'opacity-0 scale-75' : 'opacity-100 scale-100',
          )}
        />
        <MoonIcon
          className={cn(
            'absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
            isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
          )}
        />
      </span>
    </Button>
  )
}

