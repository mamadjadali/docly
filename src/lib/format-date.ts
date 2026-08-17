const persianDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  dateStyle: 'long',
})

export function formatPersianDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return persianDateFormatter.format(date)
}
