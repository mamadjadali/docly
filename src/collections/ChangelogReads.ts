import type { CollectionConfig } from 'payload'

import { publiclyVisibleStatusWhere } from '@/lib/published-status'
import { getAssignedProjectIds, isAdminUser, isViewerUser } from '../access/roles'
import { markChangelogSeenHandler } from '../endpoints/changelog-reads/mark-seen'

export const ChangelogReads: CollectionConfig = {
  slug: 'changelog-reads',
  admin: {
    defaultColumns: ['viewerName', 'changelog', 'viewer', 'createdAt'],
    hidden: true,
  },
  access: {
    create: ({ req: { user } }) => isViewerUser(user),
    read: ({ req: { user } }) => {
      if (isAdminUser(user)) return true
      if (!isViewerUser(user)) return false

      const projectIds = getAssignedProjectIds(user)
      // Allow viewers to read read-records only for changelogs in their assigned projects.
      return {
        changelog: {
          and: [{ project: { in: projectIds } }, publiclyVisibleStatusWhere],
        },
      } as any
    },
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'changelog',
      type: 'relationship',
      relationTo: 'changelogs',
      required: true,
      index: true,
    },
    {
      name: 'viewer',
      type: 'relationship',
      relationTo: 'viewers',
      required: true,
      index: true,
    },
    {
      name: 'viewerName',
      type: 'text',
      required: true,
    },
  ],
  endpoints: [
    {
      handler: markChangelogSeenHandler,
      method: 'post',
      path: '/mark-seen',
    },
  ],
  timestamps: true,
}

