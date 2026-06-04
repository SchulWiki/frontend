import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, Trash2, FolderPlus, FilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { wikiApi } from '@/features/wiki/wikiApi'
import { useRole } from '@/features/wiki/useRole'
import { WikiBreadcrumb } from '@/features/wiki/components/WikiBreadcrumb'
import { DirectoryCard } from '@/features/wiki/components/DirectoryCard'
import { RecordCard } from '@/features/wiki/components/RecordCard'
import { ROUTES } from '@/router/routes'

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-8 bg-muted rounded w-1/3" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-16 bg-muted rounded-lg" />
        <div className="h-16 bg-muted rounded-lg" />
      </div>
    </div>
  )
}

export function DirectoryPage() {
  const { id } = useParams<{ id: string }>()
  const dirId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isConfirming, setIsConfirming] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { canManageDirectory, canCreateRecord, canDeleteNonEmptyDirectory } = useRole()

  const { data: directory, isLoading, isError } = useQuery({
    queryKey: ['directory', dirId],
    queryFn: () => wikiApi.getDirectory(dirId),
    enabled: !isNaN(dirId),
  })

  const hasContent = directory && (directory.subDirectories.length > 0 || directory.records.length > 0)

  const { mutate: deleteDir, isPending: isDeleting } = useMutation({
    mutationFn: () => wikiApi.deleteDirectory(dirId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory'] })
      navigate(directory?.parentDirectoryId ? ROUTES.DIRECTORY(directory.parentDirectoryId) : ROUTES.HOME)
    },
    onError: (err: Error) => {
      setIsConfirming(false)
      setApiError(err.message || 'Verzeichnis konnte nicht gelöscht werden.')
    },
  })

  if (isLoading) return <PageSkeleton />

  if (isError || !directory) {
    return (
      <Alert variant="destructive">
        Verzeichnis konnte nicht geladen werden. Bitte später erneut versuchen.
      </Alert>
    )
  }

  const canDelete = canManageDirectory() && (!hasContent || canDeleteNonEmptyDirectory())

  return (
    <div className="space-y-6">
      <WikiBreadcrumb parentDirectoryId={directory.parentDirectoryId} currentName={directory.name} />

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">{directory.name}</h1>

        {!isConfirming && (
          <div className="flex gap-2 shrink-0">
            {canManageDirectory() && (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link to={`${ROUTES.DIRECTORY_NEW}?parentId=${dirId}`}>
                    <FolderPlus className="h-4 w-4" />
                    Verzeichnis
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={ROUTES.DIRECTORY_EDIT(dirId)}>
                    <Edit className="h-4 w-4" />
                    Umbenennen
                  </Link>
                </Button>
              </>
            )}
            {canCreateRecord() && (
              <Button asChild size="sm">
                <Link to={`${ROUTES.RECORD_NEW}?parentId=${dirId}`}>
                  <FilePlus className="h-4 w-4" />
                  Eintrag
                </Link>
              </Button>
            )}
            {canDelete && (
              <Button variant="destructive" size="sm" onClick={() => setIsConfirming(true)}>
                <Trash2 className="h-4 w-4" />
                Löschen
              </Button>
            )}
          </div>
        )}
      </div>

      {isConfirming && (
        <div className="rounded-lg border border-destructive p-4 space-y-3 bg-destructive/5">
          <p className="text-sm font-medium">
            {hasContent
              ? 'Dieses Verzeichnis und alle Inhalte werden unwiderruflich gelöscht.'
              : 'Dieses Verzeichnis wird unwiderruflich gelöscht.'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsConfirming(false)} disabled={isDeleting}>
              Abbrechen
            </Button>
            <Button variant="destructive" size="sm" onClick={() => deleteDir()} disabled={isDeleting}>
              {isDeleting ? 'Wird gelöscht…' : 'Endgültig löschen'}
            </Button>
          </div>
        </div>
      )}

      {apiError && (
        <Alert variant="destructive">{apiError}</Alert>
      )}

      {!hasContent && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Dieses Verzeichnis ist leer.
        </p>
      )}

      {directory.subDirectories.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Unterverzeichnisse
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {directory.subDirectories.map(sub => (
              <DirectoryCard key={sub.id} directory={sub} />
            ))}
          </div>
        </section>
      )}

      {directory.records.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Einträge
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {directory.records.map(rec => (
              <RecordCard key={rec.id} record={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
