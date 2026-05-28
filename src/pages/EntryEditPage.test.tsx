import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EntryEditPage } from './EntryEditPage'

vi.mock('@tanstack/react-query')
vi.mock('@/features/wiki/wikiApi')
vi.mock('@/features/wiki/useRole')
vi.mock('@/features/wiki/components/MarkdownEditor', () => ({
  MarkdownEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="content" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRole } from '@/features/wiki/useRole'

const mockUseQuery = vi.mocked(useQuery)
const mockUseMutation = vi.mocked(useMutation)
const mockUseRole = vi.mocked(useRole)

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}))

const mockInvalidate = vi.fn()

const mockEntry = {
  id: 1,
  title: 'Existing Title',
  content: 'Existing content here.',
  authorId: 42,
  parentId: null,
  updatedAt: '2026-01-01T00:00:00Z',
}

function renderPage(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/entries/${id}/edit`]}>
      <Routes>
        <Route path="/entries/:id/edit" element={<EntryEditPage />} />
        <Route path="/entries/:id" element={<div>ReadView</div>} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EntryEditPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockUseRole.mockReturnValue({
      isSysAdmin: () => false,
      isAdmin: () => true,
      canEdit: () => true,
      canDelete: () => true,
      canCreate: () => true,
    })
    mockUseQuery.mockReturnValue({
      data: mockEntry,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMutation>)
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries: mockInvalidate } as ReturnType<typeof useQueryClient>)
  })

  it('shows loading skeleton while fetching', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderPage()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('pre-populates form with existing entry data', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/titel/i)).toHaveValue('Existing Title')
    })
    expect(screen.getByLabelText(/content/i)).toHaveValue('Existing content here.')
  })

  it('redirects EDITOR on foreign entry to read view', async () => {
    mockUseRole.mockReturnValue({
      isSysAdmin: () => false,
      isAdmin: () => false,
      canEdit: () => false,
      canDelete: () => false,
      canCreate: () => true,
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('ReadView')).toBeInTheDocument()
    })
  })

  it('calls mutate with updated title and content on submit', async () => {
    const user = userEvent.setup()
    const mutate = vi.fn()
    mockUseMutation.mockReturnValue({
      mutate,
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMutation>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/titel/i)).toHaveValue('Existing Title')
    })

    const titleInput = screen.getByPlaceholderText(/titel/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { title: 'Updated Title', content: 'Existing content here.' },
        expect.any(Object)
      )
    })
  })

  it('shows API error alert when mutation fails', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
      error: new Error('Server error'),
    } as ReturnType<typeof useMutation>)

    renderPage()
    expect(screen.getByText(/konnte nicht gespeichert werden/i)).toBeInTheDocument()
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
