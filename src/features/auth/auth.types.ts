export type User = {
  id: number
  username: string
  email: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type RegisterRequest = {
  username: string
  password: string
  email: string
}
