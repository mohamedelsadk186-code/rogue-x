import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface Props {
  children: React.ReactNode
}

export default function PrivateRoute({ children }: Props) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth/login" replace />
  return <>{children}</>
}
