import type { CollectionConfig, TextFieldSingleValidation } from 'payload'
import { baseSessionsField } from 'payload'

import { adminOnly } from '../access/adminOnly'
import { isAdminUser } from '../access/roles'
import { viewersRead } from '../access/viewersRead'
import { requestOtpHandler } from '../endpoints/otp/request'
import { verifyOtpHandler } from '../endpoints/otp/verify'
import { logoutHandler } from '../endpoints/otp/logout'
import { isValidIranMobile, normalizePhone } from '../lib/otp/phone'

export const Viewers: CollectionConfig = {
  slug: 'viewers',
  admin: {
    defaultColumns: ['name', 'phone', 'active', 'updatedAt'],
    group: 'Access',
    useAsTitle: 'name',
  },
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
    disableLocalStrategy: true,
    tokenExpiration: 60 * 60 * 24 * 7,
    useSessions: true,
  },
  access: {
    admin: ({ req: { user } }) => isAdminUser(user),
    create: adminOnly,
    delete: adminOnly,
    read: viewersRead,
    unlock: adminOnly,
    update: adminOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (typeof value !== 'string') return value
            return normalizePhone(value) ?? value
          },
        ],
      },
      validate: ((value) => {
        if (typeof value !== 'string' || !isValidIranMobile(value)) {
          return 'Enter a valid Iranian mobile number'
        }
        return true
      }) satisfies TextFieldSingleValidation,
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      required: true,
      saveToJWT: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    baseSessionsField,
  ],
  endpoints: [
    {
      handler: requestOtpHandler,
      method: 'post',
      path: '/otp/request',
    },
    {
      handler: verifyOtpHandler,
      method: 'post',
      path: '/otp/verify',
    },
    {
      handler: logoutHandler,
      method: 'post',
      path: '/logout',
    },
  ],
  timestamps: true,
}
