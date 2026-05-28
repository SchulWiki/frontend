import { axiosInstance } from '@/lib/http/axiosInstance'
import { getDeviceFingerprint } from '@/lib/fingerprint/deviceFingerprint'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from './auth.types'

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const fingerprint = await getDeviceFingerprint()
    const response = await axiosInstance.post<AuthResponse>('/api/auth/login', data, {
      headers: { 'X-Device-Fingerprint': fingerprint },
    })
    return response.data
  },

  async register(data: RegisterRequest): Promise<void> {
    await axiosInstance.post('/api/auth/register', data)
  },

  async logout(refreshToken: string): Promise<void> {
    await axiosInstance.post('/api/auth/logout', { token: refreshToken })
  },

  async getMe(): Promise<User> {
    const response = await axiosInstance.get<User>('/api/auth/me')
    return response.data
  },

  async updateProfile(id: number, data: { firstName: string; lastName: string }): Promise<User> {
    const response = await axiosInstance.patch<User>(`/api/users/${id}`, data)
    return response.data
  },

  async updateIdentity(id: number, data: { username: string; email: string }): Promise<User> {
    const response = await axiosInstance.patch<User>(`/api/users/${id}/identity`, data)
    return response.data
  },

  async updatePassword(id: number, data: { currentPassword: string; newPassword: string }): Promise<void> {
    await axiosInstance.patch(`/api/users/${id}/password`, data)
  },
}
