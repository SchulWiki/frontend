import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, Folder, Search } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { wikiApi } from '@/features/wiki/wikiApi'
import { ROUTES } from '@/router/routes'
import type { RecordSearchResult, DirectoryLight } from '@/features/wiki/wiki.types'

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function SearchResultSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-2">
          <div className="h-5 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

function DirectoryResultItem({ dir }: { dir: DirectoryLight }) {
  return (
    <article className="rounded-lg border p-4 space-y-1 hover:border-primary transition-colors">
      <Link
        to={ROUTES.DIRECTORY(dir.id)}
        className="flex items-center gap-2 font-medium text-foreground hover:text-primary transition-colors"
      >
        <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
        {dir.name}
      </Link>
      <p className="text-xs text-muted-foreground/70">
        {dir.childCount === 0
          ? 'Verzeichnis · Leer'
          : `Verzeichnis · ${dir.childCount} ${dir.childCount === 1 ? 'Element' : 'Elemente'}`}
      </p>
    </article>
  )
}

function RecordResultItem({ result }: { result: RecordSearchResult }) {
  const excerpt = stripMarkdown(result.excerpt)

  return (
    <article className="rounded-lg border p-4 space-y-1.5 hover:border-primary transition-colors">
      <Link
        to={ROUTES.RECORD(result.id)}
        className="flex items-center gap-2 font-medium text-foreground hover:text-primary transition-colors"
      >
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        {result.title}
      </Link>
      {excerpt && (
        <p className="text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
      )}
      <p className="text-xs text-muted-foreground/70">
        Eintrag in {result.parentDirectoryName}
      </p>
    </article>
  )
}

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const enabled = query.trim().length > 0

  const {
    data: records = [],
    isLoading: recordsLoading,
    isError: recordsError,
  } = useQuery({
    queryKey: ['search', 'records', query],
    queryFn: () => wikiApi.searchRecords(query),
    enabled,
  })

  const {
    data: directories = [],
    isLoading: dirsLoading,
    isError: dirsError,
  } = useQuery({
    queryKey: ['search', 'directories', query],
    queryFn: () => wikiApi.searchDirectories(query),
    enabled,
  })

  const isLoading = recordsLoading || dirsLoading
  const isError = recordsError || dirsError
  const hasResults = records.length > 0 || directories.length > 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Suche</h1>
        {query && (
          <p className="text-sm text-muted-foreground mt-0.5">
            Ergebnisse für „{query}"
          </p>
        )}
      </div>

      {!query && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Search className="h-10 w-10 opacity-30" />
          <p>Gib einen Suchbegriff in die Suchleiste ein.</p>
        </div>
      )}

      {query && isError && (
        <Alert variant="destructive">
          Suche konnte nicht durchgeführt werden. Bitte später erneut versuchen.
        </Alert>
      )}

      {query && isLoading && <SearchResultSkeleton />}

      {query && !isLoading && !isError && !hasResults && (
        <p className="text-muted-foreground">
          Keine Ergebnisse für „{query}" gefunden.
        </p>
      )}

      {query && !isLoading && !isError && hasResults && (
        <div className="space-y-3">
          {directories.map(dir => (
            <DirectoryResultItem key={`dir-${dir.id}`} dir={dir} />
          ))}
          {records.map(result => (
            <RecordResultItem key={`rec-${result.id}`} result={result} />
          ))}
        </div>
      )}
    </div>
  )
}
