import type { GlobalConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Settings',
  admin: {
    group: 'Access',
  },
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  fields: [
    {
      name: 'melipayamak',
      type: 'group',
      label: 'Melipayamak',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'Username',
        },
        {
          name: 'password',
          type: 'text',
          label: 'Password',
          admin: {
            description: 'Panel password. Stored in the database; only admins can read this global.',
          },
        },
        {
          name: 'from',
          type: 'text',
          label: 'Sender number',
        },
      ],
    },
  ],
}
