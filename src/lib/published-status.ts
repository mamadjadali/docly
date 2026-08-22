import type { Where } from 'payload'

/**
 * Documents visible on the public frontend.
 * Payload sets `_status` to `changed` when a published doc has newer draft edits
 * (e.g. after adding EN locale content). Those should still be readable.
 */
export const publiclyVisibleStatusWhere: Where = {
  or: [{ _status: { equals: 'published' } }, { _status: { equals: 'changed' } }],
}
