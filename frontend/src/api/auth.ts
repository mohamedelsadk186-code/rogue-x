import client from './client'

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'manager' | 'customer'
  oauth_provider?: string | null
  oauth_id?: string | null
  created_at: string
  permissions?: string[]
}

export interface AuthResponse {
  user: User
  token: string
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    client.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    client.post<AuthResponse>('/auth/login', data),
  googleOAuth: (idToken: string) => client.post<AuthResponse>('/auth/oauth/google', { idToken }),
  appleOAuth: (identityToken: string) => client.post<AuthResponse>('/auth/oauth/apple', { identityToken }),
  me: () => client.get<{ user: User }>('/auth/me'),
}
