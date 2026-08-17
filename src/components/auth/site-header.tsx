import { LogoutButton } from '@/components/auth/logout-button'

type SiteHeaderProps = {
  name: string
}

export function SiteHeader({ name }: SiteHeaderProps) {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <p className="text-sm font-medium">{name}</p>
        <LogoutButton />
      </div>
    </header>
  )
}
