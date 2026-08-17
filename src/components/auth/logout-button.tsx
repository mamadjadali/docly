'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function logout() {
    setPending(true)
    try {
      await fetch('/api/viewers/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      router.replace('/login')
      router.refresh()
      setPending(false)
    }
  }

  return (
    <Button disabled={pending} onClick={() => void logout()} size="sm" variant="ghost">
      {pending ? 'خروج...' : 'خروج'}
    </Button>
  )
}
