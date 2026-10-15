import Link from 'next/link'
import { cx } from '@/lib/cx'
import { Icon } from '../Icon'
import styles from './Pagination.module.css'

/** Page numbers to show, with "…" for gaps: 1 2 3 … 12, 1 … 5 6 7 … 12. */
export function pageItems(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const start = Math.max(2, Math.min(current - 1, total - 2))
  const end = Math.min(total - 1, Math.max(current + 1, 3))
  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i)
  return [
    1,
    ...(start > 2 ? ['…' as const] : []),
    ...middle,
    ...(end < total - 1 ? ['…' as const] : []),
    total,
  ]
}

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  hrefFor: (page: number) => string
}

export function Pagination({ page, totalPages, total, pageSize, hrefFor }: PaginationProps) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  const step = (target: number, label: string, short: string, icon: 'chevron-left' | 'chevron-right') => {
    const content = (
      <>
        {icon === 'chevron-left' && <Icon name={icon} size={16} />}
        <span className={styles.desktopOnly}>{label}</span>
        <span className={styles.mobileOnly}>{short}</span>
        {icon === 'chevron-right' && <Icon name={icon} size={16} />}
      </>
    )
    return target < 1 || target > totalPages ? (
      <span className={cx(styles.pageStep, styles.disabled)} aria-disabled="true">
        {content}
      </span>
    ) : (
      <Link className={styles.pageStep} href={hrefFor(target)} aria-label={`${label} page`}>
        {content}
      </Link>
    )
  }

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.desktopOnly}>
        Showing {first}–{last} of {total}
      </p>
      {step(page - 1, 'Previous', 'Prev', 'chevron-left')}
      <p className={cx(styles.pageOf, styles.mobileOnly)}>
        Page {page} of {totalPages}
      </p>
      <ol className={cx(styles.pages, styles.desktopOnly)}>
        {pageItems(page, totalPages).map((item, i) => (
          <li key={i}>
            {item === '…' ? (
              <span className={styles.gap}>…</span>
            ) : (
              <Link
                className={cx(styles.pageNumber, item === page && styles.currentPage)}
                href={hrefFor(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </Link>
            )}
          </li>
        ))}
      </ol>
      {step(page + 1, 'Next', 'Next', 'chevron-right')}
    </nav>
  )
}
