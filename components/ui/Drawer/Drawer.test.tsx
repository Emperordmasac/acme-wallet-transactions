import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Drawer } from './Drawer'

// jsdom has no showModal/close, so stub what the browser does.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Drawer open={open} title="Details" onClose={() => setOpen(false)}>
        <p>Body</p>
      </Drawer>
    </>
  )
}

describe('Drawer', () => {
  it('stays open on inside clicks and closes via Escape or the close button', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const open = () => user.click(screen.getByRole('button', { name: 'Open' }))

    await open()
    const dialog = screen.getByRole('dialog', { name: 'Details' })
    await user.click(screen.getByText('Body'))
    expect(dialog).toHaveAttribute('open')

    // Escape fires a cancelable `cancel` on the dialog.
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    expect(dialog).not.toHaveAttribute('open')

    await open()
    expect(dialog).toHaveAttribute('open')
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(dialog).not.toHaveAttribute('open')
  })
})
