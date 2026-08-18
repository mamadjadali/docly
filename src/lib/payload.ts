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

type LexicalNode = {
  alt?: unknown
  children?: LexicalNode[]
  fields?: unknown
  src?: unknown
  type?: unknown
  value?: unknown
}

function firstImageFromLexicalNodes(nodes: LexicalNode[] | undefined): {
  alt: string
  src: string
} | null {
  if (!nodes) return null

  for (const node of nodes) {
    if (node.type === 'upload') {
      const rawValue = node.value ?? (node.fields as { value?: unknown } | undefined)?.value
      if (rawValue && typeof rawValue === 'object') {
        const value = rawValue as { alt?: unknown; url?: unknown }
        if (typeof value.url === 'string' && value.url.length > 0) {
          return {
            alt: typeof value.alt === 'string' ? value.alt : '',
            src: value.url,
          }
        }
      }
    }

    if (node.type === 'image' && typeof node.src === 'string' && node.src.length > 0) {
      return {
        alt: typeof node.alt === 'string' ? node.alt : '',
        src: node.src,
      }
    }

    const nested = firstImageFromLexicalNodes(node.children)
    if (nested) return nested
  }

  return null
}

export function firstRichTextImage(
  data: { root?: { children?: LexicalNode[] } } | null | undefined,
): { alt: string; src: string } | null {
  return firstImageFromLexicalNodes(data?.root?.children)
}

export function authorName(author: string | User | null | undefined): string | null {
  if (!isPopulated(author) || !author.name) return null
  return author.name
}

export function populatedLabels(labels: (string | Label)[] | null | undefined): Label[] {
  if (!labels) return []
  return labels.filter(isPopulated)
}
