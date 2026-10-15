import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Transaction } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { getTransaction, getTransactions } from '@/lib/api/endpoints'
import { TransactionsView } from './TransactionsView'

const router = { push: vi.fn(), replace: vi.fn(), back: vi.fn() }
let search = ''
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/transactions',
  useSearchParams: () => new URLSearchParams(search),
}))
vi.mock('@/lib/api/endpoints', () => ({ getTransactions: vi.fn(), getTransaction: vi.fn() }))

const meta = (total: number) => ({
  page: 1,
  limit: 20,
  total,
  totalPages: Math.max(1, Math.ceil(total / 20)),
})
const tx: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'deposit',
  status: 'successful',
  currency: 'NGN',
  amount: 100,
  fee: 0,
  narration: 'Top-up',
  counterparty: null,
  createdAt: '2026-10-05T10:00:00.000Z',
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})

beforeEach(() => {
  search = ''
  vi.clearAllMocks()
})

describe('TransactionsView', () => {
  it('shows an error with a working retry', async () => {
    vi.mocked(getTransactions)
      .mockRejectedValueOnce(new ApiError(500, 'INTERNAL_ERROR', 'boom'))
      .mockResolvedValueOnce({ data: [tx], meta: meta(1) })
    render(<TransactionsView />)

    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load your transactions')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Top-up')).toBeInTheDocument()
    expect(screen.getByText('1 transactions')).toBeInTheDocument()
  })

  it('tells filtered "no results" apart from no transactions at all', async () => {
    search = 'q=zzz'
    vi.mocked(getTransactions).mockResolvedValue({ data: [], meta: meta(0) })
    const { unmount } = render(<TransactionsView />)

    expect(await screen.findByText('No transactions match your filters')).toBeInTheDocument()
    expect(screen.getByText('0 results')).toBeInTheDocument()
    const [, emptyStateClear] = screen.getAllByRole('button', { name: 'Clear filters' })
    await userEvent.click(emptyStateClear)
    expect(router.push).toHaveBeenCalledWith('/transactions', { scroll: false })
    unmount()

    search = ''
    render(<TransactionsView />)
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
  })

  it('sends a page past the end back to the last page', async () => {
    search = 'page=99'
    vi.mocked(getTransactions).mockResolvedValue({ data: [], meta: meta(237) })
    render(<TransactionsView />)

    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith('/transactions?page=12'))
  })

  it('shows loading, not "No transactions yet", while clearing a search that had no results', async () => {
    search = 'q=zzz'
    vi.mocked(getTransactions).mockResolvedValueOnce({ data: [], meta: meta(0) })
    const { rerender } = render(<TransactionsView />)
    expect(await screen.findByText('No transactions match your filters')).toBeInTheDocument()

    let resolve: (value: Awaited<ReturnType<typeof getTransactions>>) => void = () => {}
    vi.mocked(getTransactions).mockReturnValueOnce(new Promise((r) => (resolve = r)))
    search = ''
    rerender(<TransactionsView />)

    expect(screen.getByRole('status', { name: 'Loading transactions' })).toBeInTheDocument()
    expect(screen.queryByText('No transactions yet')).not.toBeInTheDocument()
    expect(screen.queryByText('No transactions match your filters')).not.toBeInTheDocument()

    resolve({ data: [tx], meta: meta(1) })
    expect(await screen.findByText('Top-up')).toBeInTheDocument()
    expect(screen.getByText('1 transactions')).toBeInTheDocument()
  })

  it('opens details from a row with a history entry, and closes a deep link without leaving the site', async () => {
    vi.mocked(getTransactions).mockResolvedValue({ data: [tx], meta: meta(1) })
    const { unmount } = render(<TransactionsView />)
    await userEvent.click(await screen.findByText('Top-up'))
    expect(router.push).toHaveBeenCalledWith('/transactions?tx=txn_1', { scroll: false })
    unmount()

    search = 'tx=txn_missing'
    vi.mocked(getTransaction).mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'Not found'))
    render(<TransactionsView />)
    await userEvent.click(await screen.findByRole('button', { name: 'Back to transactions' }))
    expect(router.replace).toHaveBeenCalledWith('/transactions', { scroll: false })
    expect(router.back).not.toHaveBeenCalled()
  })
})
