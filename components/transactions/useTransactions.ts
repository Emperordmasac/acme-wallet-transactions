'use client'
import { useEffect, useState } from 'react'
import type { PageMeta, Transaction } from '@/types/api'
import { getTransactions, type TransactionQuery } from '@/lib/api/endpoints'

interface Loaded {
  key: string
  query: TransactionQuery
  data: Transaction[]
  meta?: PageMeta
}

interface Failed {
  key: string
  error: unknown
}

/**
 * Fetch a page of transactions. A new query aborts the previous request, and the
 * last loaded results stay available while the next ones arrive.
 */
export function useTransactions(query: TransactionQuery) {
  const queryKey = JSON.stringify(query)
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<Loaded>()
  const [failed, setFailed] = useState<Failed>()
  const key = `${queryKey}#${attempt}`

  useEffect(() => {
    const controller = new AbortController()
    const request: TransactionQuery = JSON.parse(queryKey)
    getTransactions(request, { signal: controller.signal })
      .then((res) => setLoaded({ key, query: request, data: res.data, meta: res.meta }))
      .catch((error) => {
        if (!controller.signal.aborted) setFailed({ key, error })
      })
    return () => controller.abort()
  }, [queryKey, key])

  const error = failed?.key === key ? failed.error : undefined
  return {
    data: loaded?.data,
    meta: loaded?.meta,
    /** The query `data` belongs to, which lags behind the current one while loading. */
    dataQuery: loaded?.query,
    error,
    isLoading: loaded?.key !== key && !error,
    retry: () => setAttempt((n) => n + 1),
  }
}
