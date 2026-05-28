import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRole } from './useRole'

vi.mock('@/features/auth/useAuth')

import { useAuth } from '@/features/auth/useAuth'

const mockUseAuth = vi.mocked(useAuth)

function makeUser(role: string, id = 1) {
  return {
    id,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role,
  }
}

function makeEntry(authorId = 99) {
  return {
    id: 1,
    title: 'Test',
    content: '',
    authorId,
    parentId: null,
    updatedAt: '',
  }
}

describe('useRole', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('isSysAdmin', () => {
    it('returns true for SYS_ADMIN', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('SYS_ADMIN') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.isSysAdmin()).toBe(true)
    })

    it('returns false for ADMIN', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('ADMIN') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.isSysAdmin()).toBe(false)
    })

    it('returns false for GUEST', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('GUEST') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.isSysAdmin()).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('returns true for SYS_ADMIN', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('SYS_ADMIN') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.isAdmin()).toBe(true)
    })

    it('returns true for ADMIN', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('ADMIN') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.isAdmin()).toBe(true)
    })

    it('returns false for EDITOR', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('EDITOR') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.isAdmin()).toBe(false)
    })

    it('returns false for GUEST', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('GUEST') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.isAdmin()).toBe(false)
    })
  })

  describe('canEdit', () => {
    it('returns true for ADMIN on any entry', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('ADMIN', 1) } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canEdit(makeEntry(99))).toBe(true)
    })

    it('returns true for SYS_ADMIN on any entry', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('SYS_ADMIN', 1) } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canEdit(makeEntry(99))).toBe(true)
    })

    it('returns true for EDITOR on own entry', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('EDITOR', 5) } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canEdit(makeEntry(5))).toBe(true)
    })

    it('returns false for EDITOR on others entry', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('EDITOR', 5) } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canEdit(makeEntry(99))).toBe(false)
    })

    it('returns false for GUEST', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('GUEST', 1) } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canEdit(makeEntry(1))).toBe(false)
    })

    it('returns false when user is null', () => {
      mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canEdit(makeEntry(1))).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('mirrors canEdit behavior', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('EDITOR', 5) } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canDelete(makeEntry(5))).toBe(true)
      expect(result.current.canDelete(makeEntry(99))).toBe(false)
    })
  })

  describe('canCreate', () => {
    it('returns true for EDITOR', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('EDITOR') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canCreate()).toBe(true)
    })

    it('returns true for ADMIN', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('ADMIN') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canCreate()).toBe(true)
    })

    it('returns true for SYS_ADMIN', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('SYS_ADMIN') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canCreate()).toBe(true)
    })

    it('returns false for GUEST', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('GUEST') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canCreate()).toBe(false)
    })

    it('returns false when user is null', () => {
      mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canCreate()).toBe(false)
    })
  })
})
