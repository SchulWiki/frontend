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

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Anna',
  lastName: 'Müller',
  role: 'EDITOR',
  deleted: false,
}

const mockRefreshUser = vi.fn()

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  )
}

describe('ProfilePage', () => {
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

  describe('Avatar & Role', () => {
    it('shows initials from firstName and lastName', () => {
      renderPage()
      expect(screen.getByText('AM')).toBeInTheDocument()
    })

    it('shows German role label', () => {
      renderPage()
      expect(screen.getByText('Redakteur')).toBeInTheDocument()
    })

    it('shows System-Admin label for SYS_ADMIN', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: { ...mockUser, role: 'SYS_ADMIN' },
        refreshUser: mockRefreshUser,
      })
      renderPage()
      expect(screen.getByText('System-Admin')).toBeInTheDocument()
    })
  })

  describe('Name section', () => {
    it('pre-populates firstName and lastName fields', () => {
      renderPage()
      expect(screen.getByDisplayValue('Anna')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Müller')).toBeInTheDocument()
    })

    it('shows validation error for empty firstName', async () => {
      const user = userEvent.setup()
      renderPage()

      const firstNameInput = screen.getByDisplayValue('Anna')
      await user.clear(firstNameInput)
      const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
      await user.click(saveButtons[0])

      expect(await screen.findByText(/feld ist erforderlich/i)).toBeInTheDocument()
    })

    it('calls updateProfile on valid submit and shows success', async () => {
      const user = userEvent.setup()
      vi.mocked(authApi.updateProfile).mockResolvedValue({ ...mockUser, firstName: 'Lena' })
      renderPage()

      const firstNameInput = screen.getByDisplayValue('Anna')
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Lena')
      const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(authApi.updateProfile).toHaveBeenCalledWith(1, { firstName: 'Lena', lastName: 'Müller' })
      })
      expect(await screen.findByText(/gespeichert/i)).toBeInTheDocument()
      expect(mockRefreshUser).toHaveBeenCalled()
    })

    it('shows error alert when updateProfile fails', async () => {
      const user = userEvent.setup()
      vi.mocked(authApi.updateProfile).mockRejectedValue(new Error('fail'))
      renderPage()

      const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
      await user.click(saveButtons[0])

      expect(await screen.findByText(/konnte nicht gespeichert werden/i)).toBeInTheDocument()
    })
  })
})
