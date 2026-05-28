export type User = {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
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
  validationCredentialsRequest: {
    username: string
    password: string
    confirmPassword: string
  }
  email: string
  firstName: string
  lastName: string
}
