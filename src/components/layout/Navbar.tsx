import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/useAuth'
import { ROUTES } from '@/router/routes'

export function Navbar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 font-semibold text-primary">
          SchulWiki
        </Link>

        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.HOME}>
              <Home className="h-4 w-4" />
              Startseite
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.PROFILE}>
              <User className="h-4 w-4" />
              {user?.username ?? 'Profil'}
            </Link>
          </Button>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
        </nav>
      </div>
    </header>
  )
}
