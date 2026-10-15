'use client'
import { useEffect, useState, useSyncExternalStore } from 'react'
import type { TransactionStatus, TransactionType } from '@/types/api'
import { Button, Input, Select } from '@/components/ui'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import type { TransactionsQuery } from '@/lib/transactions/query'
import styles from './TransactionsView.module.css'

const SEARCH_DEBOUNCE_MS = 300

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(TRANSACTION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

const MOBILE_QUERY = '(max-width: 640px)'

function subscribeToMobile(onChange: () => void) {
  const media = window.matchMedia(MOBILE_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const useIsMobile = () =>
  useSyncExternalStore(
    subscribeToMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )

interface TransactionFiltersProps {
  query: TransactionsQuery
  onSearch: (q: string) => void
  onChange: (patch: Partial<TransactionsQuery>) => void
}

export function TransactionFilters({ query, onSearch, onChange }: TransactionFiltersProps) {
  const [text, setText] = useState(query.q)
  const [syncedQ, setSyncedQ] = useState(query.q)

  // Follow q when it changes from outside (Back, Clear filters, a shared link),
  // without clobbering what the user is still typing.
  if (query.q !== syncedQ) {
    setSyncedQ(query.q)
    if (query.q !== text.trim()) setText(query.q)
  }

  useEffect(() => {
    if (text.trim() === query.q) return
    const timer = setTimeout(() => onSearch(text.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [text, query.q, onSearch])

  const isMobile = useIsMobile()
  const hasFilters = Boolean(query.q || query.type || query.status)

  return (
    <div className={styles.filters}>
      <Input
        label="Search"
        type="search"
        leadingIcon="search"
        placeholder={isMobile ? 'Search reference, name…' : 'Search by reference, name or narration'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        fieldClassName={styles.search}
      />
      <Select
        label="Type"
        options={TYPE_OPTIONS}
        value={query.type ?? ''}
        onChange={(e) => onChange({ type: (e.target.value || undefined) as TransactionType | undefined })}
        fieldClassName={styles.type}
      />
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={query.status ?? ''}
        onChange={(e) => onChange({ status: (e.target.value || undefined) as TransactionStatus | undefined })}
        fieldClassName={styles.status}
      />
      {hasFilters && (
        <Button
          variant="ghost"
          className={styles.clear}
          onClick={() => {
            setText('')
            onChange({ q: '', type: undefined, status: undefined })
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
