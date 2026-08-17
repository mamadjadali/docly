import type { Access, Where } from 'payload'

import { getAssignedProjectIds, isAdminUser, isViewerUser } from './roles'

export const projectsRead: Access = ({ req: { user } }) => {
  if (isAdminUser(user)) return true

  if (isViewerUser(user)) {
    const query: Where = {
      and: [
        { _status: { equals: 'published' } },
        { id: { in: getAssignedProjectIds(user) } },
      ],
    }
    return query
  }

  return false
}
