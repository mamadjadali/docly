import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="py-32">
      <div className="container mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight">صفحه پیدا نشد</h1>
        <p className="mb-8 text-muted-foreground">این مسیر وجود ندارد یا هنوز منتشر نشده است.</p>
        <Link className="text-primary underline-offset-4 hover:underline" href="/">
          بازگشت به پروژه‌ها
        </Link>
      </div>
    </section>
  )
}
