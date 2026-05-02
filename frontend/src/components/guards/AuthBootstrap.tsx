import { useEffect } from 'react'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

export default function AuthBootstrap() {
  const token = useAuthStore(s => s.token)
  const setUserPermissions = useAuthStore(s => s.setUserPermissions)

  useEffect(() => {
    if (!token) return
    authApi
      .me()
      .then((r) => {
        if (r.data.user.permissions) setUserPermissions(r.data.user.permissions)
      })
      .catch(() => {})
  }, [token, setUserPermissions])

  return null
}
