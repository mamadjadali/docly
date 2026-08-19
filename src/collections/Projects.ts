import type { CollectionConfig, TextField, TextFieldSingleValidation } from 'payload'
import { slugField } from 'payload'

import { adminOnly } from '../access/adminOnly'
import { projectsRead } from '../access/projectsRead'
import {
  revalidateAfterProjectChange,
  revalidateAfterProjectDelete,
} from '../hooks/revalidateProject'
import { isReservedProjectSlug } from '../lib/reserved-slugs'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    defaultColumns: ['name', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    useAsTitle: 'name',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: projectsRead,
    update: adminOnly,
    readVersions: adminOnly,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      localized: true,
    },
    slugField({
      useAsSlug: 'name',
      overrides: (field) => {
        const slugFieldConfig = field.fields[1] as TextField
        const existingValidate = slugFieldConfig.validate
        const validateReservedSlug: TextFieldSingleValidation = async (value, args) => {
          if (typeof value === 'string' && isReservedProjectSlug(value)) {
            return `"${value}" is reserved and cannot be used as a project slug`
          }

          if (typeof existingValidate === 'function') {
            return (existingValidate as TextFieldSingleValidation)(value, args)
          }

          return true
        }

        slugFieldConfig.validate = validateReservedSlug

        return field
      },
    }),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'changelogs',
      type: 'join',
      collection: 'changelogs',
      on: 'project',
      admin: {
        defaultColumns: ['title', 'version', '_status', 'publishedAt'],
      },
    },
  ],
  hooks: {
    afterChange: [revalidateAfterProjectChange],
    afterDelete: [revalidateAfterProjectDelete],
  },
  timestamps: true,
}
