import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'

export function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

export function hashOtp(phone: string, code: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(`${phone}:${code}`).digest()
}

export function hashOtpHex(phone: string, code: string, secret: string): string {
  return hashOtp(phone, code, secret).toString('hex')
}

export function otpHashesMatch(storedHex: string, phone: string, code: string, secret: string): boolean {
  const stored = Buffer.from(storedHex, 'hex')
  const computed = hashOtp(phone, code, secret)

  if (stored.length !== computed.length) return false
  return timingSafeEqual(stored, computed)
}
