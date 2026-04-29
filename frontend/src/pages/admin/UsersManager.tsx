import { useEffect, useState } from 'react'
import { adminApi } from '../../api/admin'
import type { User } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

const roleColors: Record<string, string> = {
  admin: 'text-gold bg-gold/10',
  manager: 'text-blue-400 bg-blue-400/10',
  customer: 'text-white/50 bg-white/5',
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { user: me } = useAuthStore()

  const load = () => {
    setLoading(true)
    adminApi.getUsers().then(r => setUsers(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await adminApi.updateUserRole(id, role)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: role as any } : u))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update role')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return
    try {
      await adminApi.deleteUser(id)
      load()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Users</h1>
        <p className="text-white/40 text-sm mt-1">{users.length} registered users</p>
      </div>

      <div className="bg-noir-800 border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['ID', 'Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-white/5 animate-pulse rounded" /></td></tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30">No users</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3 text-white/40">#{u.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-white/60 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    {me?.role === 'admin' && u.id !== me?.id ? (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="bg-noir border border-white/10 text-xs px-2 py-1 text-white outline-none focus:border-gold/50"
                      >
                        <option value="customer">Customer</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[u.role] || ''}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {u.id !== me?.id && me?.role === 'admin' && (
                      <button onClick={() => handleDelete(u.id)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors px-2 py-1 border border-red-400/10 hover:border-red-400/30">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
