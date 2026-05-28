import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StartPage } from './StartPage'

vi.mock('@tanstack/react-query')
vi.mock('@/features/wiki/wikiApi')
vi.mock('@/features/wiki/useRole')

import { useQuery } from '@tanstack/react-query'
import { useRole } from '@/features/wiki/useRole'

const mockUseQuery = vi.mocked(useQuery)
const mockUseRole = vi.mocked(useRole)

function renderPage() {
  return render(
    <MemoryRouter>
      <StartPage />
    </MemoryRouter>
  )
}

const adminRole = {
  isAdmin: () => true,
  isSysAdmin: () => false,
  canEdit: () => true,
  canDelete: () => true,
}

const guestRole = {
  isAdmin: () => false,
  isSysAdmin: () => false,
  canEdit: () => false,
  canDelete: () => false,
}

const mockEntry = {
  id: 1,
  title: 'Test Eintrag',
  content: 'Inhalt',
  authorId: 1,
  parentId: null,
  updatedAt: '2026-01-01T00:00:00Z',
  childCount: 3,
}

describe('StartPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows skeleton while loading', () => {
    mockUseRole.mockReturnValue(guestRole)
    mockUseQuery.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    } as ReturnType<typeof useQuery>)

    renderPage()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows entry cards when entries are loaded', () => {
    mockUseRole.mockReturnValue(guestRole)
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [mockEntry],
    } as ReturnType<typeof useQuery>)

    renderPage()
    expect(screen.getByText('Test Eintrag')).toBeInTheDocument()
  })

  it('shows empty state without create button for GUEST', () => {
    mockUseRole.mockReturnValue(guestRole)
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    } as ReturnType<typeof useQuery>)

    renderPage()
    expect(screen.getByText('Noch keine Einträge vorhanden.')).toBeInTheDocument()
    expect(screen.queryByText('Ersten Eintrag erstellen')).not.toBeInTheDocument()
  })

  it('shows empty state with create button for ADMIN', () => {
    mockUseRole.mockReturnValue(adminRole)
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    } as ReturnType<typeof useQuery>)

    renderPage()
    expect(screen.getByText('Noch keine Einträge vorhanden.')).toBeInTheDocument()
    expect(screen.getByText('Ersten Eintrag erstellen')).toBeInTheDocument()
  })

  it('shows "Neuer Eintrag" button for ADMIN when entries exist', () => {
    mockUseRole.mockReturnValue(adminRole)
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [mockEntry],
    } as ReturnType<typeof useQuery>)

    renderPage()
    expect(screen.getByText('Neuer Eintrag')).toBeInTheDocument()
  })

  it('does not show "Neuer Eintrag" button for GUEST', () => {
    mockUseRole.mockReturnValue(guestRole)
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [mockEntry],
    } as ReturnType<typeof useQuery>)

    renderPage()
    expect(screen.queryByText('Neuer Eintrag')).not.toBeInTheDocument()
  })

  it('shows error alert on API failure', () => {
    mockUseRole.mockReturnValue(guestRole)
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    } as ReturnType<typeof useQuery>)

    renderPage()
    expect(
      screen.getByText(/konnten nicht geladen werden/i)
    ).toBeInTheDocument()
  })
})
