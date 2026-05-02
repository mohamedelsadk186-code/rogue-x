import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface Props {
  children: React.ReactNode
}

export default function AdminRoute({ children }: Props) {
  const { user, can } = useAuthStore()
  if (!user) return <Navigate to="/auth/login?redirect=/admin" replace />
  if (user.role !== 'admin' && user.role !== 'manager') return <Navigate to="/" replace />

  const hasDashboard = can('dashboard.view')
  const hasAnything =
    user.role === 'admin' ||
    hasDashboard ||
    can('products.read') ||
    can('orders.read') ||
    can('users.read') ||
    can('homepage.read') ||
    can('pages.read')

  if (!hasAnything) return <Navigate to="/" replace />
  return <>{children}</>
}
