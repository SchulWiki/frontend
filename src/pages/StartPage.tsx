import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/useAuth'

export function StartPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Willkommen, {user?.username}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Das SchulWiki-Wissensmanagementsystem
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <CardTitle>Wiki-Inhalte</CardTitle>
          </div>
          <CardDescription>
            Ausbildungsberufe → Lernfelder → Kategorien → Einträge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Wiki-Inhalte folgen in Phase 2. Hier werden Ausbildungsberufe, Lernfelder,
            Kategorien und Einträge verwaltet und abgerufen.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
