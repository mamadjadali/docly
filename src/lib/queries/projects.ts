import type { TypedUser } from 'payload'

import { getPayloadClient } from '@/lib/payload'
import type { Project } from '@/payload-types'

const projectDepth = 1

export type SupportedLocale = 'fa' | 'en'

export async function getPublishedProjects(user: TypedUser, locale: SupportedLocale = 'fa') {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'projects',
    depth: projectDepth,
    limit: 100,
    fallbackLocale: 'fa',
    overrideAccess: false,
    pagination: false,
    sort: 'name',
    user,
    locale,
    where: {
      _status: {
        equals: 'published',
      },
    },
  })
}

export async function getPublishedProjectBySlug(
  slug: string,
  user: TypedUser,
  locale: SupportedLocale = 'fa',
): Promise<Project | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'projects',
    depth: projectDepth,
    fallbackLocale: 'fa',
    limit: 1,
    overrideAccess: false,
    pagination: false,
    user,
    locale,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  return result.docs[0] ?? null
}
