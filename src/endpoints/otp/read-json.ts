import type { PayloadRequest } from 'payload'

export async function readJsonBody(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    const data = (await req.json?.()) ?? req.data
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}
