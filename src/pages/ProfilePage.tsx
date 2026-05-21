import { useEffect, useState } from 'react'
import { User, Mail, Hash } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authApi } from '@/features/auth/authApi'
import type { User as UserType } from '@/features/auth/auth.types'

export function ProfilePage() {
  const [profile, setProfile] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authApi
      .getMe()
      .then(setProfile)
      .catch(() => setError('Profil konnte nicht geladen werden.'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Mein Profil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Kontoinformationen</CardTitle>
          <CardDescription>Deine persönlichen Daten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Benutzername</span>
            <span className="ml-auto font-medium">{profile?.username}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">E-Mail-Adresse</span>
            <span className="ml-auto font-medium">{profile?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">ID</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">{profile?.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
