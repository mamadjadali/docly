import type { PayloadHandler } from 'payload'
import { getFieldsToSign, jwtSign } from 'payload'
import { addSessionToUser, generatePayloadCookie } from 'payload/shared'

import { OTP_INVALID_CODE_MESSAGE, OTP_MAX_VERIFY_ATTEMPTS } from '../../lib/otp/constants'
import { otpHashesMatch } from '../../lib/otp/codes'
import { normalizePhone } from '../../lib/otp/phone'
import { readJsonBody } from './read-json'

export const verifyOtpHandler: PayloadHandler = async (req) => {
  const body = await readJsonBody(req)
  const phone = normalizePhone(typeof body.phone === 'string' ? body.phone : '')
  const code = typeof body.code === 'string' ? body.code.trim() : ''

  if (!phone || !/^\d{6}$/.test(code)) {
    return Response.json({ message: OTP_INVALID_CODE_MESSAGE, ok: false }, { status: 401 })
  }

  const nowIso = new Date().toISOString()
  const challengeResult = await req.payload.find({
    collection: 'otp-challenges',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    sort: '-createdAt',
    where: {
      and: [
        { phone: { equals: phone } },
        { consumedAt: { exists: false } },
        { expiresAt: { greater_than: nowIso } },
      ],
    },
  })

  const challenge = challengeResult.docs[0]
  if (!challenge) {
    return Response.json({ message: OTP_INVALID_CODE_MESSAGE, ok: false }, { status: 401 })
  }

  const attempts = (challenge.attempts ?? 0) + 1
  const shouldConsume = attempts >= OTP_MAX_VERIFY_ATTEMPTS
  const matches = otpHashesMatch(challenge.codeHash, phone, code, req.payload.secret)

  await req.payload.update({
    collection: 'otp-challenges',
    data: {
      attempts,
      ...(shouldConsume || matches ? { consumedAt: nowIso } : {}),
    },
    id: challenge.id,
    overrideAccess: true,
  })

  if (!matches) {
    return Response.json({ message: OTP_INVALID_CODE_MESSAGE, ok: false }, { status: 401 })
  }

  const viewerResult = await req.payload.find({
    collection: 'viewers',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ phone: { equals: phone } }, { active: { equals: true } }],
    },
  })

  const viewer = viewerResult.docs[0]
  if (!viewer) {
    return Response.json({ message: OTP_INVALID_CODE_MESSAGE, ok: false }, { status: 401 })
  }

  const collection = req.payload.collections.viewers
  const user = {
    ...viewer,
    collection: 'viewers' as const,
  }

  const session = await addSessionToUser({
    collectionConfig: collection.config,
    payload: req.payload,
    req,
    user,
  })

  const fieldsToSign = getFieldsToSign({
    collectionConfig: collection.config,
    email: viewer.phone,
    sid: session.sid,
    user,
  })

  const { token } = await jwtSign({
    fieldsToSign,
    secret: req.payload.secret,
    tokenExpiration: collection.config.auth.tokenExpiration,
  })

  const cookie = generatePayloadCookie({
    collectionAuthConfig: collection.config.auth,
    cookiePrefix: req.payload.config.cookiePrefix,
    token,
  })

  return Response.json(
    { ok: true },
    {
      headers: {
        'Set-Cookie': cookie,
      },
    },
  )
}
