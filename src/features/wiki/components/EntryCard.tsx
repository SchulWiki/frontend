import { Link } from 'react-router-dom'
import { ChevronRight, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/router/routes'
import type { WikiEntry } from '../wiki.types'

type Props = {
  entry: WikiEntry
}

export function EntryCard({ entry }: Props) {
  return (
    <Link to={ROUTES.ENTRY(entry.id)} className="block group">
      <Card className="transition-colors hover:border-primary hover:bg-muted/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <CardTitle className="text-base truncate">{entry.title}</CardTitle>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        {entry.childCount !== undefined && (
          <CardContent className="pt-0">
            <span className="text-xs text-muted-foreground">
              {entry.childCount === 0
                ? 'Keine Untereinträge'
                : `${entry.childCount} ${entry.childCount === 1 ? 'Untereintrag' : 'Untereinträge'}`}
            </span>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
