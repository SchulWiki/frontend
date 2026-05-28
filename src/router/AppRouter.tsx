import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicRoute } from '@/features/auth/PublicRoute'
import { Layout } from '@/components/layout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { StartPage } from '@/pages/StartPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { EntryPage } from '@/pages/EntryPage'
import { EntryEditPage } from '@/pages/EntryEditPage'
import { SearchPage } from '@/pages/SearchPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { ROUTES } from './routes'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path={ROUTES.HOME} element={<StartPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path="/entries/:id" element={<EntryPage />} />
            <Route path="/entries/:id/edit" element={<EntryEditPage />} />
            <Route path={ROUTES.ENTRY_NEW} element={<EntryEditPage />} />
            <Route path={ROUTES.SEARCH} element={<SearchPage />} />
            <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
