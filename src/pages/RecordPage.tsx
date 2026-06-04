import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { wikiApi } from '@/features/wiki/wikiApi'
import { useRole } from '@/features/wiki/useRole'
import { WikiBreadcrumb } from '@/features/wiki/components/WikiBreadcrumb'
import { MarkdownPreview } from '@/features/wiki/components/MarkdownPreview'
import { ROUTES } from '@/router/routes'

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-3xl">
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-8 bg-muted rounded w-2/3" />
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
    </div>
  )
}

export function RecordPage() {
  const { id } = useParams<{ id: string }>()
  const recordId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isConfirming, setIsConfirming] = useState(false)

  const { canEditRecord, canDeleteRecord } = useRole()

  const { data: record, isLoading, isError } = useQuery({
    queryKey: ['record', recordId],
    queryFn: () => wikiApi.getRecord(recordId),
    enabled: !isNaN(recordId),
  })

  const { mutate: deleteRecord, isPending: isDeleting, isError: deleteError } = useMutation({
    mutationFn: () => wikiApi.deleteRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory', record?.parentDirectoryId] })
      navigate(record ? ROUTES.DIRECTORY(record.parentDirectoryId) : ROUTES.HOME)
    },
  })

  if (isLoading) return <PageSkeleton />

  if (isError || !record) {
    return (
      <Alert variant="destructive">
        Eintrag konnte nicht geladen werden. Bitte später erneut versuchen.
      </Alert>
    )
  }

  const formattedDate = new Date(record.updatedAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const authorName = `${record.updatedBy.firstName} ${record.updatedBy.lastName}`.trim()

  return (
    <div className="space-y-6 max-w-3xl">
      <WikiBreadcrumb parentDirectoryId={record.parentDirectoryId} currentName={record.title} />

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight">{record.title}</h1>

          {!isConfirming && (
            <div className="flex items-center gap-2 shrink-0">
              {canEditRecord() && (
                <Button asChild variant="outline" size="sm">
                  <Link to={ROUTES.RECORD_EDIT(recordId)}>
                    <Edit className="h-4 w-4" />
                    Bearbeiten
                  </Link>
                </Button>
              )}
              {canDeleteRecord(record) && (
                <Button variant="destructive" size="sm" onClick={() => setIsConfirming(true)}>
                  <Trash2 className="h-4 w-4" />
                  Löschen
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>Autor: {authorName || `#${record.updatedBy.id}`}</span>
          <span>Zuletzt geändert: {formattedDate}</span>
        </div>
      </div>

      {isConfirming && (
        <div className="rounded-lg border border-destructive p-4 space-y-3 bg-destructive/5">
          <p className="text-sm font-medium">
            Dieser Eintrag wird unwiderruflich gelöscht.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirming(false)}
              disabled={isDeleting}
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteRecord()}
              disabled={isDeleting}
            >
              {isDeleting ? 'Wird gelöscht…' : 'Endgültig löschen'}
            </Button>
          </div>
        </div>
      )}

      {deleteError && (
        <Alert variant="destructive">
          Eintrag konnte nicht gelöscht werden. Bitte später erneut versuchen.
        </Alert>
      )}

      <MarkdownPreview content={record.content} />
    </div>
  )
}
