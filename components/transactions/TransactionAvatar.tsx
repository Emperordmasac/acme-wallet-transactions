import type { Transaction, TransactionType } from '@/types/api'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '@/components/ui'
import { initials } from '@/lib/format'
import styles from './TransactionAvatar.module.css'

const TYPE_ICONS: Record<TransactionType, IconName> = {
  deposit: 'arrow-down-left',
  transfer_in: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  transfer_out: 'arrow-up-right',
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
}

const PERSON_TYPES: TransactionType[] = ['transfer_in', 'transfer_out']

/** Transfers show the counterparty's initials; everything else shows a type icon. */
export function TransactionAvatar({
  transaction: tx,
  className,
}: {
  transaction: Transaction
  className?: string
}) {
  const name = PERSON_TYPES.includes(tx.type) ? tx.counterparty : null
  return (
    <span className={cx(styles.avatar, className)} aria-hidden>
      {name ? initials(name) : <Icon name={TYPE_ICONS[tx.type]} size={18} />}
    </span>
  )
}
