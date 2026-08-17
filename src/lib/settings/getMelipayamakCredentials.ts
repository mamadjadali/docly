import type { Payload } from 'payload'

export type MelipayamakCredentials = {
  from: string
  password: string
  username: string
}

export async function getMelipayamakCredentials(
  payload: Payload,
): Promise<MelipayamakCredentials | null> {
  const settings = await payload.findGlobal({
    overrideAccess: true,
    slug: 'settings',
  })

  const username = settings.melipayamak?.username?.trim()
  const password = settings.melipayamak?.password?.trim()
  const from = settings.melipayamak?.from?.trim()

  if (!username || !password || !from) return null

  return { from, password, username }
}
