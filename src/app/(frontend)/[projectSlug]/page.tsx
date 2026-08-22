import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SiteHeader } from '@/components/auth/site-header'
import { ChangelogTimeline } from '@/components/changelog/changelog-timeline'
import { displayName, requireUser } from '@/lib/auth/session'
import { getPublishedChangelogsByProject } from '@/lib/queries/changelogs'
import { getLabelBySlug } from '@/lib/queries/labels'
import { getPublishedProjectBySlug } from '@/lib/queries/projects'

type ProjectPageProps = {
  params: Promise<{ projectSlug: string }>
  searchParams: Promise<{ label?: string; page?: string; lang?: string }>
}

function IranFlagIcon() {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className="size-5">
      <path fill="#fff" d="M1 11H31V21H1z" />
      <path d="M5,4H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" fill="#4d9e4a" />
      <path
        d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z"
        transform="rotate(180 16 24)"
        fill="#c92a1d"
      />
      <path
        d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
        opacity=".15"
      />
      <path
        d="M18.061,16.805c.39-1.199,.021-2.514-.934-3.337,1.038,1.536,.664,3.611-.825,4.692l.104-2.56v-2.015c-.161-.077-.301-.194-.405-.34-.104,.145-.243,.262-.405,.34v2.015l.104,2.56c-1.489-1.081-1.864-3.156-.825-4.692-.956,.822-1.324,2.138-.934,3.337,.263,.809,.825,1.437,1.523,1.803-.427,.156-.883,.227-1.342,.204,.539,.175,1.091,.195,1.608,.086l.004,.108,.267,.367,.267-.367,.004-.108c.517,.109,1.069,.089,1.608-.086-.459,.022-.915-.049-1.342-.204,.699-.366,1.26-.994,1.523-1.803Z"
        fill="#c92a1d"
      />
      <path
        d="M19.077,14.634c-.355-.614-.943-1.058-1.631-1.23,1.513,1.138,1.818,3.287,.68,4.801-.002,.003-.004,.005-.006,.008,1.252-.724,1.681-2.326,.957-3.578Z"
        fill="#c92a1d"
      />
      <path
        d="M14.554,13.404c-.688,.172-1.277,.616-1.631,1.23-.724,1.252-.295,2.854,.957,3.578-.002-.003-.004-.005-.006-.008-1.138-1.513-.833-3.663,.68-4.801Z"
        fill="#c92a1d"
      />
      <path
        d="M15.311,13.215c.223,.157,.532,.103,.689-.12,.157,.223,.466,.277,.689,.12,.187-.132,.26-.375,.175-.588-.048,.254-.292,.421-.546,.373-.134-.025-.25-.107-.318-.225-.068,.118-.184,.2-.318,.225-.254,.048-.498-.119-.546-.373-.085,.213-.013,.456,.175,.588Z"
        fill="#c92a1d"
      />
      <path
        d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
        fill="#fff"
        opacity=".2"
      />
    </svg>
  )
}

function USFlagIcon() {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className="size-5">
      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff" />
      <path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#a62842" />
      <path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#a62842" />
      <path fill="#a62842" d="M2 11.385H31V13.231000000000002H2z" />
      <path fill="#a62842" d="M2 15.077H31V16.923000000000002H2z" />
      <path fill="#a62842" d="M1 18.769H31V20.615H1z" />
      <path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#a62842" />
      <path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#a62842" />
      <path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e" />
      <path
        d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
        opacity=".15"
      />
      <path
        d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
        fill="#fff"
        opacity=".2"
      />
    </svg>
  )
}

function buildPageHref(
  slug: string,
  page: number,
  labelSlug: string | undefined,
  lang: 'fa' | 'en',
): string {
  const params = new URLSearchParams()
  if (labelSlug) params.set('label', labelSlug)
  if (page > 1) params.set('page', String(page))
  params.set('lang', lang)
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
  const { label: labelSlug, page: pageParam, lang: langParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const lang: 'fa' | 'en' = langParam === 'en' ? 'en' : 'fa'
  const dir = lang === 'fa' ? 'rtl' : 'ltr'

  const project = await getPublishedProjectBySlug(projectSlug, user, lang)
  if (!project) notFound()

  const filterLabel = labelSlug ? await getLabelBySlug(labelSlug, user, lang) : null
  const changelogs = await getPublishedChangelogsByProject({
    labelId: filterLabel?.id,
    page,
    projectId: project.id,
    user,
    locale: lang,
  })

  return (
    <>
      <div dir={dir}>
        <SiteHeader name={displayName(user)} />
        <div className="container mb-3 mt-4 flex items-center justify-center">
          <div dir="ltr" className="inline-flex items-center rounded-full border border-border/60 bg-muted/70 p-1">
            <Link
              aria-label="Switch language to Persian"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                lang === 'fa'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
              href={buildPageHref(project.slug, page, filterLabel?.slug, 'fa')}
            >
              <IranFlagIcon />
            </Link>
            <Link
              aria-label="Switch language to English"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                lang === 'en'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
              href={buildPageHref(project.slug, page, filterLabel?.slug, 'en')}
            >
              <USFlagIcon />
            </Link>
          </div>
        </div>

        <div className="container mb-6 mt-1">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/">
                  {lang === 'fa' ? 'پروژه‌ها' : 'Projects'}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  className="hover:text-foreground"
                  href={buildPageHref(project.slug, page, undefined, lang)}
                >
                  {project.name}
                </Link>
              </li>

              {filterLabel && (
                <>
                  <li aria-hidden>/</li>
                  <li className="text-foreground">{filterLabel.name}</li>
                </>
              )}

              {page > 1 && (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    {lang === 'fa' ? `صفحه ${page}` : `Page ${page}`}
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>

        <ChangelogTimeline
          entries={changelogs.docs}
          filterLabel={filterLabel}
          hasNextPage={changelogs.hasNextPage}
          hasPrevPage={changelogs.hasPrevPage}
          nextHref={buildPageHref(project.slug, page + 1, filterLabel?.slug, lang)}
          prevHref={buildPageHref(project.slug, page - 1, filterLabel?.slug, lang)}
          project={project}
          lang={lang}
        />
      </div>
    </>
  )
}
