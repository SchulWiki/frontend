import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from '@/lib/auth/tokenStore'
import { getDeviceFingerprint } from '@/lib/fingerprint/deviceFingerprint'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const axiosInstance = axios.create({ baseURL: BASE_URL })

const refreshClient = axios.create({ baseURL: BASE_URL })

type FailedRequest = {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}

let isRefreshing = false
let failedQueue: FailedRequest[] = []

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStore.getRefreshToken()
    if (!refreshToken) {
      tokenStore.clearAll()
      window.dispatchEvent(new CustomEvent('auth:logout'))
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`
        return axiosInstance(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const fingerprint = await getDeviceFingerprint()
      const { data } = await refreshClient.post<{ accessToken: string; refreshToken: string }>(
        '/api/auth/refresh',
        { token: refreshToken },
        { headers: { 'X-Device-Fingerprint': fingerprint } }
      )
      tokenStore.setAccessToken(data.accessToken)
      tokenStore.setRefreshToken(data.refreshToken)
      processQueue(null, data.accessToken)
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return axiosInstance(original)
    } catch (err) {
      processQueue(err, null)
      tokenStore.clearAll()
      window.dispatchEvent(new CustomEvent('auth:logout'))
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)
