import type { Access } from 'payload'

import { isAdminUser } from './roles'

export const adminOnly: Access = ({ req: { user } }) => isAdminUser(user)
