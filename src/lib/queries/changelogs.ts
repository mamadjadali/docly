import type { TypedUser } from 'payload'

import { getPayloadClient } from '@/lib/payload'

type GetChangelogsArgs = {
  labelId?: string
  page?: number
  projectId: string
  user: TypedUser
}

const PAGE_SIZE = 20

export async function getPublishedChangelogsByProject({
  labelId,
  page = 1,
  projectId,
  user,
}: GetChangelogsArgs) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'changelogs',
    depth: 2,
    limit: PAGE_SIZE,
    overrideAccess: false,
    page,
    sort: '-publishedAt',
    user,
    where: {
      and: [
        { project: { equals: projectId } },
        { _status: { equals: 'published' } },
        ...(labelId ? [{ labels: { in: [labelId] } }] : []),
      ],
    },
  })
}

export { PAGE_SIZE as CHANGELOG_PAGE_SIZE }
