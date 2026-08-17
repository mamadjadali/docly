import type { Payload } from 'payload'

import {
  getMelipayamakCredentials,
  type MelipayamakCredentials,
} from '@/lib/settings/getMelipayamakCredentials'

const SUCCESS_REC_ID_MIN = 1000

type MelipayamakResponse = {
  RetStatus?: number
  StrRetStatus?: string
  Value?: number | string
}

function parseRecId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function isSuccessfulSend(raw: string): boolean {
  let recId: number | null = parseRecId(raw)

  try {
    const parsed = JSON.parse(raw) as MelipayamakResponse
    recId = parseRecId(parsed.Value) ?? recId
    if (parsed.RetStatus === 1 && recId !== null && recId >= SUCCESS_REC_ID_MIN) {
      return true
    }
    if (parsed.RetStatus === 1) return true
  } catch {
    // Non-JSON body; fall through to numeric recId check.
  }

  return recId !== null && recId >= SUCCESS_REC_ID_MIN
}

async function sendWithCredentials(
  credentials: MelipayamakCredentials,
  to: string,
  text: string,
): Promise<boolean> {
  const body = new URLSearchParams({
    username: credentials.username,
    password: credentials.password,
    from: credentials.from,
    to,
    text,
    isflash: 'false',
  })

  try {
    const response = await fetch('https://rest.payamak-panel.com/api/SendSMS/SendSMS', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    const raw = await response.text()
    const ok = isSuccessfulSend(raw)

    if (!ok) {
      console.error('Melipayamak SendSMS failed', { to, raw })
    }

    return ok
  } catch (error) {
    console.error('Melipayamak SendSMS failed')
    console.error(error)
    return false
  }
}

export async function sendSimpleSms(payload: Payload, to: string, text: string): Promise<boolean> {
  const credentials = await getMelipayamakCredentials(payload)

  if (!credentials) {
    console.error('Melipayamak credentials are not configured')
    return false
  }

  return sendWithCredentials(credentials, to, text)
}

export async function sendSimpleSmsToMany(
  payload: Payload,
  recipients: string[],
  text: string,
): Promise<void> {
  if (recipients.length === 0) return

  const credentials = await getMelipayamakCredentials(payload)

  if (!credentials) {
    console.error('Melipayamak credentials are not configured')
    return
  }

  await Promise.all(recipients.map((to) => sendWithCredentials(credentials, to, text)))
}
