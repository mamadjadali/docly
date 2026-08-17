import type { PayloadHandler } from 'payload'

import { OTP_GENERIC_REQUEST_MESSAGE, OTP_INVALID_PHONE_MESSAGE, OTP_TTL_MS } from '../../lib/otp/constants'
import { hashOtpHex, generateOtpCode } from '../../lib/otp/codes'
import { sendMelipayamakOtp } from '../../lib/otp/melipayamak'
import { normalizePhone } from '../../lib/otp/phone'
import { canSendOtp, getClientIp } from '../../lib/otp/rate-limit'
import { readJsonBody } from './read-json'

export const requestOtpHandler: PayloadHandler = async (req) => {
  const body = await readJsonBody(req)
  const phone = normalizePhone(typeof body.phone === 'string' ? body.phone : '')

  if (!phone) {
    return Response.json({ message: OTP_INVALID_PHONE_MESSAGE, ok: false }, { status: 400 })
  }

  const ip = getClientIp(req)
  const allowed = await canSendOtp({ ip, payload: req.payload, phone })

  const viewer = allowed
    ? (
        await req.payload.find({
          collection: 'viewers',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          where: {
            and: [{ phone: { equals: phone } }, { active: { equals: true } }],
          },
        })
      ).docs[0]
    : null

  if (!viewer) {
    return Response.json({ message: OTP_GENERIC_REQUEST_MESSAGE, ok: true })
  }

  const secret = req.payload.secret
  const code = generateOtpCode()
  const now = Date.now()

  await req.payload.update({
    collection: 'otp-challenges',
    data: {
      consumedAt: new Date(now).toISOString(),
    },
    overrideAccess: true,
    where: {
      and: [{ phone: { equals: phone } }, { consumedAt: { exists: false } }],
    },
  })

  const challenge = await req.payload.create({
    collection: 'otp-challenges',
    data: {
      attempts: 0,
      codeHash: hashOtpHex(phone, code, secret),
      expiresAt: new Date(now + OTP_TTL_MS).toISOString(),
      ip,
      phone,
    },
    overrideAccess: true,
  })

  const sent = await sendMelipayamakOtp(req.payload, phone, code)

  if (!sent) {
    await req.payload.update({
      collection: 'otp-challenges',
      data: {
        consumedAt: new Date().toISOString(),
      },
      id: challenge.id,
      overrideAccess: true,
    })
  }

  return Response.json({ message: OTP_GENERIC_REQUEST_MESSAGE, ok: true })
}
