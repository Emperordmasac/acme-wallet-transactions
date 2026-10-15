import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Transaction } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { getTransactions } from '@/lib/api/endpoints'
import { RecentTransactions } from './RecentTransactions'

vi.mock('@/lib/api/endpoints', () => ({ getTransactions: vi.fn(), getTransaction: vi.fn() }))

describe('RecentTransactions', () => {
  it('shows an error with retry instead of "No transactions yet" when loading fails', async () => {
    vi.mocked(getTransactions)
      .mockRejectedValueOnce(new ApiError(500, 'INTERNAL_ERROR', 'boom'))
      .mockResolvedValueOnce({ data: [] as Transaction[] })
    render(<RecentTransactions />)

    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load your transactions')
    expect(screen.queryByText('No transactions yet.')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('No transactions yet.')).toBeInTheDocument()
  })
})
