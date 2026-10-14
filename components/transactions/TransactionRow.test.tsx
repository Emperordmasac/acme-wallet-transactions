import { render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { TransactionRow } from './TransactionRow'

const narration = 'Bill payment - Spectranet <img src="x" onerror="alert(1)">'

const tx: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'bill_payment',
  status: 'successful',
  currency: 'NGN',
  amount: 500000,
  fee: 0,
  narration,
  counterparty: null,
  createdAt: '2026-10-01T12:00:00.000Z',
}

describe('TransactionRow', () => {
  it('renders narration markup as literal text', () => {
    const { container } = render(<TransactionRow transaction={tx} />)

    expect(screen.getByText(narration)).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })
})
