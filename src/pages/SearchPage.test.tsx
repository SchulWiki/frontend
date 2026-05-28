import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SearchPage } from './SearchPage'

vi.mock('@tanstack/react-query')
vi.mock('@/features/wiki/wikiApi')

import { useQuery } from '@tanstack/react-query'

const mockUseQuery = vi.mocked(useQuery)

const mockResult = {
  id: 1,
  title: 'Netzwerktechnik Grundlagen',
  content: '## Einleitung\n\nNetzwerke verbinden Computer miteinander.',
  authorId: 1,
  parentId: 5,
  updatedAt: '2026-01-01T00:00:00Z',
  ancestors: [{ id: 5, title: 'IT-Grundlagen' }],
}

const mockResultWithExcerpt = {
  ...mockResult,
  excerpt: 'Ein kurzer Textauszug aus dem Eintrag.',
}

function renderPage(search = '?q=netzwerk') {
  return render(
    <MemoryRouter initialEntries={[`/search${search}`]}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows prompt when no query is given', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderPage('')
    expect(screen.getByText(/gib einen suchbegriff/i)).toBeInTheDocument()
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

  it('shows empty state with query in message when no results', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderPage('?q=netzwerk')
    expect(
      screen.getByText('Keine Ergebnisse für „netzwerk" gefunden.')
    ).toBeInTheDocument()
  })

  it('shows result title and links to entry page', () => {
    mockUseQuery.mockReturnValue({
      data: [mockResult],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderPage()
    const link = screen.getByRole('link', { name: /netzwerktechnik grundlagen/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/entries/1')
  })

  it('shows backend-provided excerpt when available', () => {
    mockUseQuery.mockReturnValue({
      data: [mockResultWithExcerpt],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderPage()
    expect(screen.getByText('Ein kurzer Textauszug aus dem Eintrag.')).toBeInTheDocument()
  })

  it('strips markdown and truncates content as fallback excerpt', () => {
    mockUseQuery.mockReturnValue({
      data: [mockResult],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderPage()
    // Markdown stripped: "## Einleitung\n\nNetzwerke verbinden..." → "Einleitung Netzwerke verbinden..."
    expect(screen.getByText(/netzwerke verbinden computer miteinander/i)).toBeInTheDocument()
  })

  it('shows breadcrumb path from ancestors', () => {
    mockUseQuery.mockReturnValue({
      data: [mockResult],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderPage()
    expect(screen.getByText(/startseite.*it-grundlagen/i)).toBeInTheDocument()
  })

  it('shows error alert on API failure', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useQuery>)

    renderPage()
    expect(screen.getByText(/konnte nicht durchgeführt werden/i)).toBeInTheDocument()
  })

  it('shows query in header', () => {
    mockUseQuery.mockReturnValue({
      data: [mockResult],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>)

    renderPage('?q=netzwerk')
    expect(screen.getByText(/ergebnisse für „netzwerk"/i)).toBeInTheDocument()
  })
})
