import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { TypedUser } from 'payload'

import { getPayloadClient } from '@/lib/payload'

export async function getCurrentUser(): Promise<TypedUser | null> {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user ?? null
}

export async function requireUser(): Promise<TypedUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export function displayName(user: TypedUser): string {
  if ('name' in user && typeof user.name === 'string' && user.name.trim()) {
    return user.name
  }
  if ('email' in user && typeof user.email === 'string') {
    return user.email
  }
  return 'کاربر'
}
