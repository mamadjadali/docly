import Link from 'next/link'

import { ChangelogRichText } from '@/components/rich-text'
import { Badge } from '@/components/ui/badge'
import { formatPersianDate } from '@/lib/format-date'
import { authorName, firstRichTextImage, isPopulated, mediaUrl, populatedLabels } from '@/lib/payload'
import { cn } from '@/lib/utils'
import type { Changelog, Label } from '@/payload-types'

const labelColorClass: Record<NonNullable<Label['color']>, string> = {
  gray: 'border-transparent bg-muted text-muted-foreground',
  blue: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  green: 'border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  amber: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  red: 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
}

type ChangelogEntryProps = {
  entry: Changelog
  projectSlug: string
  lang: 'fa' | 'en'
}

function VersionMeta({ version, publishedAt }: { version: string; publishedAt?: string | null }) {
  return (
    <>
      <Badge variant="secondary" className="shrink-0 text-xs">
        نسخه {version}
      </Badge>
      <time
        className="text-xs font-medium text-muted-foreground"
        dateTime={publishedAt ?? undefined}
      >
        {formatPersianDate(publishedAt)}
      </time>
    </>
  )
}

export function ChangelogEntry({ entry, projectSlug, lang }: ChangelogEntryProps) {
  const labels = populatedLabels(entry.labels)
  const fieldImageSrc = mediaUrl(entry.image)
  const bodyImage = firstRichTextImage(entry.description)
  const thumbSrc = fieldImageSrc ?? bodyImage?.src ?? null
  const author = authorName(entry.author)
  const imageAlt = isPopulated(entry.image)
    ? entry.image.alt
    : bodyImage?.alt || entry.title

  const readsDocs = ((entry as unknown as { reads?: { docs?: unknown[] } }).reads?.docs ?? []) as unknown[]
  const readerNames = Array.from(
    new Set(
      readsDocs
        .map((doc) => (doc && typeof doc === 'object' ? (doc as { viewerName?: unknown }).viewerName : null))
        .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
        .map((name) => name.trim()),
    ),
  )

  return (
    <article className="relative flex min-w-0 max-w-full flex-col gap-4 overflow-x-clip md:flex-row md:gap-6">
      <div className="top-8 h-min w-44 shrink-0 max-md:hidden md:sticky md:self-start">
        {thumbSrc ? (
          <img
            alt={imageAlt}
            className="aspect-video w-full rounded-xl object-cover"
            src={thumbSrc}
          />
        ) : null}
      </div>

      <div className="top-8 hidden h-min shrink-0 md:sticky md:flex md:w-40 md:flex-col md:gap-2 md:self-start">
        <VersionMeta version={entry.version} publishedAt={entry.publishedAt} />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute start-0 top-3 z-10 flex w-6 justify-center md:static md:top-auto md:shrink-0 md:self-start md:pt-1.5"
      >
        <span className="size-3 rounded-full border-2 border-primary bg-background ring-4 ring-background transition-[transform,background-color] duration-300 motion-reduce:scale-100 motion-reduce:transition-none [.is-active_&]:scale-110 [.is-active_&]:bg-primary" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col ps-8 md:ps-0">
        <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2 md:hidden">
          <VersionMeta version={entry.version} publishedAt={entry.publishedAt} />
        </div>

        <h2 className="mb-3 text-lg font-bold leading-tight text-foreground/90 md:text-2xl">
          {entry.title}
        </h2>

        {readerNames.length > 0 && (
          <div className="mb-3 flex w-full min-w-0 flex-col items-end text-right">
            <p className="text-xs font-medium text-muted-foreground">مشاهده شده توسط</p>
            <div className="mt-2 flex w-full flex-wrap justify-end gap-2">
              {readerNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex max-w-full items-center justify-center rounded-full bg-muted px-3 py-1 text-xs text-foreground/90 sm:max-w-[12rem]"
                  title={name}
                >
                  <span className="truncate">{name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {(labels.length > 0 || author) && (
          <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2">
            {labels.map((label) => (
              <Link key={label.id} href={`/${projectSlug}?label=${label.slug}&lang=${lang}`}>
                <Badge
                  variant="outline"
                  className={cn(label.color ? labelColorClass[label.color] : undefined)}
                >
                  {label.name}
                </Badge>
              </Link>
            ))}
            {author && (
              <span className="text-xs text-muted-foreground md:text-sm">{author}</span>
            )}
          </div>
        )}

        <ChangelogRichText data={entry.description} />

        {fieldImageSrc && (
          <img
            alt={imageAlt}
            className="mt-8 h-auto max-w-full rounded-xl object-cover"
            src={fieldImageSrc}
          />
        )}
      </div>
    </article>
  )
}
