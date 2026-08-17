import Image from 'next/image'
import Link from 'next/link'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isPopulated, mediaUrl } from '@/lib/payload'
import type { Project } from '@/payload-types'

type ProjectPickerProps = {
  projects: Project[]
}

export function ProjectPicker({ projects }: ProjectPickerProps) {
  if (projects.length === 0) {
    return (
      <p className="text-center text-muted-foreground">پروژه‌ای برای شما تعریف نشده است.</p>
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-3">
      {projects.map((project) => {
        const logo = mediaUrl(project.logo)

        return (
          <Link key={project.id} href={`/${project.slug}`}>
            <Card className="py-4 transition-colors hover:bg-accent">
              <CardHeader className="flex flex-row items-center gap-4 px-5">
                {logo && (
                  <Image
                    alt={isPopulated(project.logo) ? project.logo.alt : project.name}
                    className="size-12 rounded-lg object-cover"
                    height={48}
                    src={logo}
                    width={48}
                  />
                )}
                <div className="min-w-0">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription className="mt-1 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
