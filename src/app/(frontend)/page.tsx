import { SiteHeader } from '@/components/auth/site-header'
import { ProjectPicker } from '@/components/projects/project-picker'
import { displayName, requireUser } from '@/lib/auth/session'
import { getPublishedProjects } from '@/lib/queries/projects'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await requireUser()
  const projects = await getPublishedProjects(user)

  return (
    <>
      <SiteHeader name={displayName(user)} />
      <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-16">
        <div className="w-full">
          <div className="mx-auto mb-8 max-w-md text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">پروژه‌ها</h1>
            <p className="text-muted-foreground">یک پروژه را انتخاب کنید تا تغییرات آن را ببینید.</p>
          </div>
          <ProjectPicker projects={projects.docs} />
        </div>
      </section>
    </>
  )
}
