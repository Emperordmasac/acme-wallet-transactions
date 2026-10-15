import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon'
import styles from './StateMessage.module.css'

interface StateMessageProps {
  icon: IconName
  title: string
  children?: ReactNode
  action?: ReactNode
  tone?: 'primary' | 'danger'
  role?: 'alert'
}

export function StateMessage({ icon, title, children, action, tone = 'primary', role }: StateMessageProps) {
  return (
    <div className={styles.state} role={role}>
      <span className={cx(styles.stateIcon, styles[tone])}>
        <Icon name={icon} size={20} />
      </span>
      <p className={styles.stateTitle}>{title}</p>
      {children && <p className={styles.stateBody}>{children}</p>}
      {action}
    </div>
  )
}
