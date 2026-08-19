import Link from 'next/link'

import { ChangelogEntry } from '@/components/changelog/changelog-entry'
import { ChangelogRail } from '@/components/changelog/changelog-rail'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Changelog, Label, Project } from '@/payload-types'

type ChangelogTimelineProps = {
  className?: string
  entries: Changelog[]
  filterLabel?: Label | null
  hasNextPage?: boolean
  hasPrevPage?: boolean
  nextHref?: string
  prevHref?: string
  project: Project
  lang: 'fa' | 'en'
}

export function ChangelogTimeline({
  className,
  entries,
  filterLabel,
  hasNextPage,
  hasPrevPage,
  nextHref,
  prevHref,
  project,
  lang,
}: ChangelogTimelineProps) {
  const description = project.description?.trim() || 'آخرین تغییرات و بهبودها'

  return (
    <section className={cn('py-16 md:py-32', className)}>
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm text-muted-foreground">
            <Link className="hover:text-foreground" href="/">
              پروژه‌ها
            </Link>
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">{project.name}</h1>
          <p className="mb-6 text-base text-muted-foreground md:text-lg">{description}</p>
          {filterLabel && (
            <p className="text-sm text-muted-foreground">
              فیلتر برچسب: <span className="font-medium text-foreground">{filterLabel.name}</span>
              {' · '}
              <Link
                className="underline-offset-4 hover:underline"
                href={`/${project.slug}?lang=${lang}`}
              >
                حذف فیلتر
              </Link>
            </p>
          )}
        </div>
        <div className="mx-auto mt-16 max-w-6xl md:mt-24">
          {entries.length === 0 ? (
            <p className="text-muted-foreground">هنوز تغییری منتشر نشده است.</p>
          ) : (
            <ChangelogRail className="space-y-16 md:space-y-24">
              {entries.map((entry) => (
                <ChangelogEntry
                  key={entry.id}
                  entry={entry}
                  projectSlug={project.slug}
                  lang={lang}
                />
              ))}
            </ChangelogRail>
          )}
        </div>
        {(hasPrevPage || hasNextPage) && (
          <div className="mx-auto mt-16 flex max-w-6xl items-center justify-between">
            {hasPrevPage && prevHref ? (
              <Button asChild variant="outline">
                <Link href={prevHref}>صفحه قبل</Link>
              </Button>
            ) : (
              <span />
            )}
            {hasNextPage && nextHref ? (
              <Button asChild variant="outline">
                <Link href={nextHref}>صفحه بعد</Link>
              </Button>
            ) : (
              <span />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
