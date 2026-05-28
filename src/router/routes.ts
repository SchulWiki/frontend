export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ENTRY: (id: number) => `/entries/${id}`,
  ENTRY_EDIT: (id: number) => `/entries/${id}/edit`,
  ENTRY_NEW: '/entries/new',
  SEARCH: '/search',
  ADMIN_USERS: '/admin/users',
} as const
