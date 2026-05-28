import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EntryPage } from './EntryPage'

vi.mock('@tanstack/react-query')
vi.mock('@/features/wiki/wikiApi')
vi.mock('@/features/wiki/useRole')
vi.mock('@/features/wiki/components/Breadcrumb', () => ({
  Breadcrumb: () => <nav>Breadcrumb</nav>,
}))
vi.mock('@/features/wiki/components/MarkdownPreview', () => ({
  MarkdownPreview: ({ content }: { content: string }) => <div>{content}</div>,
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
  title: 'Test Entry',
  content: 'Some content.',
  authorId: 42,
  parentId: 5,
  updatedAt: '2026-01-01T00:00:00Z',
}

function setupDefaultQueries() {
  mockUseQuery.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
    if (queryKey[0] === 'entry') {
      return { data: mockEntry, isLoading: false, isError: false } as ReturnType<typeof useQuery>
    }
    return { data: [], isLoading: false, isError: false } as ReturnType<typeof useQuery>
  })
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/entries/1']}>
      <Routes>
        <Route path="/entries/:id" element={<EntryPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EntryPage — delete flow', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockUseRole.mockReturnValue({
      isSysAdmin: () => false,
      isAdmin: () => true,
      canEdit: () => true,
      canDelete: () => true,
      canCreate: () => true,
    })
    setupDefaultQueries()
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMutation>)
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries: mockInvalidate } as ReturnType<typeof useQueryClient>)
  })

  it('shows confirmation panel when Löschen is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /löschen/i }))

    expect(screen.getByText(/unwiderruflich gelöscht/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /abbrechen/i })).toBeInTheDocument()
  })

  it('hides header action buttons when confirmation is shown', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /löschen/i }))

    expect(screen.queryByRole('link', { name: /bearbeiten/i })).not.toBeInTheDocument()
  })

  it('hides confirmation panel when Abbrechen is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /löschen/i }))
    await user.click(screen.getByRole('button', { name: /abbrechen/i }))

    expect(screen.queryByText(/unwiderruflich gelöscht/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /bearbeiten/i })).toBeInTheDocument()
  })

  it('calls delete mutation on confirmation', async () => {
    const user = userEvent.setup()
    const mutate = vi.fn()
    mockUseMutation.mockReturnValue({
      mutate,
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMutation>)

    renderPage()

    await user.click(screen.getByRole('button', { name: /löschen/i }))
    await user.click(screen.getByRole('button', { name: /endgültig löschen/i }))

    expect(mutate).toHaveBeenCalled()
  })

  it('shows error alert when delete fails', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
      error: new Error('delete failed'),
    } as ReturnType<typeof useMutation>)

    renderPage()
    expect(screen.getByText(/konnte nicht gelöscht werden/i)).toBeInTheDocument()
  })
})
