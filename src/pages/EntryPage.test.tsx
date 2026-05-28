import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EntryPage } from './EntryPage'

vi.mock('@tanstack/react-query')
vi.mock('@/features/wiki/wikiApi')
vi.mock('@/features/wiki/useRole')
vi.mock('@/features/wiki/components/MarkdownPreview', () => ({
  MarkdownPreview: ({ content }: { content: string }) => <div data-testid="markdown">{content}</div>,
}))
vi.mock('@/features/wiki/components/Breadcrumb', () => ({
  Breadcrumb: () => <nav aria-label="Breadcrumb">Breadcrumb</nav>,
}))

import { useQuery } from '@tanstack/react-query'
import { useRole } from '@/features/wiki/useRole'

const mockUseQuery = vi.mocked(useQuery)
const mockUseRole = vi.mocked(useRole)

const mockEntry = {
  id: 42,
  title: 'Mein Testeintrag',
  content: '## Hallo Welt\n\nDas ist Markdown.',
  authorId: 7,
  authorName: 'Max Mustermann',
  parentId: null,
  updatedAt: '2026-01-15T12:00:00Z',
  childCount: 0,
}

const mockChild = {
  id: 99,
  title: 'Kindelement',
  content: '',
  authorId: 7,
  parentId: 42,
  updatedAt: '2026-01-16T12:00:00Z',
  childCount: 0,
}

const adminRole = {
  isAdmin: () => true,
  isSysAdmin: () => false,
  canEdit: () => true,
  canDelete: () => true,
  canCreate: () => true,
}

const editorOwnRole = {
  isAdmin: () => false,
  isSysAdmin: () => false,
  canEdit: () => true,
  canDelete: () => true,
  canCreate: () => true,
}

const editorForeignRole = {
  isAdmin: () => false,
  isSysAdmin: () => false,
  canEdit: () => false,
  canDelete: () => false,
  canCreate: () => true,
}

const guestRole = {
  isAdmin: () => false,
  isSysAdmin: () => false,
  canEdit: () => false,
  canDelete: () => false,
  canCreate: () => false,
}

function renderPage(entryId = '42') {
  return render(
    <MemoryRouter initialEntries={[`/entries/${entryId}`]}>
      <Routes>
        <Route path="/entries/:id" element={<EntryPage />} />
      </Routes>
    </MemoryRouter>
  )
}

function setupQueries(
  entryData: typeof mockEntry | undefined,
  childrenData: typeof mockChild[] | undefined,
  {
    entryLoading = false,
    entryError = false,
    childrenLoading = false,
  } = {}
) {
  mockUseQuery
    .mockReturnValueOnce({
      data: entryData,
      isLoading: entryLoading,
      isError: entryError,
    } as ReturnType<typeof useQuery>)
    .mockReturnValueOnce({
      data: childrenData,
      isLoading: childrenLoading,
      isError: false,
    } as ReturnType<typeof useQuery>)
}

describe('EntryPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows skeleton while entry is loading', () => {
    mockUseRole.mockReturnValue(guestRole)
    setupQueries(undefined, undefined, { entryLoading: true })
    renderPage()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows error alert when entry fails to load', () => {
    mockUseRole.mockReturnValue(guestRole)
    setupQueries(undefined, undefined, { entryError: true })
    renderPage()
    expect(screen.getByText(/konnte nicht geladen werden/i)).toBeInTheDocument()
  })

  it('renders entry title and metadata', () => {
    mockUseRole.mockReturnValue(guestRole)
    setupQueries(mockEntry, [])
    renderPage()
    expect(screen.getByText('Mein Testeintrag')).toBeInTheDocument()
    expect(screen.getByText(/Max Mustermann/)).toBeInTheDocument()
  })

  it('renders markdown content', () => {
    mockUseRole.mockReturnValue(guestRole)
    setupQueries(mockEntry, [])
    renderPage()
    expect(screen.getByTestId('markdown')).toBeInTheDocument()
    expect(screen.getByTestId('markdown').textContent).toContain('Hallo Welt')
  })

  it('shows Edit and Delete buttons for ADMIN', () => {
    mockUseRole.mockReturnValue(adminRole)
    setupQueries(mockEntry, [])
    renderPage()
    expect(screen.getByText('Bearbeiten')).toBeInTheDocument()
    expect(screen.getByText('Löschen')).toBeInTheDocument()
  })

  it('shows Edit and Delete buttons for EDITOR on own entry', () => {
    mockUseRole.mockReturnValue(editorOwnRole)
    setupQueries(mockEntry, [])
    renderPage()
    expect(screen.getByText('Bearbeiten')).toBeInTheDocument()
    expect(screen.getByText('Löschen')).toBeInTheDocument()
  })

  it('hides Edit and Delete buttons for EDITOR on foreign entry', () => {
    mockUseRole.mockReturnValue(editorForeignRole)
    setupQueries(mockEntry, [])
    renderPage()
    expect(screen.queryByText('Bearbeiten')).not.toBeInTheDocument()
    expect(screen.queryByText('Löschen')).not.toBeInTheDocument()
  })

  it('shows Kindelement erstellen button for EDITOR', () => {
    mockUseRole.mockReturnValue(editorForeignRole) // canCreate = true
    setupQueries(mockEntry, [])
    renderPage()
    expect(screen.getByText('Kindelement erstellen')).toBeInTheDocument()
  })

  it('hides Kindelement erstellen button for GUEST', () => {
    mockUseRole.mockReturnValue(guestRole)
    setupQueries(mockEntry, [])
    renderPage()
    expect(screen.queryByText('Kindelement erstellen')).not.toBeInTheDocument()
  })

  it('shows children as entry cards', () => {
    mockUseRole.mockReturnValue(guestRole)
    setupQueries(mockEntry, [mockChild])
    renderPage()
    expect(screen.getByText('Kindelement')).toBeInTheDocument()
  })

  it('shows empty state when no children', () => {
    mockUseRole.mockReturnValue(guestRole)
    setupQueries(mockEntry, [])
    renderPage()
    expect(
      screen.getByText('Noch keine Einträge in diesem Bereich.')
    ).toBeInTheDocument()
  })

  it('shows children skeleton while loading', () => {
    mockUseRole.mockReturnValue(guestRole)
    setupQueries(mockEntry, undefined, { childrenLoading: true })
    renderPage()
    // content renders but children section shows skeleton
    expect(screen.getByText('Mein Testeintrag')).toBeInTheDocument()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
