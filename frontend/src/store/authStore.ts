import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../api/auth'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('rogue_x_token', token)
        set({ user, token })
      },
      logout: () => {
        localStorage.removeItem('rogue_x_token')
        localStorage.removeItem('rogue_x_user')
        set({ user: null, token: null })
      },
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'rogue_x_auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
