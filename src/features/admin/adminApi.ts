import { axiosInstance } from '@/lib/http/axiosInstance'
import type { User } from '@/features/auth/auth.types'

export type UsersPage = {
  content: User[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

type GetUsersParams = {
  page?: number
  size?: number
  search?: string
  role?: string
}

export const adminApi = {
  async getUsers(params: GetUsersParams = {}): Promise<UsersPage> {
    const query = new URLSearchParams()
    query.set('page', String(params.page ?? 0))
    query.set('size', String(params.size ?? 20))
    if (params.search) query.set('search', params.search)
    if (params.role) query.set('role', params.role)
    const response = await axiosInstance.get<UsersPage>(`/api/users?${query}`)
    return response.data
  },

  async updateUserRole(id: number, role: string): Promise<User> {
    const response = await axiosInstance.patch<User>(`/api/users/${id}/role`, { role })
    return response.data
  },

  async deleteUser(id: number): Promise<void> {
    await axiosInstance.delete(`/api/users/${id}`)
  },
}
