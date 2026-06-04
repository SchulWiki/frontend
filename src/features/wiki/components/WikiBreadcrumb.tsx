import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Home } from 'lucide-react'
import { wikiApi } from '../wikiApi'
import { ROUTES } from '@/router/routes'

type Props = {
  parentDirectoryId: number | null
  currentName: string
}

export function WikiBreadcrumb({ parentDirectoryId, currentName }: Props) {
  const { data: ancestors = [], isLoading } = useQuery({
    queryKey: ['breadcrumb', parentDirectoryId],
    queryFn: () => wikiApi.getDirectoryAncestors(parentDirectoryId),
    enabled: parentDirectoryId !== null,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 animate-pulse" aria-label="Breadcrumb">
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-3.5 w-3.5 bg-muted rounded" />
        <div className="h-4 w-28 bg-muted rounded" />
      </div>
    )
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-0.5 text-sm text-muted-foreground">
        <li>
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Startseite
          </Link>
        </li>

        {ancestors.map(ancestor => (
          <li key={ancestor.id} className="flex items-center gap-0.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              to={ROUTES.DIRECTORY(ancestor.id)}
              className="hover:text-foreground transition-colors max-w-[160px] truncate"
            >
              {ancestor.name}
            </Link>
          </li>
        ))}

        <li className="flex items-center gap-0.5">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium max-w-[200px] truncate">{currentName}</span>
        </li>
      </ol>
    </nav>
  )
}
