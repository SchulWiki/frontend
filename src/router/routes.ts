export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  SEARCH: '/search',
  ADMIN_USERS: '/admin/users',
  DIRECTORY: (id: number) => `/directories/${id}`,
  DIRECTORY_EDIT: (id: number) => `/directories/${id}/edit`,
  DIRECTORY_NEW: '/directories/new',
  RECORD: (id: number) => `/records/${id}`,
  RECORD_EDIT: (id: number) => `/records/${id}/edit`,
  RECORD_NEW: '/records/new',
} as const
