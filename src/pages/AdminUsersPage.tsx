import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { useRole } from '@/features/wiki/useRole'
import { useAuth } from '@/features/auth/useAuth'
import { adminApi } from '@/features/admin/adminApi'
import { ROUTES } from '@/router/routes'

const ROLE_LABELS: Record<string, string> = {
  GUEST: 'Gast',
  EDITOR: 'Redakteur',
  ADMIN: 'Administrator',
  SYS_ADMIN: 'System-Admin',
}

const ASSIGNABLE_ROLES = ['GUEST', 'EDITOR', 'ADMIN']

const FILTER_OPTIONS = [
  { value: '', label: 'Alle Rollen' },
  { value: 'GUEST', label: 'Gast' },
  { value: 'EDITOR', label: 'Redakteur' },
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'SYS_ADMIN', label: 'System-Admin' },
]

type ConfirmRole = { userId: number; username: string; newRole: string }
type ConfirmDelete = { userId: number; username: string }

function ConfirmDialog({
  title,
  onConfirm,
  onCancel,
  confirmLabel = 'Bestätigen',
  confirmVariant = 'default' as 'default' | 'destructive',
  isPending,
}: {
  title: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  confirmVariant?: 'default' | 'destructive'
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-lg border shadow-lg p-6 max-w-sm w-full mx-4 space-y-4">
        <p className="text-sm">{title}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            Abbrechen
          </Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Bitte warten…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b">
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-muted animate-pulse w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function AdminUsersPage() {
  const { isSysAdmin } = useRole()
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [page, setPage] = useState(0)
  const [apiError, setApiError] = useState<string | null>(null)
  const [confirmRole, setConfirmRole] = useState<ConfirmRole | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(0)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, showDeleted],
    queryFn: () =>
      adminApi.getUsers({ page, size: 20, search: search || undefined, role: roleFilter || undefined, deleted: showDeleted || undefined }),
    enabled: isSysAdmin(),
  })

  const { mutate: changeRole, isPending: isChangingRole } = useMutation({
    mutationFn: ({ userId, newRole }: ConfirmRole) => adminApi.updateUserRole(userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setConfirmRole(null)
      setApiError(null)
    },
    onError: () => setApiError('Rolle konnte nicht geändert werden.'),
  })

  const { mutate: removeUser, isPending: isDeleting } = useMutation({
    mutationFn: ({ userId }: ConfirmDelete) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setConfirmDelete(null)
      setApiError(null)
    },
    onError: () => setApiError('Benutzer konnte nicht gelöscht werden.'),
  })

  if (!isSysAdmin()) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>

      {(isError || apiError) && (
        <Alert variant="destructive">
          {apiError ?? 'Benutzer konnten nicht geladen werden.'}
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <Input
          placeholder="Suche nach Benutzername oder E-Mail…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(0) }}
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {FILTER_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none ml-auto">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={e => { setShowDeleted(e.target.checked); setPage(0) }}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          Gelöschte anzeigen
        </label>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Benutzername</th>
              <th className="px-4 py-3 text-left font-medium">E-Mail</th>
              <th className="px-4 py-3 text-left font-medium">Vorname</th>
              <th className="px-4 py-3 text-left font-medium">Nachname</th>
              <th className="px-4 py-3 text-left font-medium">Rolle</th>
              <th className="px-4 py-3 text-left font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : data?.content.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Keine Benutzer gefunden.
                </td>
              </tr>
            ) : (
              data?.content.map(user => {
                const isOwnAccount = user.id === currentUser?.id
                const isSysAdminUser = user.role === 'SYS_ADMIN'
                const isDeleted = user.deleted
                const roleChangeDisabled = isOwnAccount || isSysAdminUser || isDeleted
                const deleteDisabled = isOwnAccount || isSysAdminUser || isDeleted
                const roleChangeTitle = isOwnAccount
                  ? 'Eigene Rolle kann nicht geändert werden.'
                  : isSysAdminUser
                  ? 'Die SYS_ADMIN-Rolle kann nicht geändert werden.'
                  : isDeleted
                  ? 'Gelöschte Benutzer können nicht bearbeitet werden.'
                  : undefined
                const deleteTitle = isOwnAccount
                  ? 'Eigenen Account kann nicht gelöscht werden.'
                  : isSysAdminUser
                  ? 'SYS_ADMIN-Benutzer können nicht gelöscht werden.'
                  : isDeleted
                  ? 'Bereits gelöscht.'
                  : undefined
                return (
                  <tr key={user.id} className={`border-b transition-colors ${isDeleted ? 'opacity-50' : 'hover:bg-muted/30'}`}>
                    <td className="px-4 py-3 font-medium">
                      <span className={isDeleted ? 'line-through text-muted-foreground' : undefined}>
                        {user.username}
                      </span>
                      {isDeleted && (
                        <span className="ml-2 text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                          Gelöscht
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">{user.firstName}</td>
                    <td className="px-4 py-3">{user.lastName}</td>
                    <td className="px-4 py-3">
                      <span title={roleChangeTitle}>
                        <select
                          value={user.role}
                          disabled={roleChangeDisabled}
                          onChange={e =>
                            setConfirmRole({ userId: user.id, username: user.username, newRole: e.target.value })
                          }
                          className="rounded border border-input bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSysAdminUser
                            ? <option value="SYS_ADMIN">{ROLE_LABELS['SYS_ADMIN']}</option>
                            : ASSIGNABLE_ROLES.map(r => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                              ))
                          }
                        </select>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteDisabled}
                        title={deleteTitle}
                        onClick={() => setConfirmDelete({ userId: user.id, username: user.username })}
                      >
                        Löschen
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center gap-3 justify-end text-sm">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
            Zurück
          </Button>
          <span className="text-muted-foreground">
            Seite {page + 1} von {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= data.totalPages - 1}
          >
            Weiter
          </Button>
        </div>
      )}

      {data && (
        <p className="text-xs text-muted-foreground text-right">{data.totalElements} Benutzer gesamt</p>
      )}

      {/* Role change confirmation */}
      {confirmRole && (
        <ConfirmDialog
          title={`Rolle von "${confirmRole.username}" zu "${ROLE_LABELS[confirmRole.newRole] ?? confirmRole.newRole}" ändern?`}
          confirmLabel="Bestätigen"
          confirmVariant="default"
          isPending={isChangingRole}
          onCancel={() => setConfirmRole(null)}
          onConfirm={() => changeRole(confirmRole)}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          title={`Benutzer "${confirmDelete.username}" unwiderruflich löschen?`}
          confirmLabel="Löschen"
          confirmVariant="destructive"
          isPending={isDeleting}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => removeUser(confirmDelete)}
        />
      )}
    </div>
  )
}
