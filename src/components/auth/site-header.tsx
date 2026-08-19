import { LogoutButton } from '@/components/auth/logout-button'
import { ThemeToggle } from '@/components/theme/theme-toggle'

type SiteHeaderProps = {
  name: string
}

export function SiteHeader({ name }: SiteHeaderProps) {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <p className="text-sm font-medium">{name}</p>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
