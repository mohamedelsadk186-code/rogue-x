import { Navigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import Dashboard from './Dashboard'

function firstAllowedPath(can: (p: string) => boolean) {
  const candidates: Array<{ path: string; perm: string }> = [
    { path: '/admin/products', perm: 'products.read' },
    { path: '/admin/orders', perm: 'orders.read' },
    { path: '/admin/users', perm: 'users.read' },
    { path: '/admin/pages', perm: 'pages.read' },
    { path: '/admin/homepage', perm: 'homepage.read' },
    { path: '/admin/ai', perm: 'dashboard.view' },
  ]

  for (const c of candidates) {
    if (can(c.perm)) return c.path
  }
  return '/'
}

export default function AdminHomeRedirect() {
  const can = useAuthStore(s => s.can)

  const target = useMemo(() => {
    if (can('dashboard.view')) return null
    return firstAllowedPath(can)
  }, [can])

  if (target === '/') return <Navigate to="/" replace />
  if (target) return <Navigate to={target} replace />

  return <Dashboard />
}
