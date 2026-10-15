import { api } from './client'

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

describe('api client', () => {
  it('returns a successful response body unchanged', async () => {
    const body = { data: [{ id: 'txn_1' }], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }
    fetchMock.mockResolvedValue(json(body))

    await expect(api.get('/transactions')).resolves.toEqual(body)
  })

  it('throws ApiError with the code and message from an error body', async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: 'INSUFFICIENT_FUNDS', message: 'Not enough funds' } }, 422)
    )

    await expect(api.post('/convert', {})).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      code: 'INSUFFICIENT_FUNDS',
      message: 'Not enough funds',
    })
  })

  it('falls back when an error body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }))

    await expect(api.get('/me')).rejects.toMatchObject({ status: 502, code: 'UNKNOWN' })
  })

  it('turns a network failure into NETWORK_ERROR', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(api.get('/me')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })

  it('rethrows an abort without wrapping it', async () => {
    const controller = new AbortController()
    fetchMock.mockImplementation((_, init) => {
      expect(init?.signal).toBe(controller.signal)
      controller.abort()
      return Promise.reject(controller.signal.reason)
    })

    await expect(api.get('/transactions', { signal: controller.signal })).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})
