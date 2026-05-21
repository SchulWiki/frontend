import { useLocation, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { ROUTES } from '@/router/routes'

export function LoginPage() {
  const location = useLocation()
  const justRegistered = location.state?.registered === true

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">SchulWiki</CardTitle>
          <CardDescription>Melde dich mit deinem Konto an</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {justRegistered && (
            <Alert>
              <AlertDescription>
                Registrierung erfolgreich! Du kannst dich jetzt anmelden.
              </AlertDescription>
            </Alert>
          )}
          <LoginForm />
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Noch kein Konto?&nbsp;
          <Link to={ROUTES.REGISTER} className="text-primary hover:underline">
            Registrieren
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
