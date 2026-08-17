import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/login-form'
import { getCurrentUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect('/')

  return (
    <section className="flex min-h-screen items-center justify-center px-4">
      <LoginForm />
    </section>
  )
}
