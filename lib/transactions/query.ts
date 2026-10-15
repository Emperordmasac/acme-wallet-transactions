import type { TransactionStatus, TransactionType } from '@/types/api'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'

export interface TransactionsQuery {
  q: string
  type?: TransactionType
  status?: TransactionStatus
  page: number
  /** Id of the transaction open in the details drawer. */
  tx?: string
}

export const isType = (value: string | null): value is TransactionType =>
  value !== null && Object.hasOwn(TRANSACTION_TYPE_LABELS, value)

export const isStatus = (value: string | null): value is TransactionStatus =>
  value !== null && Object.hasOwn(TRANSACTION_STATUS_LABELS, value)

/** Read the page state from the URL, ignoring values the API wouldn't accept. */
export function parseQuery(params: URLSearchParams): TransactionsQuery {
  const page = Number(params.get('page'))
  const type = params.get('type')
  const status = params.get('status')
  return {
    q: params.get('q')?.trim() ?? '',
    type: isType(type) ? type : undefined,
    status: isStatus(status) ? status : undefined,
    page: Number.isInteger(page) && page > 1 ? page : 1,
    tx: params.get('tx') || undefined,
  }
}

const FILTER_KEYS = ['q', 'type', 'status'] as const

/**
 * Apply a change to the current URL params and return the new "?..." string.
 * Defaults are dropped, unrelated params (like __scenario) are kept, and any
 * filter change sends the user back to page 1.
 */
export function toSearch(current: URLSearchParams, patch: Partial<TransactionsQuery>): string {
  const params = new URLSearchParams(current)
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === '' || (key === 'page' && value === 1)) params.delete(key)
    else params.set(key, String(value))
  }
  if (FILTER_KEYS.some((key) => key in patch) && !('page' in patch)) params.delete('page')
  const search = params.toString()
  return search ? `?${search}` : ''
}
