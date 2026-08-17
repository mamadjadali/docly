import Image from 'next/image'
import Link from 'next/link'

import { ChangelogRichText } from '@/components/rich-text'
import { Badge } from '@/components/ui/badge'
import { formatPersianDate } from '@/lib/format-date'
import { authorName, isPopulated, mediaUrl, populatedLabels } from '@/lib/payload'
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
}

export function ChangelogEntry({ entry, projectSlug }: ChangelogEntryProps) {
  const labels = populatedLabels(entry.labels)
  const imageSrc = mediaUrl(entry.image)
  const author = authorName(entry.author)
  const imageAlt = isPopulated(entry.image) ? entry.image.alt : entry.title

  return (
    <article className="relative flex flex-col gap-4 md:flex-row md:gap-8">
      <div className="top-8 flex h-min w-full shrink-0 items-center gap-4 ps-8 md:sticky md:w-72 md:ps-0">
        <Badge variant="secondary" className="text-xs">
          نسخه {entry.version}
        </Badge>
        <time
          className="text-xs font-medium text-muted-foreground"
          dateTime={entry.publishedAt ?? undefined}
        >
          {formatPersianDate(entry.publishedAt)}
        </time>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute start-0 top-3 z-10 flex w-6 justify-center md:static md:top-auto md:shrink-0 md:self-start md:pt-1.5"
      >
        <span className="size-3 rounded-full border-2 border-primary bg-background ring-4 ring-background transition-[transform,background-color] duration-300 motion-reduce:scale-100 motion-reduce:transition-none [.is-active_&]:scale-110 [.is-active_&]:bg-primary" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col ps-8 md:ps-0">
        <h2 className="mb-3 text-lg font-bold leading-tight text-foreground/90 md:text-2xl">
          {entry.title}
        </h2>
        {(labels.length > 0 || author) && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {labels.map((label) => (
              <Link key={label.id} href={`/${projectSlug}?label=${label.slug}`}>
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
        {imageSrc && (
          <Image
            alt={imageAlt}
            className="mt-8 h-auto w-full rounded-lg object-cover"
            height={isPopulated(entry.image) ? entry.image.height ?? 675 : 675}
            sizes="(min-width: 768px) 56rem, 100vw"
            src={imageSrc}
            width={isPopulated(entry.image) ? entry.image.width ?? 1200 : 1200}
          />
        )}
      </div>
    </article>
  )
}
