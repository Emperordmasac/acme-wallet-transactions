import type { Transaction } from '@/types/api'
import { formatDate } from './date'

export interface DayGroup {
  label: string
  transactions: Transaction[]
}

const dayKey = (date: Date) => date.toDateString()

/** Group transactions (newest first) by local calendar day: "Today", "Yesterday", then dates. */
export function groupByDay(transactions: Transaction[], now = new Date()): DayGroup[] {
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const labels = { [dayKey(now)]: 'Today', [dayKey(yesterday)]: 'Yesterday' }

  const groups: DayGroup[] = []
  for (const tx of transactions) {
    const created = new Date(tx.createdAt)
    const label = labels[dayKey(created)] ?? formatDate(tx.createdAt)
    const last = groups.at(-1)
    if (last?.label === label) last.transactions.push(tx)
    else groups.push({ label, transactions: [tx] })
  }
  return groups
}
