import type { ApiErrorBody, ApiSuccess } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'
const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
  const headers = new Headers(init.headers)
  if (init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch (err) {
    if (init.signal?.aborted) throw err
    throw new ApiError(0, 'NETWORK_ERROR', "Couldn't reach the server. Check your connection and try again.")
  }

  const body = await res.json().catch(() => undefined)
  // An abort while reading the body is swallowed by the .catch above; rethrow it rather than report INVALID_RESPONSE.
  init.signal?.throwIfAborted()

  if (!res.ok) {
    const error = (body as Partial<ApiErrorBody> | undefined)?.error
    throw new ApiError(res.status, error?.code ?? 'UNKNOWN', error?.message ?? FALLBACK_MESSAGE)
  }
  if (body === undefined) throw new ApiError(res.status, 'INVALID_RESPONSE', FALLBACK_MESSAGE)
  return body
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
}
