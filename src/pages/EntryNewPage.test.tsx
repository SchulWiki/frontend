import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EntryNewPage } from './EntryNewPage'

vi.mock('@tanstack/react-query')
vi.mock('@/features/wiki/wikiApi')
vi.mock('@/features/wiki/useRole')
vi.mock('@/features/wiki/components/MarkdownEditor', () => ({
  MarkdownEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="content" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRole } from '@/features/wiki/useRole'

const mockUseMutation = vi.mocked(useMutation)
const mockUseRole = vi.mocked(useRole)

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}))

const mockInvalidate = vi.fn()

function renderPage(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/entries/new${search}`]}>
      <Routes>
        <Route path="/entries/new" element={<EntryNewPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EntryNewPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockUseRole.mockReturnValue({
      isSysAdmin: () => false,
      isAdmin: () => true,
      canEdit: () => true,
      canDelete: () => true,
      canCreate: () => true,
    })
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMutation>)
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries: mockInvalidate } as ReturnType<typeof useQueryClient>)
  })

  it('renders title input and content editor', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/titel des eintrags/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument()
  })

  it('shows Zod error when title is too short', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText(/titel des eintrags/i), 'AB')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    expect(await screen.findByText(/mindestens 3 zeichen/i)).toBeInTheDocument()
  })

  it('shows Zod error when content is too short', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText(/titel des eintrags/i), 'Valid Title')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    expect(await screen.findByText(/mindestens 10 zeichen/i)).toBeInTheDocument()
  })

  it('redirects GUEST to home', () => {
    mockUseRole.mockReturnValue({
      isSysAdmin: () => false,
      isAdmin: () => false,
      canEdit: () => false,
      canDelete: () => false,
      canCreate: () => false,
    })
    renderPage()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('calls mutate with correct payload on valid submit', async () => {
    const user = userEvent.setup()
    const mutate = vi.fn()
    mockUseMutation.mockReturnValue({
      mutate,
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMutation>)

    renderPage('?parentId=5')

    await user.type(screen.getByPlaceholderText(/titel des eintrags/i), 'Valid Title')
    await user.type(screen.getByLabelText(/content/i), 'Valid content here')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { title: 'Valid Title', content: 'Valid content here' },
        expect.any(Object)
      )
    })
  })

  it('shows API error when mutation fails', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
      error: new Error('Server error'),
    } as ReturnType<typeof useMutation>)

    renderPage()
    expect(screen.getByText(/konnte nicht erstellt werden/i)).toBeInTheDocument()
  })

  it('disables submit button while pending', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useMutation>)

    renderPage()
    expect(screen.getByRole('button', { name: /speichern/i })).toBeDisabled()
  })
})
