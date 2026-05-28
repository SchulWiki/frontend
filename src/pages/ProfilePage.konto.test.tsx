import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ProfilePage } from './ProfilePage'

vi.mock('@/features/auth/useAuth')
vi.mock('@/features/auth/authApi')

import { useAuth } from '@/features/auth/useAuth'
import { authApi } from '@/features/auth/authApi'

const mockUseAuth = vi.mocked(useAuth)
const mockRefreshUser = vi.fn()

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Anna',
  lastName: 'Müller',
  role: 'EDITOR',
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  )
}

describe('ProfilePage — Konto section', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
    })
  })

  it('pre-populates username and email', () => {
    renderPage()
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
  })

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderPage()

    const emailInput = screen.getByDisplayValue('test@example.com')
    await user.clear(emailInput)
    await user.type(emailInput, 'not-an-email')

    const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
    await user.click(saveButtons[1])

    expect(await screen.findByText(/ungültige e-mail/i)).toBeInTheDocument()
  })

  it('calls updateIdentity on valid submit and shows success', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.updateIdentity).mockResolvedValue({ ...mockUser, username: 'newuser' })
    renderPage()

    const usernameInput = screen.getByDisplayValue('testuser')
    await user.clear(usernameInput)
    await user.type(usernameInput, 'newuser')

    const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
    await user.click(saveButtons[1])

    await waitFor(() => {
      expect(authApi.updateIdentity).toHaveBeenCalledWith(1, {
        username: 'newuser',
        email: 'test@example.com',
      })
    })
    expect(await screen.findAllByText(/gespeichert/i)).not.toHaveLength(0)
  })

  it('shows API error when updateIdentity fails', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.updateIdentity).mockRejectedValue(new Error('fail'))
    renderPage()

    const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
    await user.click(saveButtons[1])

    expect(await screen.findByText(/konto konnte nicht gespeichert/i)).toBeInTheDocument()
  })
})

describe('ProfilePage — Passwort section', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
    })
  })

  function getPasswordFields() {
    const inputs = screen.getAllByRole('textbox', { hidden: true })
    const passwordInputs = document.querySelectorAll('input[type="password"]')
    return {
      current: passwordInputs[0] as HTMLInputElement,
      newPw: passwordInputs[1] as HTMLInputElement,
      confirm: passwordInputs[2] as HTMLInputElement,
    }
  }

  it('shows error when newPassword is too short', async () => {
    const user = userEvent.setup()
    renderPage()

    const { current, newPw, confirm } = getPasswordFields()
    await user.type(current, 'OldPass123!')
    await user.type(newPw, 'Short1!')
    await user.type(confirm, 'Short1!')

    const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
    await user.click(saveButtons[2])

    expect(await screen.findByText(/mindestens 12 zeichen/i)).toBeInTheDocument()
  })

  it('shows error when newPassword equals currentPassword', async () => {
    const user = userEvent.setup()
    renderPage()

    const { current, newPw, confirm } = getPasswordFields()
    await user.type(current, 'SamePass123!')
    await user.type(newPw, 'SamePass123!')
    await user.type(confirm, 'SamePass123!')

    const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
    await user.click(saveButtons[2])

    expect(await screen.findByText(/darf nicht mit dem aktuellen/i)).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderPage()

    const { current, newPw, confirm } = getPasswordFields()
    await user.type(current, 'OldPass123!')
    await user.type(newPw, 'NewPass123!X')
    await user.type(confirm, 'DifferentPass123!')

    const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
    await user.click(saveButtons[2])

    expect(await screen.findByText(/stimmen nicht überein/i)).toBeInTheDocument()
  })

  it('calls updatePassword on valid submit and clears fields', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.updatePassword).mockResolvedValue(undefined)
    renderPage()

    const { current, newPw, confirm } = getPasswordFields()
    await user.type(current, 'OldPass123!')
    await user.type(newPw, 'NewPass456@XX')
    await user.type(confirm, 'NewPass456@XX')

    const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
    await user.click(saveButtons[2])

    await waitFor(() => {
      expect(authApi.updatePassword).toHaveBeenCalledWith(1, {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456@XX',
      })
    })
    expect(await screen.findByText(/erfolgreich geändert/i)).toBeInTheDocument()
  })

  it('shows 401 error message for wrong current password', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.updatePassword).mockRejectedValue({ response: { status: 401 } })
    renderPage()

    const { current, newPw, confirm } = getPasswordFields()
    await user.type(current, 'WrongPass123!')
    await user.type(newPw, 'NewPass456@XX')
    await user.type(confirm, 'NewPass456@XX')

    const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
    await user.click(saveButtons[2])

    expect(await screen.findByText(/aktuelles passwort ist falsch/i)).toBeInTheDocument()
  })
})
