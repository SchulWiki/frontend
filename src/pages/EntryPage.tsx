import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Edit, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { wikiApi } from '@/features/wiki/wikiApi'
import { useRole } from '@/features/wiki/useRole'
import { Breadcrumb } from '@/features/wiki/components/Breadcrumb'
import { EntryCard } from '@/features/wiki/components/EntryCard'
import { MarkdownPreview } from '@/features/wiki/components/MarkdownPreview'
import { ROUTES } from '@/router/routes'

function EntryPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-1/3" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 pt-4">
        <div className="h-16 bg-muted rounded-lg" />
        <div className="h-16 bg-muted rounded-lg" />
      </div>
    </div>
  )
}

export function EntryPage() {
  const { id } = useParams<{ id: string }>()
  const entryId = Number(id)

  const { canEdit, canDelete, canCreate } = useRole()

  const {
    data: entry,
    isLoading: entryLoading,
    isError: entryError,
  } = useQuery({
    queryKey: ['entry', entryId],
    queryFn: () => wikiApi.getEntry(entryId),
    enabled: !isNaN(entryId),
  })

  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ['entries', entryId],
    queryFn: () => wikiApi.getChildren(entryId),
    enabled: !isNaN(entryId),
  })

  if (entryLoading) return <EntryPageSkeleton />

  if (entryError || !entry) {
    return (
      <Alert variant="destructive">
        Eintrag konnte nicht geladen werden. Bitte später erneut versuchen.
      </Alert>
    )
  }

  const formattedDate = new Date(entry.updatedAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-8 max-w-3xl">
      <Breadcrumb entry={entry} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight">{entry.title}</h1>
          <div className="flex items-center gap-2 shrink-0">
            {canEdit(entry) && (
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.ENTRY_EDIT(entryId)}>
                  <Edit className="h-4 w-4" />
                  Bearbeiten
                </Link>
              </Button>
            )}
            {canDelete(entry) && (
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
                Löschen
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>Autor: {entry.authorName ?? `#${entry.authorId}`}</span>
          <span>Zuletzt geändert: {formattedDate}</span>
        </div>
      </div>

      {/* Markdown content */}
      <MarkdownPreview content={entry.content} />

      <div className="border-t" />

      {/* Children section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Untereinträge</h2>
          {canCreate() && (
            <Button asChild variant="outline" size="sm">
              <Link to={`${ROUTES.ENTRY_NEW}?parentId=${entryId}`}>
                <Plus className="h-4 w-4" />
                Kindelement erstellen
              </Link>
            </Button>
          )}
        </div>

        {childrenLoading && (
          <div className="grid gap-3 sm:grid-cols-2 animate-pulse">
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-16 bg-muted rounded-lg" />
          </div>
        )}

        {!childrenLoading && children && children.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {children.map(child => (
              <EntryCard key={child.id} entry={child} />
            ))}
          </div>
        )}

        {!childrenLoading && children && children.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Noch keine Einträge in diesem Bereich.
          </p>
        )}
      </section>
    </div>
  )
}
