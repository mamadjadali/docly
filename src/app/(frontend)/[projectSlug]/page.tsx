import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SiteHeader } from '@/components/auth/site-header'
import { ChangelogTimeline } from '@/components/changelog/changelog-timeline'
import { displayName, requireUser } from '@/lib/auth/session'
import { getPublishedChangelogsByProject } from '@/lib/queries/changelogs'
import { getLabelBySlug } from '@/lib/queries/labels'
import { getPublishedProjectBySlug } from '@/lib/queries/projects'

type ProjectPageProps = {
  params: Promise<{ projectSlug: string }>
  searchParams: Promise<{ label?: string; page?: string }>
}

function buildPageHref(slug: string, page: number, labelSlug?: string): string {
  const params = new URLSearchParams()
  if (labelSlug) params.set('label', labelSlug)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/${slug}?${query}` : `/${slug}`
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const user = await requireUser()
  const { projectSlug } = await params
  const project = await getPublishedProjectBySlug(projectSlug, user)

  if (!project) {
    return {
      title: 'پروژه پیدا نشد',
    }
  }

  return {
    description: project.description || `آخرین تغییرات ${project.name}`,
    title: project.name,
  }
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const user = await requireUser()
  const { projectSlug } = await params
  const { label: labelSlug, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const project = await getPublishedProjectBySlug(projectSlug, user)
  if (!project) notFound()

  const filterLabel = labelSlug ? await getLabelBySlug(labelSlug, user) : null
  const changelogs = await getPublishedChangelogsByProject({
    labelId: filterLabel?.id,
    page,
    projectId: project.id,
    user,
  })

  return (
    <>
      <SiteHeader name={displayName(user)} />
      <ChangelogTimeline
        entries={changelogs.docs}
        filterLabel={filterLabel}
        hasNextPage={changelogs.hasNextPage}
        hasPrevPage={changelogs.hasPrevPage}
        nextHref={buildPageHref(project.slug, page + 1, filterLabel?.slug)}
        prevHref={buildPageHref(project.slug, page - 1, filterLabel?.slug)}
        project={project}
      />
    </>
  )
}
