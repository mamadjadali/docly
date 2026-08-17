import type { CollectionAfterChangeHook, Payload } from 'payload'

import { sendSimpleSmsToMany } from '@/lib/sms/sendSimpleSms'
import type { Changelog, Project } from '@/payload-types'

function relationId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return null
}

function publicBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  return raw.replace(/\/+$/, '')
}

function changelogPublishedMessage(projectName: string, version: string, projectSlug: string): string {
  return `${projectName} به‌روزرسانی شد 🚀
نسخه ${version} منتشر شد.
مشاهده تغییرات: ${publicBaseUrl()}/${projectSlug}/`
}

async function resolveProject(
  payload: Payload,
  project: unknown,
): Promise<Pick<Project, 'id' | 'name' | 'slug'> | null> {
  if (project && typeof project === 'object' && 'name' in project && 'slug' in project && 'id' in project) {
    const doc = project as Project
    if (typeof doc.name === 'string' && typeof doc.slug === 'string') {
      return { id: String(doc.id), name: doc.name, slug: doc.slug }
    }
  }

  const id = relationId(project)
  if (!id) return null

  const doc = await payload.findByID({
    collection: 'projects',
    id,
    depth: 0,
    disableErrors: true,
    overrideAccess: true,
  })

  if (!doc || typeof doc.name !== 'string' || typeof doc.slug !== 'string') return null

  return { id: String(doc.id), name: doc.name, slug: doc.slug }
}

export const notifyChangelogPublish: CollectionAfterChangeHook<Changelog> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc
  if (doc._status !== 'published') return doc
  if (previousDoc?._status === 'published') return doc

  try {
    const project = await resolveProject(payload, doc.project)
    if (!project || typeof doc.version !== 'string' || !doc.version) return doc

    const viewers = await payload.find({
      collection: 'viewers',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [{ active: { equals: true } }, { projects: { equals: project.id } }],
      },
    })

    const recipients = [
      ...new Set(
        viewers.docs
          .map((viewer) => viewer.phone)
          .filter((phone): phone is string => typeof phone === 'string' && phone.length > 0),
      ),
    ]

    if (recipients.length === 0) return doc

    await sendSimpleSmsToMany(
      payload,
      recipients,
      changelogPublishedMessage(project.name, doc.version, project.slug),
    )
  } catch (error) {
    console.error('Failed to send changelog publish SMS')
    console.error(error)
  }

  return doc
}
