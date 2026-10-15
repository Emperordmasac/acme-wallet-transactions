import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Rate, User } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { convert, getMe, getRate } from '@/lib/api/endpoints'
import ConvertPage from './page'

vi.mock('@/lib/api/endpoints', () => ({ convert: vi.fn(), getMe: vi.fn(), getRate: vi.fn() }))

const user = { firstName: 'Amara', wallets: [{ currency: 'USD', balance: 1000 }] } as User
const rate = (from: Rate['from'], to: Rate['to'], value: number): Rate => ({
  from,
  to,
  rate: value,
  updatedAt: '2026-10-08T12:00:00.000Z',
})

beforeEach(() => {
  vi.mocked(getMe).mockResolvedValue({ data: user })
  vi.mocked(getRate).mockImplementation(async (from, to) => ({ data: rate(from, to, 1530.25) }))
})

describe('ConvertPage', () => {
  it('shows the API error message when a conversion is rejected', async () => {
    vi.mocked(convert).mockRejectedValue(new ApiError(422, 'INSUFFICIENT_FUNDS', 'Insufficient funds'))
    render(<ConvertPage />)

    await screen.findByText('1 USD = 1530.25 NGN')
    await userEvent.type(screen.getByLabelText('Amount'), '50')
    await userEvent.click(screen.getByRole('button', { name: 'Convert' }))

    expect(await screen.findByText('Insufficient funds')).toBeInTheDocument()
  })

  it('ignores a slow rate response for a pair the user has moved away from', async () => {
    let resolveUsd: (value: { data: Rate }) => void = () => {}
    vi.mocked(getRate).mockImplementation((from, to) =>
      from === 'USD'
        ? new Promise((resolve) => (resolveUsd = resolve))
        : Promise.resolve({ data: rate(from, to, 98.4) })
    )
    render(<ConvertPage />)

    await userEvent.selectOptions(screen.getByLabelText('From'), 'GHS')
    expect(await screen.findByText('1 GHS = 98.4 NGN')).toBeInTheDocument()

    resolveUsd({ data: rate('USD', 'NGN', 1530.25) })
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.getByText('1 GHS = 98.4 NGN')).toBeInTheDocument()
    expect(vi.mocked(getRate).mock.calls[0][2]?.signal?.aborted).toBe(true)
  })

  it('shows when the balance or rate fail to load, and can retry the rate', async () => {
    vi.mocked(getMe).mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', 'boom'))
    vi.mocked(getRate)
      .mockRejectedValueOnce(new ApiError(500, 'INTERNAL_ERROR', 'boom'))
      .mockResolvedValue({ data: rate('USD', 'NGN', 1530.25) })
    render(<ConvertPage />)

    expect(await screen.findByText('Balance: unavailable')).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load the rate.")
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('1 USD = 1530.25 NGN')).toBeInTheDocument()
  })

  it('submits with Enter from the amount field', async () => {
    vi.mocked(convert).mockResolvedValue({
      data: {
        id: 'txn_c',
        from: 'USD',
        to: 'NGN',
        amount: 5000,
        fee: 75,
        rate: 1530.25,
        received: 7651250,
        status: 'successful',
      },
    })
    render(<ConvertPage />)
    await screen.findByText('1 USD = 1530.25 NGN')

    await userEvent.type(screen.getByLabelText('Amount'), '50{Enter}')

    expect(convert).toHaveBeenCalledWith({ from: 'USD', to: 'NGN', amount: 5000 })
    expect(await screen.findByText(/Conversion successful/)).toBeInTheDocument()
  })
})
