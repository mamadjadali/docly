import type { Access } from 'payload'

import { isAdminUser, isViewerUser } from './roles'

export const viewersRead: Access = ({ req: { user } }) => {
  if (isAdminUser(user)) return true

  if (isViewerUser(user) && user?.id) {
    return {
      id: {
        equals: user.id,
      },
    }
  }

  return false
}
