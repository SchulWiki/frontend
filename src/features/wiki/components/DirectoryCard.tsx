import { Link } from 'react-router-dom'
import { ChevronRight, Folder } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/router/routes'
import type { DirectoryLight } from '../wiki.types'

type Props = {
  directory: DirectoryLight
}

export function DirectoryCard({ directory }: Props) {
  return (
    <Link to={ROUTES.DIRECTORY(directory.id)} className="block group">
      <Card className="transition-colors hover:border-primary hover:bg-muted/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
              <CardTitle className="text-base truncate">{directory.name}</CardTitle>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <span className="text-xs text-muted-foreground">
            {directory.childCount === 0
              ? 'Leer'
              : `${directory.childCount} ${directory.childCount === 1 ? 'Element' : 'Elemente'}`}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
