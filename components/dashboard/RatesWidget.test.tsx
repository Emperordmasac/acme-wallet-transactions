import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Rate } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { getRate } from '@/lib/api/endpoints'
import { RatesWidget } from './RatesWidget'

vi.mock('@/lib/api/endpoints', () => ({ getRate: vi.fn() }))

const rate = (from: Rate['from']): Rate => ({
  from,
  to: 'NGN',
  rate: 1530.25,
  updatedAt: '2026-10-08T12:00:00.000Z',
})

describe('RatesWidget', () => {
  it('shows an error with a working retry', async () => {
    vi.mocked(getRate)
      .mockRejectedValueOnce(new ApiError(500, 'INTERNAL_ERROR', 'boom'))
      .mockResolvedValueOnce({ data: rate('GHS') })
      .mockResolvedValue({ data: rate('USD') })
    render(<RatesWidget base="NGN" />)

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load today's rates.")
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findAllByText('1530.25 NGN')).toHaveLength(2)
  })
})
