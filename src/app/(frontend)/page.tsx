import { SiteHeader } from '@/components/auth/site-header'
import { ProjectPicker } from '@/components/projects/project-picker'
import { displayName, requireUser } from '@/lib/auth/session'
import { getPublishedProjects } from '@/lib/queries/projects'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type HomePageProps = {
  searchParams: Promise<{ lang?: string }>
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
      <path fill="#a62842" d="M2 18.769H31V20.615H1z" />
      <path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#a62842" />
    </svg>
  )
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await requireUser()
  const projects = await getPublishedProjects(user)
  const { lang: langParam } = await searchParams
  const lang: 'fa' | 'en' = langParam === 'en' ? 'en' : 'fa'
  const dir = lang === 'fa' ? 'rtl' : 'ltr'

  return (
    <div dir={dir}>
      <SiteHeader name={displayName(user)} />
      <section className="relative isolate overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,oklch(0.93_0.08_250/.9),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.32_0.07_225/.45),transparent_58%)]"
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-200/10"
        />
        <div
          aria-hidden
          className="absolute bottom-8 start-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-200/8"
        />

        <div className="container relative">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <div className="mb-4 inline-flex items-center rounded-full border border-border/70 bg-background/70 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              {lang === 'fa' ? 'فهرست پروژه‌ها' : 'Project list'}
            </div>

            <div className="mx-auto mb-6 max-w-xs">
              <div dir="ltr" className="inline-flex items-center rounded-full border border-border/60 bg-muted/70 p-1">
                <Link
                  aria-label="Switch language to Persian"
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                    lang === 'fa'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  href="/?lang=fa"
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
                  href="/?lang=en"
                >
                  <USFlagIcon />
                </Link>
              </div>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {lang === 'fa' ? 'پروژه مناسب را انتخاب کنید' : 'Choose the right project'}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {lang === 'fa'
                ? 'همه پروژه‌های منتشر شده در یک نمای شفاف و مرتب نمایش داده می‌شوند تا سریع‌تر وارد جزئیات تغییرات شوید.'
                : 'All published projects are shown in a clean view so you can jump into changelog details faster.'}
            </p>
          </div>

          <div className="mx-auto max-w-6xl rounded-[2rem] border border-border/60 bg-background/55 p-4 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur sm:p-6 lg:p-8 dark:bg-card/45">
            <ProjectPicker projects={projects.docs} lang={lang} />
          </div>
        </div>
      </section>
    </div>
  )
}
