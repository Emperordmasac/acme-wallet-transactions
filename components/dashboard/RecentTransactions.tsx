'use client'
import Link from 'next/link'
import { useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Card, CardHeader, Drawer, StateMessage } from '@/components/ui'
import { TransactionDetails, TransactionRow, useTransactions } from '@/components/transactions'
import { formatDateTime } from '@/lib/format'
import styles from './RecentTransactions.module.css'

const QUERY = { limit: 5 }

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const { data, error, retry } = useTransactions(QUERY)

  return (
    <Card padding="none">
      <div className={styles.header}>
        <CardHeader
          title="Recent transactions"
          action={
            <Link href="/transactions" className={styles.seeAll}>
              See all
            </Link>
          }
        />
      </div>
      {error ? (
        <StateMessage
          icon="alert"
          tone="danger"
          title="We couldn’t load your transactions"
          role="alert"
          action={
            <Button iconLeft="refresh" onClick={retry}>
              Try again
            </Button>
          }
        />
      ) : !data ? (
        <p className={styles.message}>Loading…</p>
      ) : data.length === 0 ? (
        <p className={styles.message}>No transactions yet.</p>
      ) : (
        data.map((tx) => (
          <TransactionRow
            key={tx.id}
            transaction={tx}
            meta={formatDateTime(tx.createdAt)}
            onSelect={setSelected}
          />
        ))
      )}

      <Drawer open={selected !== null} title="Transaction details" onClose={() => setSelected(null)}>
        {selected && (
          <TransactionDetails id={selected.id} initial={selected} onBack={() => setSelected(null)} />
        )}
      </Drawer>
    </Card>
  )
}
