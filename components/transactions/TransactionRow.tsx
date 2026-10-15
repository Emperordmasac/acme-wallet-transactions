import type { ReactNode } from 'react'
import type { Transaction, TransactionType } from '@/types/api'
import { Money } from '@/components/ui'
import { TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { StatusBadge } from './StatusBadge'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionRow.module.css'

const CREDIT_TYPES: TransactionType[] = ['deposit', 'transfer_in', 'conversion']

export const isCredit = (tx: Transaction) => CREDIT_TYPES.includes(tx.type)

export interface TransactionRowProps {
  transaction: Transaction
  /** Shown under the amount on wide screens, e.g. the time. */
  meta?: ReactNode
  onSelect?: (transaction: Transaction) => void
}

export function TransactionRow({ transaction: tx, meta, onSelect }: TransactionRowProps) {
  const credit = isCredit(tx)

  return (
    <button type="button" className={styles.row} onClick={() => onSelect?.(tx)}>
      <TransactionAvatar transaction={tx} className={styles.avatar} />
      <span className={styles.main}>
        <span className={styles.title}>{TRANSACTION_TYPE_LABELS[tx.type]}</span>
        <span className={styles.narration}>{tx.narration}</span>
      </span>
      <StatusBadge status={tx.status} className={styles.status} />
      <span className={styles.end}>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={credit ? styles.credit : styles.amount}
        />
        {meta && <span className={styles.meta}>{meta}</span>}
      </span>
    </button>
  )
}
