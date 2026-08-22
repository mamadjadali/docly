import type { TypedUser } from 'payload'

import { getPayloadClient } from '@/lib/payload'
import { publiclyVisibleStatusWhere } from '@/lib/published-status'
import type { SupportedLocale } from './projects'

type GetChangelogsArgs = {
  labelId?: string
  page?: number
  projectId: string
  user: TypedUser
  locale?: SupportedLocale
}

const PAGE_SIZE = 20

export async function getPublishedChangelogsByProject({
  labelId,
  page = 1,
  projectId,
  user,
  locale = 'fa',
}: GetChangelogsArgs) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'changelogs',
    depth: 4,
    fallbackLocale: 'fa',
    limit: PAGE_SIZE,
    overrideAccess: false,
    page,
    sort: '-publishedAt',
    user,
    locale,
    where: {
      and: [
        { project: { equals: projectId } },
        publiclyVisibleStatusWhere,
        ...(labelId ? [{ labels: { in: [labelId] } }] : []),
      ],
    },
  })
}

export { PAGE_SIZE as CHANGELOG_PAGE_SIZE }
