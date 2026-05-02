import { useMemo, useEffect, useState } from 'react'
import { ordersApi, type Order } from '../../api/orders'
import { useAuthStore } from '../../store/authStore'

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  shipped: 'text-purple-400 bg-purple-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const { can } = useAuthStore()
  const canRead = useMemo(() => can('orders.read'), [can])
  const canUpdate = useMemo(() => can('orders.update'), [can])

  useEffect(() => {
    if (!canRead) {
      setLoading(false)
      return
    }
    setLoading(true)
    ordersApi.getAllAdmin().then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [canRead])

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await ordersApi.updateStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status')
    }
  }

  const filtered = filterStatus ? orders.filter(o => o.status === filterStatus) : orders

  if (!canRead) {
    return (
      <div className="p-8">
        <h1 className="font-display text-3xl font-bold text-white">Orders</h1>
        <p className="text-white/45 text-sm mt-2">You do not have permission to view orders.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Orders</h1>
          <p className="text-white/40 text-sm mt-1">{filtered.length} orders</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilterStatus('')} className={`px-4 py-1.5 text-xs border transition-all ${!filterStatus ? 'border-gold bg-gold text-noir font-semibold' : 'border-white/20 text-white/50'}`}>All</button>
        {statusOptions.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-1.5 text-xs border capitalize transition-all ${filterStatus === s ? 'border-gold bg-gold text-noir font-semibold' : 'border-white/20 text-white/50 hover:border-white/40'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-noir-800 border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-white/5 animate-pulse rounded" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30">No orders found</td></tr>
            ) : (
              filtered.map(order => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3 text-white/50">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{(order as any).user_name || 'N/A'}</p>
                    <p className="text-white/40 text-xs">{(order as any).user_email}</p>
                  </td>
                  <td className="px-4 py-3 text-white/50">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 text-gold font-medium">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={!canUpdate}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      className={`bg-noir border text-xs px-2 py-1 outline-none capitalize cursor-pointer ${statusColors[order.status] || ''} border-white/10 ${!canUpdate ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
