import type { Payload } from 'payload'

import { getMelipayamakCredentials } from '@/lib/settings/getMelipayamakCredentials'

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

export async function sendMelipayamakOtp(
  payload: Payload,
  to: string,
  code: string,
): Promise<boolean> {
  const credentials = await getMelipayamakCredentials(payload)

  if (!credentials) {
    console.error('Melipayamak credentials are not configured')
    return false
  }

  const body = new URLSearchParams({
    username: credentials.username,
    password: credentials.password,
    from: credentials.from,
    to,
    code,
  })

  try {
    const response = await fetch('https://rest.payamak-panel.com/api/SendSMS/SendOtp', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    const raw = await response.text()
    let recId: number | null = parseRecId(raw)

    try {
      const parsed = JSON.parse(raw) as MelipayamakResponse
      recId = parseRecId(parsed.Value) ?? recId
      if (parsed.RetStatus === 1 && recId !== null && recId >= SUCCESS_REC_ID_MIN) {
        return true
      }
    } catch {
      // Non-JSON body; fall through to numeric recId check.
    }

    return recId !== null && recId >= SUCCESS_REC_ID_MIN
  } catch (error) {
    console.error('Melipayamak SendOtp failed')
    console.error(error)
    return false
  }
}
