import { Link } from 'react-router-dom'
import { ChevronRight, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/router/routes'
import type { RecordLight } from '../wiki.types'

type Props = {
  record: RecordLight
}

export function RecordCard({ record }: Props) {
  return (
    <Link to={ROUTES.RECORD(record.id)} className="block group">
      <Card className="transition-colors hover:border-primary hover:bg-muted/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <CardTitle className="text-base truncate">{record.title}</CardTitle>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
