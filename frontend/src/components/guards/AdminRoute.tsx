import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface Props {
  children: React.ReactNode
}

export default function AdminRoute({ children }: Props) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth/login" replace />
  if (user.role !== 'admin' && user.role !== 'manager') return <Navigate to="/" replace />
  return <>{children}</>
}
