const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const IRAN_MOBILE = /^09\d{9}$/

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit)
    if (persianIndex >= 0) return String(persianIndex)
    const arabicIndex = ARABIC_DIGITS.indexOf(digit)
    if (arabicIndex >= 0) return String(arabicIndex)
    return digit
  })
}

export function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null

  let phone = toEnglishDigits(value).replace(/[\s-]/g, '')

  if (phone.startsWith('+98')) phone = `0${phone.slice(3)}`
  else if (phone.startsWith('0098')) phone = `0${phone.slice(4)}`
  else if (phone.startsWith('98')) phone = `0${phone.slice(2)}`
  else if (phone.length === 10 && phone.startsWith('9')) phone = `0${phone}`

  return IRAN_MOBILE.test(phone) ? phone : null
}

export function isValidIranMobile(value: string | null | undefined): boolean {
  return Boolean(normalizePhone(value))
}
