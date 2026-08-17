import type { PayloadHandler } from 'payload'
import { generateExpiredPayloadCookie } from 'payload/shared'

import { getSessionId, isViewerUser } from '../../access/roles'
import type { Viewer } from '../../payload-types'

export const logoutHandler: PayloadHandler = async (req) => {
  const { user } = await req.payload.auth({ headers: req.headers })
  const collection = req.payload.collections.viewers
  const sid = getSessionId(user)

  if (isViewerUser(user) && user && sid && Array.isArray(user.sessions)) {
    const viewer = user as Viewer
    await req.payload.update({
      collection: 'viewers',
      data: {
        sessions: viewer.sessions?.filter((session) => session.id !== sid) ?? [],
      },
      id: viewer.id,
      overrideAccess: true,
    })
  }

  const cookie = generateExpiredPayloadCookie({
    collectionAuthConfig: collection.config.auth,
    cookiePrefix: req.payload.config.cookiePrefix,
  })

  return Response.json(
    { ok: true },
    {
      headers: {
        'Set-Cookie': cookie,
      },
    },
  )
}
