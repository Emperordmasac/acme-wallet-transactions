'use client'
import { useEffect, useState } from 'react'
import type { User } from '@/types/api'
import { Button, Card } from '@/components/ui'
import { BalanceSummary, RatesWidget, RecentTransactions, WalletCard } from '@/components/dashboard'
import { getMe } from '@/lib/api/endpoints'
import styles from './page.module.css'

export default function DashboardPage() {
  const [user, setUser] = useState<User>()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getMe({ signal: controller.signal })
      .then((res) => setUser(res.data))
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [attempt])

  const retry = () => {
    setFailed(false)
    setAttempt((n) => n + 1)
  }

  if (failed) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Dashboard</h1>
        <Card>
          <p role="alert" className={styles.error}>
            We couldn&apos;t load your dashboard. Please try again.
          </p>
          <Button variant="secondary" onClick={retry}>
            Try again
          </Button>
        </Card>
      </div>
    )
  }

  if (!user) return <p className={styles.loading}>Loading…</p>

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Welcome back, {user.firstName}</h1>
        <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your money today.</p>
      </header>

      <BalanceSummary wallets={user.wallets} />

      <div className={styles.wallets}>
        {user.wallets.map((wallet) => (
          <WalletCard key={wallet.currency} wallet={wallet} />
        ))}
      </div>

      <div className={styles.columns}>
        <RecentTransactions />
        <RatesWidget base="NGN" />
      </div>
    </div>
  )
}
