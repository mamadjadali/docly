import { getPayload } from 'payload'

import config from '@payload-config'
import type { Label, Media, User } from '@/payload-types'

export async function getPayloadClient() {
  return getPayload({ config })
}

export function isPopulated<T extends { id: string }>(
  value: string | T | null | undefined,
): value is T {
  return typeof value === 'object' && value !== null && 'id' in value
}

export function mediaUrl(media: string | Media | null | undefined): string | null {
  if (!isPopulated(media) || !media.url) return null
  return media.url
}

export function authorName(author: string | User | null | undefined): string | null {
  if (!isPopulated(author) || !author.name) return null
  return author.name
}

export function populatedLabels(labels: (string | Label)[] | null | undefined): Label[] {
  if (!labels) return []
  return labels.filter(isPopulated)
}
