import type { Access, Where } from 'payload'

import { getAssignedProjectIds, isAdminUser, isViewerUser } from './roles'

export const changelogsRead: Access = ({ req: { user } }) => {
  if (isAdminUser(user)) return true

  if (isViewerUser(user)) {
    const query: Where = {
      and: [
        { _status: { equals: 'published' } },
        { project: { in: getAssignedProjectIds(user) } },
      ],
    }
    return query
  }

  return false
}
