import { useAuth } from '@/features/auth/useAuth'
import type { WikiRecord } from './wiki.types'

const ROLE_WEIGHTS: Record<string, number> = {
  SYS_ADMIN: 4,
  ADMIN: 3,
  EDITOR: 2,
  GUEST: 1,
}

export function useRole() {
  const { user } = useAuth()
  const weight = user ? (ROLE_WEIGHTS[user.role] ?? 0) : 0

  return {
    // Records: any EDITOR+ can edit title/content; only ADMIN+ or creator can delete
    canEditRecord: () => weight >= 2,
    canDeleteRecord: (record: WikiRecord) =>
      weight >= 3 || (weight === 2 && record.createdBy.id === user?.id),
    canCreateRecord: () => weight >= 2,
    // Directories: ADMIN+ for create/rename; SYS_ADMIN for deleting non-empty
    canManageDirectory: () => weight >= 3,
    canDeleteNonEmptyDirectory: () => weight >= 4,
    isAdmin: () => weight >= 3,
    isSysAdmin: () => weight === 4,
  }
}
