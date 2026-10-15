import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ListSkeleton, TransactionsView } from '@/components/transactions'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <TransactionsView />
    </Suspense>
  )
}
