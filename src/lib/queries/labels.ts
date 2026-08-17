import type { TypedUser } from 'payload'

import { getPayloadClient } from '@/lib/payload'

export async function getLabelBySlug(slug: string, user: TypedUser) {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'labels',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    user,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0] ?? null
}
