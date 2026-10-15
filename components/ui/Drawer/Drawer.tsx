'use client'
import { type ReactNode, useEffect, useId, useRef } from 'react'
import { Icon } from '../Icon'
import styles from './Drawer.module.css'

export interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.panel}
      aria-labelledby={titleId}
      // Escape fires `cancel`; let React state drive the close so the two never drift.
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClose={onClose}
      // A click on the dialog element itself is a click on its ::backdrop.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </dialog>
  )
}
