'use client'
import { useEffect, useState } from 'react'
import type { Currency, Rate } from '@/types/api'
import { Button, Card, CardHeader } from '@/components/ui'
import { getRate } from '@/lib/api/endpoints'
import { formatTime } from '@/lib/format'
import styles from './RatesWidget.module.css'

const QUOTES: Currency[] = ['USD', 'GHS']

export function RatesWidget({ base }: { base: Currency }) {
  const [rates, setRates] = useState<Rate[]>()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all(QUOTES.map((quote) => getRate(quote, base, { signal: controller.signal })))
      .then((results) => setRates(results.map((res) => res.data)))
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [base, attempt])
  const updatedAt = rates?.[0]?.updatedAt

  const retry = () => {
    setFailed(false)
    setAttempt((n) => n + 1)
  }

  if (failed) {
    return (
      <Card>
        <CardHeader title="Today's rates" />
        <p role="alert" className={styles.error}>
          We couldn&apos;t load today&apos;s rates.
        </p>
        <Button variant="secondary" size="sm" iconLeft="refresh" onClick={retry}>
          Try again
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Today's rates" />
      <dl className={styles.list}>
        {QUOTES.map((quote, i) => {
          const rate = rates?.[i]
          return (
            <div key={quote} className={styles.row}>
              <dt>1 {quote}</dt>
              <dd className={styles.value}>{rate ? `${rate.rate} ${base}` : '—'}</dd>
            </div>
          )
        })}
      </dl>
      {updatedAt && <p className={styles.updated}>Updated {formatTime(updatedAt)}</p>}
    </Card>
  )
}
