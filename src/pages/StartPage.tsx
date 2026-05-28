import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { wikiApi } from '@/features/wiki/wikiApi'
import { useRole } from '@/features/wiki/useRole'
import { EntryCard } from '@/features/wiki/components/EntryCard'
import { ROUTES } from '@/router/routes'

function EntryCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/4" />
    </div>
  )
}

export function StartPage() {
  const { isAdmin } = useRole()

  const { data: entries, isLoading, isError } = useQuery({
    queryKey: ['entries', 'root'],
    queryFn: () => wikiApi.getRootEntries(),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wiki</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Alle Einträge auf oberster Ebene</p>
        </div>
        {isAdmin() && (
          <Button asChild size="sm">
            <Link to={ROUTES.ENTRY_NEW}>
              <Plus className="h-4 w-4" />
              Neuer Eintrag
            </Link>
          </Button>
        )}
      </div>

      {isError && (
        <Alert variant="destructive">
          Einträge konnten nicht geladen werden. Bitte später erneut versuchen.
        </Alert>
      )}

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <EntryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && entries && entries.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {!isLoading && !isError && entries && entries.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">Noch keine Einträge vorhanden.</p>
          {isAdmin() && (
            <Button asChild variant="outline">
              <Link to={ROUTES.ENTRY_NEW}>Ersten Eintrag erstellen</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
