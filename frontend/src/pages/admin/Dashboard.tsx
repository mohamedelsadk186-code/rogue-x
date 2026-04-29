import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../../api/admin'

interface Stats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  totalProducts: number
  recentOrders: any[]
}

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  shipped: 'text-purple-400 bg-purple-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  const kpis = stats ? [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: 'text-gold' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'text-blue-400' },
    { label: 'Customers', value: stats.totalUsers, icon: '👥', color: 'text-green-400' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'text-yellow-400' },
    { label: 'Products', value: stats.totalProducts, icon: '🛍️', color: 'text-purple-400' },
  ] : []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Welcome back, here's your store overview</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-noir-800 border border-white/5 p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-noir-800 border border-white/5 p-5"
            >
              <div className="text-2xl mb-2">{kpi.icon}</div>
              <p className={`text-2xl font-bold font-display ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-white/40 mt-1">{kpi.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-white mb-4">Recent Orders</h2>
        <div className="bg-noir-800 border border-white/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium tracking-wider">Order ID</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30">No orders yet</td></tr>
              ) : (
                stats?.recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-white/60">#{order.id}</td>
                    <td className="px-4 py-3 text-white">{order.user_name || order.user_email}</td>
                    <td className="px-4 py-3 text-gold font-medium">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize font-medium ${statusColors[order.status] || 'text-white/50'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
