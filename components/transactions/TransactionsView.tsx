'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { Button, Card, Pagination, StateMessage } from '@/components/ui'
import { cx } from '@/lib/cx'
import { formatTime, groupByDay } from '@/lib/format'
import { parseQuery, toSearch, type TransactionsQuery } from '@/lib/transactions/query'
import { TransactionFilters } from './TransactionFilters'
import { TransactionRow } from './TransactionRow'
import { useTransactions } from './useTransactions'
import styles from './TransactionsView.module.css'

const PAGE_SIZE = 20

export function TransactionsView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = parseQuery(searchParams)
  const { q, type, status, page } = query
  const { data, meta, dataQuery, error, isLoading, retry } = useTransactions({
    q,
    type,
    status,
    page,
    limit: PAGE_SIZE,
  })

  const hrefFor = (patch: Partial<TransactionsQuery>) => `${pathname}${toSearch(searchParams, patch)}`
  const update = (patch: Partial<TransactionsQuery>) => router.push(hrefFor(patch), { scroll: false })
  const search = useCallback(
    (text: string) => router.replace(`${pathname}${toSearch(searchParams, { q: text })}`, { scroll: false }),
    [router, pathname, searchParams]
  )
  const clearFilters = () => update({ q: '', type: undefined, status: undefined })

  const totalPages = meta?.totalPages ?? 1
  const outOfRange = !isLoading && page > totalPages
  useEffect(() => {
    if (outOfRange) router.replace(`${pathname}${toSearch(searchParams, { page: totalPages })}`)
  }, [outOfRange, router, pathname, searchParams, totalPages])

  // Describe the results on screen, which may still belong to the previous query.
  const isFiltered = Boolean(dataQuery?.q || dataQuery?.type || dataQuery?.status)
  const total = meta?.total
  const subtitle =
    total === undefined
      ? ''
      : isFiltered
        ? `${total} ${total === 1 ? 'result' : 'results'}`
        : `${total} transactions`

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle} aria-live="polite">
          {subtitle}
        </p>
      </header>

      <TransactionFilters query={query} onSearch={search} onChange={update} />

      {error ? (
        <Card>
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
          >
            Check your connection and try again.
          </StateMessage>
        </Card>
      ) : !data || (data.length === 0 && isLoading) ? (
        <ListSkeleton />
      ) : data.length === 0 ? (
        <Card>
          {isFiltered ? (
            <StateMessage
              icon="search"
              title="No transactions match your filters"
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            >
              Try a different search term or remove some filters.
            </StateMessage>
          ) : (
            <StateMessage icon="inbox" title="No transactions yet">
              When you add money, send a transfer or pay with your card, it will show up here.
            </StateMessage>
          )}
        </Card>
      ) : (
        <>
          <div className={cx(styles.list, isLoading && styles.stale)} aria-busy={isLoading}>
            <Card as="div" padding="none">
              {groupByDay(data).map((group) => (
                <section key={group.label} aria-label={group.label}>
                  <h2 className={styles.day}>{group.label}</h2>
                  {group.transactions.map((tx) => (
                    <TransactionRow key={tx.id} transaction={tx} meta={formatTime(tx.createdAt)} />
                  ))}
                </section>
              ))}
            </Card>
          </div>
          {meta && meta.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              total={meta.total}
              pageSize={PAGE_SIZE}
              hrefFor={(p) => hrefFor({ page: p })}
            />
          )}
        </>
      )}
    </div>
  )
}

export function ListSkeleton() {
  return (
    <div className={styles.list} role="status" aria-label="Loading transactions">
      <Card as="div" padding="none">
        <div className={styles.day}>
          <span className={styles.skeleton} style={{ width: 64, height: 10 }} />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={styles.skeletonRow}>
            <span className={styles.skeleton} style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <span className={styles.skeletonLines}>
              <span className={styles.skeleton} style={{ width: 120, height: 12 }} />
              <span className={styles.skeleton} style={{ width: '80%', maxWidth: 260, height: 10 }} />
            </span>
            <span className={styles.skeletonLines} data-align="end">
              <span className={styles.skeleton} style={{ width: 96, height: 12 }} />
              <span className={styles.skeleton} style={{ width: 40, height: 10 }} />
            </span>
          </div>
        ))}
      </Card>
    </div>
  )
}
