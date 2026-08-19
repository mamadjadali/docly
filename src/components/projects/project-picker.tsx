import Image from 'next/image'
import Link from 'next/link'

import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { isPopulated, mediaUrl } from '@/lib/payload'
import type { Changelog, Project } from '@/payload-types'

const DAY_MS = 1000 * 60 * 60 * 24
const FALLBACK_DAYS_AGO = 2

function toPersianDigits(value: number) {
  return value
    .toString()
    .replace(/[0-9]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'[Number(d)]))
}

function formatAgoFa(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / DAY_MS)
  if (diffDays <= 0) return 'امروز'
  if (diffDays === 1) return 'دیروز'
  return `${toPersianDigits(diffDays)} روز پیش`
}

function formatAgoEn(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / DAY_MS)
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  return `${diffDays} days ago`
}

function getLatestPublishedAt(docs: Array<string | Changelog> | undefined): Date | null {
  let latest: Date | null = null

  for (const doc of docs ?? []) {
    if (typeof doc === 'string') continue
    const publishedAt = doc.publishedAt
    if (!publishedAt) continue

    const date = new Date(publishedAt)
    if (Number.isNaN(date.getTime())) continue
    if (!latest || date.getTime() > latest.getTime()) latest = date
  }

  return latest
}

type ProjectPickerProps = {
  projects: Project[]
  lang: 'fa' | 'en'
}

export function ProjectPicker({ projects, lang }: ProjectPickerProps) {
  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-[1.75rem] border border-dashed border-border/70 bg-card/80 px-6 py-14 text-center shadow-sm">
        <p className="text-lg font-medium">
          {lang === 'fa' ? 'هنوز پروژه‌ای برای شما تعریف نشده است.' : 'No projects available.'}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === 'fa'
            ? 'به محض اضافه شدن پروژه‌های جدید، از همین صفحه می‌توانید وارد جزئیات آن‌ها شوید.'
            : 'As soon as new projects are added, you can open their details from this page.'}
        </p>
      </div>
    )
  }

  const projectLabel = lang === 'fa' ? 'پروژه' : 'Project'
  const changelogLabel = lang === 'fa' ? 'تغییرات' : 'Changelog'
  const viewLatest = lang === 'fa' ? 'مشاهده آخرین تغییرات' : 'View latest changes'
  const ctaText = lang === 'fa' ? 'ورود به پروژه' : 'Open project'

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const logo = mediaUrl(project.logo)
        const description =
          project.description?.trim() ||
          (lang === 'fa'
            ? 'آخرین وضعیت و تغییرات این پروژه را مشاهده کنید.'
            : 'Latest status and updates for this project.')
        const latestPublishedAt = getLatestPublishedAt(project.changelogs?.docs)
        const fallbackDate = new Date(Date.now() - FALLBACK_DAYS_AGO * DAY_MS)
        const badgeDate = latestPublishedAt ?? fallbackDate
        const faAgo = formatAgoFa(badgeDate)
        const enAgo = formatAgoEn(badgeDate)
        const badgeText =
          lang === 'fa' ? `آخرین تغییرات: ${faAgo}` : `Last update: ${enAgo}`

        return (
          <Link key={project.id} href={`/${project.slug}`} className="group block h-full">
            <Card className="h-full rounded-[1.5rem] border-border/70 bg-card/95 p-0 shadow-[0_18px_52px_-42px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_26px_78px_-44px_rgba(0,0,0,0.5)] focus-within:border-ring">
              <div className="flex h-full flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
                      {logo ? (
                        <Image
                          alt={isPopulated(project.logo) ? project.logo.alt : project.name}
                          className="size-full object-cover"
                          height={48}
                          src={logo}
                          width={48}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {project.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{projectLabel}</p>
                      <p className="truncate text-sm font-medium text-foreground/80">{project.slug}</p>
                    </div>
                  </div>

                  <div className="inline-flex h-8 max-w-[9.5rem] items-center justify-center rounded-full border border-border/60 bg-background px-3 text-xs font-medium text-muted-foreground shadow-sm transition-colors group-hover:border-primary/30 group-hover:text-foreground">
                    <span className="truncate">{badgeText}</span>
                  </div>
                </div>

                <div className="mt-6 flex-1 text-start">
                  <CardTitle className="text-xl leading-tight tracking-tight sm:text-[1.5rem]">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-2 text-sm leading-6 sm:text-[0.95rem]">
                    {description}
                  </CardDescription>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {changelogLabel}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{viewLatest}</p>
                  </div>

                  <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-foreground px-3 text-sm font-medium text-background transition-all duration-300 group-hover:scale-[1.02] group-hover:bg-primary group-hover:text-primary-foreground">
                    {ctaText}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
