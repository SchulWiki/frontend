import { useAuth } from '@/features/auth/useAuth'
import type { WikiEntry } from './wiki.types'

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
    canEdit: (entry: WikiEntry) =>
      weight >= 3 || (weight === 2 && entry.authorId === user?.id),
    canDelete: (entry: WikiEntry) =>
      weight >= 3 || (weight === 2 && entry.authorId === user?.id),
    canCreate: () => weight >= 2,
    isAdmin: () => weight >= 3,
    isSysAdmin: () => weight === 4,
  }
}
