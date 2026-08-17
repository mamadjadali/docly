import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'
import { revalidatePath } from 'next/cache'

function relationId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return null
}

function relationSlug(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) return value
  if (value && typeof value === 'object' && 'slug' in value) {
    const slug = (value as { slug?: unknown }).slug
    if (typeof slug === 'string' && slug.length > 0) return slug
  }
  return null
}

async function resolveProjectSlug(payload: Payload, project: unknown): Promise<string | null> {
  const nestedSlug = relationSlug(project)
  if (nestedSlug) return nestedSlug

  const id = relationId(project)
  if (!id) return null

  const doc = await payload.findByID({
    collection: 'projects',
    id,
    depth: 0,
    disableErrors: true,
    overrideAccess: true,
  })

  return typeof doc?.slug === 'string' ? doc.slug : null
}

function revalidateProjectPaths(slugs: Array<string | null | undefined>) {
  revalidatePath('/')

  for (const slug of slugs) {
    if (slug) revalidatePath(`/${slug}`)
  }
}

export const revalidateAfterProjectChange: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { context },
}) => {
  if (context.disableRevalidate) return doc

  revalidateProjectPaths([relationSlug(doc?.slug) ?? doc?.slug, previousDoc?.slug])
  return doc
}

export const revalidateAfterProjectDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (context.disableRevalidate) return doc

  revalidateProjectPaths([doc?.slug])
  return doc
}

export const revalidateAfterChangelogChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  const [currentSlug, previousSlug] = await Promise.all([
    resolveProjectSlug(payload, doc?.project),
    resolveProjectSlug(payload, previousDoc?.project),
  ])

  revalidateProjectPaths([currentSlug, previousSlug])
  return doc
}

export const revalidateAfterChangelogDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  const slug = await resolveProjectSlug(payload, doc?.project)
  revalidateProjectPaths([slug])
  return doc
}
