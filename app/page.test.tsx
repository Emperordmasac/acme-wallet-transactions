import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { getMe } from '@/lib/api/endpoints'
import DashboardPage from './page'

vi.mock('@/lib/api/endpoints', () => ({
  getMe: vi.fn(),
  getTransactions: vi.fn(() => new Promise(() => {})),
  getRate: vi.fn(() => new Promise(() => {})),
}))

const user: User = {
  id: 'usr_1',
  firstName: 'Amara',
  lastName: 'Test',
  email: 'amara@example.com',
  avatarUrl: null,
  tier: 'verified',
  wallets: [{ currency: 'NGN', balance: 100 }],
}

describe('DashboardPage', () => {
  it('shows an error instead of crashing when the user fails to load, and can retry', async () => {
    vi.mocked(getMe)
      .mockRejectedValueOnce(new ApiError(500, 'INTERNAL', 'boom'))
      .mockResolvedValueOnce({ data: user })
    render(<DashboardPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load your dashboard")

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('heading', { name: 'Welcome back, Amara' })).toBeInTheDocument()
  })
})
