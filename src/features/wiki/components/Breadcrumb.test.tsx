import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumb } from './Breadcrumb'

vi.mock('@tanstack/react-query')
vi.mock('../wikiApi')

import { useQuery } from '@tanstack/react-query'

const mockUseQuery = vi.mocked(useQuery)

const rootEntry = {
  id: 1,
  title: 'Root Eintrag',
  content: '',
  authorId: 1,
  parentId: null,
  updatedAt: '',
}

const nestedEntry = {
  id: 10,
  title: 'Tief verschachtelter Eintrag',
  content: '',
  authorId: 1,
  parentId: 5,
  updatedAt: '',
}

const parentEntry = {
  id: 5,
  title: 'Elterneintrag',
  content: '',
  authorId: 1,
  parentId: null,
  updatedAt: '',
}

function renderBreadcrumb(entry: typeof rootEntry) {
  return render(
    <MemoryRouter>
      <Breadcrumb entry={entry} />
    </MemoryRouter>
  )
}

describe('Breadcrumb', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows Startseite and current title for root entry (no ancestors)', () => {
    // disabled query returns undefined data — defaults to []
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderBreadcrumb(rootEntry)

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByText('Startseite')).toBeInTheDocument()
    expect(screen.getByText('Root Eintrag')).toBeInTheDocument()
  })

  it('Startseite link navigates to /', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderBreadcrumb(rootEntry)

    const startseiteLink = screen.getByRole('link', { name: /startseite/i })
    expect(startseiteLink).toHaveAttribute('href', '/')
  })

  it('current entry title is not a link', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderBreadcrumb(rootEntry)

    const titleEl = screen.getByText('Root Eintrag')
    expect(titleEl.tagName).not.toBe('A')
  })

  it('shows ancestor as clickable link for nested entry', () => {
    mockUseQuery.mockReturnValue({
      data: [parentEntry],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderBreadcrumb(nestedEntry)

    const parentLink = screen.getByRole('link', { name: 'Elterneintrag' })
    expect(parentLink).toBeInTheDocument()
    expect(parentLink).toHaveAttribute('href', '/entries/5')
  })

  it('shows correct order: Startseite › Parent › Current', () => {
    mockUseQuery.mockReturnValue({
      data: [parentEntry],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderBreadcrumb(nestedEntry)

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Startseite')
    expect(items[1]).toHaveTextContent('Elterneintrag')
    expect(items[2]).toHaveTextContent('Tief verschachtelter Eintrag')
  })

  it('shows loading skeleton while fetching ancestors', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderBreadcrumb(nestedEntry)

    const skeleton = document.querySelector('[aria-label="Breadcrumb"].animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('current entry is not a link even when ancestors present', () => {
    mockUseQuery.mockReturnValue({
      data: [parentEntry],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderBreadcrumb(nestedEntry)

    const currentTitle = screen.getByText('Tief verschachtelter Eintrag')
    expect(currentTitle.tagName).not.toBe('A')
  })
})
