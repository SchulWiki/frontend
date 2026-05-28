import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from './Navbar'

vi.mock('@/features/auth/useAuth')
vi.mock('@/features/wiki/useRole')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}))

import { useAuth } from '@/features/auth/useAuth'
import { useRole } from '@/features/wiki/useRole'

const mockUseAuth = vi.mocked(useAuth)
const mockUseRole = vi.mocked(useRole)

const defaultUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'EDITOR',
}

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockUseAuth.mockReturnValue({
      user: defaultUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })
    mockUseRole.mockReturnValue({
      isSysAdmin: () => false,
      isAdmin: () => false,
      canEdit: () => false,
      canDelete: () => false,
      canCreate: () => true,
    })
  })

  it('navigates to /search?q=... when search form is submitted', async () => {
    const user = userEvent.setup()
    renderNavbar()

    const input = screen.getByPlaceholderText(/suche/i)
    await user.type(input, 'netzwerk')
    await user.keyboard('{Enter}')

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=netzwerk')
  })

  it('encodes special characters in search query', async () => {
    const user = userEvent.setup()
    renderNavbar()

    const input = screen.getByPlaceholderText(/suche/i)
    await user.type(input, 'hello world')
    await user.keyboard('{Enter}')

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=hello%20world')
  })

  it('does not navigate when search query is empty', async () => {
    const user = userEvent.setup()
    renderNavbar()

    const input = screen.getByPlaceholderText(/suche/i)
    await user.click(input)
    await user.keyboard('{Enter}')

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when search query is only whitespace', async () => {
    const user = userEvent.setup()
    renderNavbar()

    const input = screen.getByPlaceholderText(/suche/i)
    await user.type(input, '   ')
    await user.keyboard('{Enter}')

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows Benutzerverwaltung link for SYS_ADMIN', () => {
    mockUseRole.mockReturnValue({
      isSysAdmin: () => true,
      isAdmin: () => true,
      canEdit: () => true,
      canDelete: () => true,
      canCreate: () => true,
    })
    renderNavbar()
    expect(screen.getByText('Benutzerverwaltung')).toBeInTheDocument()
  })

  it('hides Benutzerverwaltung link for non-SYS_ADMIN', () => {
    renderNavbar()
    expect(screen.queryByText('Benutzerverwaltung')).not.toBeInTheDocument()
  })
})
