import type { Payload, PayloadRequest } from 'payload'

import {
  OTP_MAX_SENDS_PER_IP_PER_HOUR,
  OTP_MAX_SENDS_PER_PHONE_PER_HOUR,
  OTP_RESEND_COOLDOWN_MS,
} from './constants'

const HOUR_MS = 60 * 60 * 1000

export function getClientIp(req: PayloadRequest): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || undefined
  return req.headers.get('x-real-ip') ?? undefined
}

export async function canSendOtp(args: {
  ip?: string
  payload: Payload
  phone: string
}): Promise<boolean> {
  const { ip, payload, phone } = args
  const hourAgo = new Date(Date.now() - HOUR_MS).toISOString()

  const [phoneSends, ipSends, latest] = await Promise.all([
    payload.count({
      collection: 'otp-challenges',
      overrideAccess: true,
      where: {
        and: [{ phone: { equals: phone } }, { createdAt: { greater_than: hourAgo } }],
      },
    }),
    ip
      ? payload.count({
          collection: 'otp-challenges',
          overrideAccess: true,
          where: {
            and: [{ ip: { equals: ip } }, { createdAt: { greater_than: hourAgo } }],
          },
        })
      : Promise.resolve({ totalDocs: 0 }),
    payload.find({
      collection: 'otp-challenges',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      sort: '-createdAt',
      where: {
        phone: { equals: phone },
      },
    }),
  ])

  if (phoneSends.totalDocs >= OTP_MAX_SENDS_PER_PHONE_PER_HOUR) return false
  if (ip && ipSends.totalDocs >= OTP_MAX_SENDS_PER_IP_PER_HOUR) return false

  const lastSentAt = latest.docs[0]?.createdAt
  if (lastSentAt && Date.now() - new Date(lastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS) {
    return false
  }

  return true
}
