import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FolderPlus, FilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { wikiApi } from '@/features/wiki/wikiApi'
import { useRole } from '@/features/wiki/useRole'
import { DirectoryCard } from '@/features/wiki/components/DirectoryCard'
import { RecordCard } from '@/features/wiki/components/RecordCard'
import { ROUTES } from '@/router/routes'

function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/4" />
    </div>
  )
}

export function StartPage() {
  const { canManageDirectory, canCreateRecord } = useRole()

  const { data: root, isLoading, isError } = useQuery({
    queryKey: ['directory', 'root'],
    queryFn: () => wikiApi.getRoot(),
  })

  const hasContent = root && (root.subDirectories.length > 0 || root.records.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wiki</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Alle Einträge auf oberster Ebene</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {canManageDirectory() && root && (
            <Button asChild size="sm" variant="outline">
              <Link to={`${ROUTES.DIRECTORY_NEW}?parentId=${root.id}`}>
                <FolderPlus className="h-4 w-4" />
                Verzeichnis
              </Link>
            </Button>
          )}
          {canCreateRecord() && root && (
            <Button asChild size="sm">
              <Link to={`${ROUTES.RECORD_NEW}?parentId=${root.id}`}>
                <FilePlus className="h-4 w-4" />
                Eintrag
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isError && (
        <Alert variant="destructive">
          Einträge konnten nicht geladen werden. Bitte später erneut versuchen.
        </Alert>
      )}

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && hasContent && (
        <div className="space-y-6">
          {root.subDirectories.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Verzeichnisse
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {root.subDirectories.map(dir => (
                <DirectoryCard key={dir.id} directory={dir} />
              ))}
              </div>
            </section>
          )}

          {root.records.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Einträge
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {root.records.map(rec => (
                  <RecordCard key={rec.id} record={rec} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!isLoading && !isError && !hasContent && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">Noch keine Einträge vorhanden.</p>
          {canCreateRecord() && root && (
            <Button asChild variant="outline">
              <Link to={`${ROUTES.RECORD_NEW}?parentId=${root.id}`}>Ersten Eintrag erstellen</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
