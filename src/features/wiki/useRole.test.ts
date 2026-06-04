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

function makeRecord(createdById = 99) {
  return {
    id: 1,
    title: 'Test',
    content: '',
    parentDirectoryId: 10,
    createdAt: '',
    createdBy: { id: createdById, firstName: 'Creator', lastName: 'User' },
    updatedAt: '',
    updatedBy: { id: createdById, firstName: 'Creator', lastName: 'User' },
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

  describe('canEditRecord', () => {
    it('returns true for EDITOR', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('EDITOR') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canEditRecord()).toBe(true)
    })

    it('returns true for ADMIN', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('ADMIN') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canEditRecord()).toBe(true)
    })

    it('returns false for GUEST', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('GUEST') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canEditRecord()).toBe(false)
    })

    it('returns false when user is null', () => {
      mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canEditRecord()).toBe(false)
    })
  })

  describe('canDeleteRecord', () => {
    it('returns true for ADMIN on any record', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('ADMIN', 1) } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canDeleteRecord(makeRecord(99))).toBe(true)
    })

    it('returns true for EDITOR on own record', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('EDITOR', 5) } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canDeleteRecord(makeRecord(5))).toBe(true)
    })

    it('returns false for EDITOR on others record', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('EDITOR', 5) } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canDeleteRecord(makeRecord(99))).toBe(false)
    })

    it('returns false for GUEST', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('GUEST', 1) } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canDeleteRecord(makeRecord(1))).toBe(false)
    })
  })

  describe('canCreateRecord', () => {
    it('returns true for EDITOR', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('EDITOR') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canCreateRecord()).toBe(true)
    })

    it('returns true for ADMIN', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('ADMIN') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canCreateRecord()).toBe(true)
    })

    it('returns false for GUEST', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('GUEST') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canCreateRecord()).toBe(false)
    })

    it('returns false when user is null', () => {
      mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canCreateRecord()).toBe(false)
    })
  })

  describe('canManageDirectory', () => {
    it('returns true for ADMIN', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('ADMIN') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canManageDirectory()).toBe(true)
    })

    it('returns true for SYS_ADMIN', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('SYS_ADMIN') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canManageDirectory()).toBe(true)
    })

    it('returns false for EDITOR', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('EDITOR') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canManageDirectory()).toBe(false)
    })

    it('returns false for GUEST', () => {
      mockUseAuth.mockReturnValue({ user: makeUser('GUEST') } as ReturnType<typeof useAuth>)
      const { result } = renderHook(() => useRole())
      expect(result.current.canManageDirectory()).toBe(false)
    })
  })
})
