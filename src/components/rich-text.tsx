import { RichText } from '@payloadcms/richtext-lexical/react'

import { cn } from '@/lib/utils'
import type { Changelog } from '@/payload-types'

type ChangelogRichTextProps = {
  className?: string
  data: Changelog['description']
}

export function ChangelogRichText({ className, data }: ChangelogRichTextProps) {
  return (
    <RichText
      className={cn(
        'text-sm text-muted-foreground md:text-base',
        '[&_p]:mb-3 [&_p:last-child]:mb-0',
        '[&_ul]:mt-4 [&_ul]:ms-4 [&_ul]:list-disc [&_ul]:space-y-1.5',
        '[&_ol]:mt-4 [&_ol]:ms-4 [&_ol]:list-decimal [&_ol]:space-y-1.5',
        '[&_a]:underline [&_a]:underline-offset-4',
        '[&_figure]:overflow-hidden [&_figure]:rounded-xl',
        '[&_img]:mt-8 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-xl [&_img]:object-cover',
        className,
      )}
      data={data}
    />
  )
}
