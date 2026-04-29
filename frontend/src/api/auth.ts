import client from './client'

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'manager' | 'customer'
  created_at: string
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
  me: () => client.get<{ user: User }>('/auth/me'),
}
