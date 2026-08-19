import type { TypedUser } from 'payload'

import { getPayloadClient } from '@/lib/payload'

import type { SupportedLocale } from './projects'

export async function getLabelBySlug(
  slug: string,
  user: TypedUser,
  locale: SupportedLocale = 'fa',
) {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'labels',
    depth: 0,
    fallbackLocale: 'fa',
    limit: 1,
    overrideAccess: false,
    pagination: false,
    user,
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0] ?? null
}
