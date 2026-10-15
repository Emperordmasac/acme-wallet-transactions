import { render, screen } from '@testing-library/react'
import { ApiError } from '@/lib/api/client'
import { getMe } from '@/lib/api/endpoints'
import { UserMenu } from './UserMenu'

vi.mock('@/lib/api/endpoints', () => ({ getMe: vi.fn() }))

describe('UserMenu', () => {
  it('still renders the trigger when the user fails to load', async () => {
    const failure = Promise.reject(new ApiError(500, 'INTERNAL_ERROR', 'boom'))
    vi.mocked(getMe).mockReturnValue(failure)
    render(<UserMenu />)

    await failure.catch(() => {})
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
