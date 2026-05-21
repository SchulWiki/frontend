import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { authApi } from './authApi'
import { tokenStore } from '@/lib/auth/tokenStore'
import type { User } from './auth.types'

function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleProactiveRefresh = useCallback((accessToken: string) => {
    const exp = decodeJwtExp(accessToken)
    if (!exp) return
    const msUntilRefresh = exp * 1000 - Date.now() - 2 * 60 * 1000
    if (msUntilRefresh <= 0) return

    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)

    refreshTimerRef.current = setTimeout(async () => {
      const refreshToken = tokenStore.getRefreshToken()
      if (!refreshToken) return
      try {
        const data = await authApi.login
        void data
        const result = await authApi.getMe()
        void result
      } catch {
        // handled by interceptor event
      }
    }, msUntilRefresh)
  }, [])

  useEffect(() => {
    const handleForceLogout = () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
      setUser(null)
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const refreshToken = tokenStore.getRefreshToken()
    if (!refreshToken) {
      setIsLoading(false)
      return
    }
    authApi
      .getMe()
      .then(userData => {
        setUser(userData)
        const token = tokenStore.getAccessToken()
        if (token) scheduleProactiveRefresh(token)
      })
      .catch(() => tokenStore.clearAll())
      .finally(() => setIsLoading(false))
  }, [scheduleProactiveRefresh])

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await authApi.login({ username, password })
      tokenStore.setAccessToken(data.accessToken)
      tokenStore.setRefreshToken(data.refreshToken)
      const userData = await authApi.getMe()
      setUser(userData)
      scheduleProactiveRefresh(data.accessToken)
    },
    [scheduleProactiveRefresh]
  )

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefreshToken()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // logout anyway
      }
    }
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    tokenStore.clearAll()
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
