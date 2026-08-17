import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { adminOnly } from '../access/adminOnly'
import { changelogsRead } from '../access/changelogsRead'
import { notifyChangelogPublish } from '../hooks/notifyChangelogPublish'
import {
  revalidateAfterChangelogChange,
  revalidateAfterChangelogDelete,
} from '../hooks/revalidateProject'

function relationId(value: unknown): string | number | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return (value as { id: string | number }).id
  }
  return null
}

export const Changelogs: CollectionConfig = {
  slug: 'changelogs',
  admin: {
    defaultColumns: ['title', 'version', 'project', 'author', '_status', 'publishedAt'],
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: changelogsRead,
    update: adminOnly,
    readVersions: adminOnly,
  },
  versions: {
    drafts: true,
  },
  defaultSort: '-publishedAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'labels',
      type: 'relationship',
      relationTo: 'labels',
      hasMany: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
      validate: (async (value, { req, id, siblingData }) => {
        if (typeof value !== 'string' || !value) return true

        const projectId = relationId(
          siblingData && typeof siblingData === 'object'
            ? (siblingData as { project?: unknown }).project
            : undefined,
        )
        if (!projectId) return true

        const existing = await req.payload.find({
          collection: 'changelogs',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          where: {
            and: [
              { project: { equals: projectId } },
              { version: { equals: value } },
              ...(id ? [{ id: { not_equals: id } }] : []),
            ],
          },
        })

        if (existing.totalDocs > 0) {
          return 'This version already exists for the selected project'
        }

        return true
      }) satisfies TextFieldSingleValidation,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create' && !data.author && req.user) {
          data.author = req.user.id
        }

        if (data._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }

        return data
      },
    ],
    afterChange: [revalidateAfterChangelogChange, notifyChangelogPublish],
    afterDelete: [revalidateAfterChangelogDelete],
  },
  timestamps: true,
}
