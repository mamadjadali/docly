import type { CollectionConfig } from 'payload'

export const OtpChallenges: CollectionConfig = {
  slug: 'otp-challenges',
  admin: {
    hidden: true,
  },
  access: {
    admin: () => false,
    create: () => false,
    delete: () => false,
    read: () => false,
    update: () => false,
  },
  fields: [
    {
      name: 'phone',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'codeHash',
      type: 'text',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 0,
      required: true,
    },
    {
      name: 'ip',
      type: 'text',
    },
    {
      name: 'consumedAt',
      type: 'date',
    },
  ],
  timestamps: true,
}
