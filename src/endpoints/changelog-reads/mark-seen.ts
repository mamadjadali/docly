import type { PayloadHandler } from 'payload'

import { isViewerUser } from '../../access/roles'
import type { Viewer } from '../../payload-types'
import { readJsonBody } from '../otp/read-json'

export const markChangelogSeenHandler: PayloadHandler = async (req) => {
  const body = await readJsonBody(req)
  const changelogId = typeof body.changelogId === 'string' ? body.changelogId : null

  if (!changelogId) {
    return Response.json({ ok: false, message: 'Missing changelogId' }, { status: 400 })
  }

  const { user } = await req.payload.auth({ headers: req.headers })

  if (!user || !isViewerUser(user)) {
    return Response.json({ ok: false, message: 'Unauthorized' }, { status: 403 })
  }

  const viewer = user as Viewer
  const viewerName = viewer.name?.trim() || 'Viewer'

  const existing = await req.payload.find({
    collection: 'changelog-reads',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { changelog: { equals: changelogId } },
        { viewer: { equals: viewer.id } },
      ],
    },
  })

  if (existing.totalDocs > 0) {
    return Response.json({ ok: true, created: false })
  }

  await req.payload.create({
    collection: 'changelog-reads',
    data: {
      changelog: changelogId,
      viewer: viewer.id,
      viewerName,
    },
    overrideAccess: true,
  })

  return Response.json({ ok: true, created: true })
}

