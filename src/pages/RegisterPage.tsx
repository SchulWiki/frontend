import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { ROUTES } from '@/router/routes'

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Konto erstellen</CardTitle>
          <CardDescription>Registriere dich für SchulWiki</CardDescription>
        </CardHeader>

        <CardContent>
          <RegisterForm />
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Bereits ein Konto?&nbsp;
          <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
            Anmelden
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
