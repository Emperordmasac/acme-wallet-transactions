import { act, renderHook, waitFor } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { getTransactions } from '@/lib/api/endpoints'
import { useTransactions } from './useTransactions'

vi.mock('@/lib/api/endpoints', () => ({ getTransactions: vi.fn() }))

const tx = (id: string) => ({ id }) as Transaction

describe('useTransactions', () => {
  it('keeps previous results while loading, aborts stale requests, and can retry', async () => {
    const mock = vi.mocked(getTransactions)
    mock.mockResolvedValueOnce({ data: [tx('a')] })
    const { result, rerender } = renderHook(({ page }) => useTransactions({ page }), {
      initialProps: { page: 1 },
    })
    await waitFor(() => expect(result.current.data).toEqual([tx('a')]))

    mock.mockReturnValueOnce(new Promise(() => {}))
    rerender({ page: 2 })
    expect(result.current).toMatchObject({ isLoading: true, data: [tx('a')], dataQuery: { page: 1 } })

    mock.mockRejectedValueOnce(new ApiError(500, 'INTERNAL_ERROR', 'boom'))
    rerender({ page: 3 })
    expect(mock.mock.calls[1][1]?.signal?.aborted).toBe(true)
    await waitFor(() => expect(result.current.error).toBeInstanceOf(ApiError))
    expect(result.current.isLoading).toBe(false)

    mock.mockResolvedValueOnce({ data: [tx('c')] })
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.data).toEqual([tx('c')]))
    expect(result.current.error).toBeUndefined()
  })
})
