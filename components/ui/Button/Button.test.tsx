import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('is a keyboard-activatable button that disabled blocks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Retry</Button>)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Retry' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Button onClick={onClick} disabled>
        Retry
      </Button>
    )
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
