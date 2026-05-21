const REFRESH_TOKEN_KEY = 'schulwiki_refresh_token'

let accessToken: string | null = null

export const tokenStore = {
  getAccessToken: (): string | null => accessToken,
  setAccessToken: (token: string): void => { accessToken = token },
  clearAccessToken: (): void => { accessToken = null },

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): void => { localStorage.setItem(REFRESH_TOKEN_KEY, token) },
  clearRefreshToken: (): void => { localStorage.removeItem(REFRESH_TOKEN_KEY) },

  clearAll: (): void => {
    accessToken = null
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
