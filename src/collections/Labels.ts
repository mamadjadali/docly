import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOnly } from '../access/adminOnly'
import { authenticated } from '../access/authenticated'

export const Labels: CollectionConfig = {
  slug: 'labels',
  admin: {
    defaultColumns: ['name', 'slug', 'color'],
    group: 'Content',
    useAsTitle: 'name',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: authenticated,
    update: adminOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ useAsSlug: 'name' }),
    {
      name: 'color',
      type: 'select',
      defaultValue: 'gray',
      options: [
        { label: 'Gray', value: 'gray' },
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Amber', value: 'amber' },
        { label: 'Red', value: 'red' },
      ],
    },
  ],
  timestamps: true,
}
