'use client'
import { useEffect, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Icon, Money, StateMessage } from '@/components/ui'
import { ApiError } from '@/lib/api/client'
import { getTransaction } from '@/lib/api/endpoints'
import { cx } from '@/lib/cx'
import { formatDateTime, formatMoney, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { StatusBadge } from './StatusBadge'
import { TransactionAvatar } from './TransactionAvatar'
import { isCredit } from './TransactionRow'
import styles from './TransactionDetails.module.css'

interface TransactionDetailsProps {
  id: string
  /** The row the user clicked, if it's already loaded, so the drawer can render straight away. */
  initial?: Transaction
  onBack: () => void
}

export function TransactionDetails({ id, initial, onBack }: TransactionDetailsProps) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ key: string; tx?: Transaction; error?: unknown }>()
  const key = `${id}#${attempt}`
  const needsFetch = initial?.id !== id

  useEffect(() => {
    if (!needsFetch) return
    const controller = new AbortController()
    getTransaction(id, { signal: controller.signal })
      .then((res) => setResult({ key, tx: res.data }))
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ key, error })
      })
    return () => controller.abort()
  }, [id, key, needsFetch])

  const current = result?.key === key ? result : undefined
  const tx = needsFetch ? current?.tx : initial

  if (tx) return <Details tx={tx} />
  if (current?.error instanceof ApiError && current.error.code === 'NOT_FOUND') {
    return (
      <StateMessage
        icon="search"
        title="Transaction not found"
        action={
          <Button variant="secondary" onClick={onBack}>
            Back to transactions
          </Button>
        }
      >
        It may have been removed, or the link is wrong.
      </StateMessage>
    )
  }
  if (current?.error) {
    return (
      <StateMessage
        icon="alert"
        tone="danger"
        title="We couldn’t load this transaction"
        role="alert"
        action={
          <Button iconLeft="refresh" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </Button>
        }
      >
        Check your connection and try again.
      </StateMessage>
    )
  }
  return <DetailsSkeleton />
}

function Details({ tx }: { tx: Transaction }) {
  const credit = isCredit(tx)
  return (
    <div className={styles.details}>
      <div className={styles.hero}>
        <TransactionAvatar transaction={tx} className={styles.avatar} />
        <p className={styles.narration}>{tx.narration}</p>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={styles.heroAmount}
        />
        <StatusBadge status={tx.status} />
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Details</h3>
        <dl className={styles.list}>
          <div className={styles.row}>
            <dt>Reference</dt>
            <dd className={styles.reference}>
              <span className={styles.mono}>{tx.reference}</span>
              <CopyButton text={tx.reference} />
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Date</dt>
            <dd>{formatDateTime(tx.createdAt)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Type</dt>
            <dd>{TRANSACTION_TYPE_LABELS[tx.type]}</dd>
          </div>
          {tx.counterparty && (
            <div className={styles.row}>
              <dt>Counterparty</dt>
              <dd>{tx.counterparty}</dd>
            </div>
          )}
          <div className={styles.row}>
            <dt>Narration</dt>
            <dd>{tx.narration}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Summary</h3>
        <dl className={styles.list}>
          <div className={styles.row}>
            <dt>Amount</dt>
            <dd>{formatMoney(tx.amount, tx.currency)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Fee</dt>
            <dd>{formatMoney(tx.fee, tx.currency)}</dd>
          </div>
          {!credit && (
            <div className={cx(styles.row, styles.total)}>
              <dt>Total</dt>
              <dd>{formatMoney(tx.amount + tx.fee, tx.currency)}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className={styles.copy}
      aria-label={copied ? 'Reference copied' : 'Copy reference'}
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }
    >
      <Icon name="copy" size={16} />
    </button>
  )
}

function DetailsSkeleton() {
  return (
    <div className={styles.details} role="status" aria-label="Loading transaction">
      <div className={styles.hero}>
        <span className={styles.skeleton} style={{ width: 48, height: 48, borderRadius: '50%' }} />
        <span className={styles.skeleton} style={{ width: 160, height: 12 }} />
        <span className={styles.skeleton} style={{ width: 200, height: 24 }} />
        <span className={styles.skeleton} style={{ width: 84, height: 22, borderRadius: 999 }} />
      </div>
      <div className={styles.list}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.row}>
            <span className={styles.skeleton} style={{ width: 90, height: 12 }} />
            <span className={styles.skeleton} style={{ width: 140, height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
