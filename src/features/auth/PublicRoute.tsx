import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { ROUTES } from '@/router/routes'

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return isAuthenticated ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />
}
