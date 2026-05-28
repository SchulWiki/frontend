import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Menu, X, Search, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/useAuth'
import { useRole } from '@/features/wiki/useRole'
import { ROUTES } from '@/router/routes'

export function Navbar() {
  const { logout, user } = useAuth()
  const { isSysAdmin } = useRole()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN)
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}`)
      setSearchQuery('')
      setMobileOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          to={ROUTES.HOME}
          className="shrink-0 font-semibold text-primary"
          onClick={() => setMobileOpen(false)}
        >
          SchulWiki
        </Link>

        {/* Search — always visible */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-xs items-center gap-1">
          <Input
            placeholder="Suche…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" variant="ghost" className="shrink-0 px-2">
            <Search className="h-4 w-4" />
            <span className="sr-only">Suchen</span>
          </Button>
        </form>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {isSysAdmin() && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.ADMIN_USERS}>
                <ShieldCheck className="h-4 w-4" />
                Benutzerverwaltung
              </Link>
            </Button>
          )}
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

        {/* Mobile hamburger toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Menü öffnen"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-2 flex flex-col gap-1">
          {isSysAdmin() && (
            <Button variant="ghost" size="sm" className="justify-start w-full" asChild>
              <Link to={ROUTES.ADMIN_USERS} onClick={() => setMobileOpen(false)}>
                <ShieldCheck className="h-4 w-4" />
                Benutzerverwaltung
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="justify-start w-full" asChild>
            <Link to={ROUTES.PROFILE} onClick={() => setMobileOpen(false)}>
              <User className="h-4 w-4" />
              {user?.username ?? 'Profil'}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
        </div>
      )}
    </header>
  )
}
