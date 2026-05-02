import { useEffect, useMemo, useState } from 'react'
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
  const { user: me, can } = useAuthStore()
  const canUpdateRoles = useMemo(() => can('users.updateRole'), [can])
  const canRemoveUsers = useMemo(() => can('users.delete'), [can])
  const canReadUsers = useMemo(() => can('users.read'), [can])

  const [matrixOpen, setMatrixOpen] = useState(false)
  const [matrixUser, setMatrixUser] = useState<User | null>(null)
  const [availablePerms, setAvailablePerms] = useState<string[]>([])
  const [selectedPerms, setSelectedPerms] = useState<Record<string, boolean>>({})

  const load = () => {
    setLoading(true)
    adminApi.getUsers().then(r => setUsers(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openPermissionsMatrix = async (u: User) => {
    if (!canUpdateRoles) return
    if (u.role !== 'manager') {
      alert('Managers can be assigned fine-grained permissions. Admins have full access.')
      return
    }
    setMatrixUser(u)
    setMatrixOpen(true)
    try {
      const res = await adminApi.getUserPermissionsMatrix(u.id)
      const next: Record<string, boolean> = {}
      res.data.available.forEach((p) => { next[p] = false })
      res.data.permissions.forEach((p) => { next[p] = true })
      setAvailablePerms(res.data.available)
      setSelectedPerms(next)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to load permission matrix')
    }
  }

  const togglePerm = (p: string) => {
    setSelectedPerms(prev => ({ ...prev, [p]: !prev[p] }))
  }

  const saveMatrix = async () => {
    if (!matrixUser) return
    try {
      const permissions = Object.entries(selectedPerms).filter(([, v]) => v).map(([k]) => k)
      await adminApi.updateUserPermissionsMatrix(matrixUser.id, permissions)
      await load()

      if (matrixUser.id === me?.id && me.role === 'manager') {
        const mePermsRes = await adminApi.refreshMyPermissions()
        useAuthStore.getState().setUserPermissions(mePermsRes.data.permissions)
      }

      setMatrixOpen(false)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save permissions')
    }
  }

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

  if (!canReadUsers) {
    return (
      <div className="p-8">
        <h1 className="font-display text-3xl font-bold text-white">Users</h1>
        <p className="text-white/45 text-sm mt-2">You do not have permission to manage users.</p>
      </div>
    )
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
                    {canUpdateRoles && me?.role === 'admin' && u.id !== me?.id ? (
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
                    <div className="flex flex-wrap gap-2">
                      {u.role === 'manager' && (
                        <button
                          disabled={!canUpdateRoles}
                          onClick={() => openPermissionsMatrix(u)}
                          className={`text-xs px-2 py-1 border transition-colors ${canUpdateRoles ? 'text-white/50 hover:text-white border-white/10 hover:border-white/30' : 'text-white/20 border-white/5 cursor-not-allowed'}`}
                        >
                          Permissions
                        </button>
                      )}

                      {u.id !== me?.id && canRemoveUsers && (
                        <button onClick={() => handleDelete(u.id)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors px-2 py-1 border border-red-400/10 hover:border-red-400/30">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {matrixOpen && matrixUser && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-noir/80 backdrop-blur-sm px-4"
          onClick={e => { if (e.target === e.currentTarget) setMatrixOpen(false) }}
        >
          <div className="bg-noir-800 border border-white/10 p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-white">Permissions</h2>
                <p className="text-xs text-white/35 mt-1">{matrixUser.name} · <span className="text-white/55">{matrixUser.email}</span></p>
              </div>
              <button onClick={() => setMatrixOpen(false)} className="text-white/45 hover:text-white">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
              {availablePerms.map(p => (
                <label key={p} className="flex items-center gap-2 border border-white/10 px-3 py-2 text-xs text-white/70 hover:border-white/20 cursor-pointer">
                  <input type="checkbox" checked={!!selectedPerms[p]} onChange={() => togglePerm(p)} />
                  <span className="font-mono">{p}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={saveMatrix} className="px-4 py-2 text-xs uppercase tracking-widest bg-gold text-noir font-semibold hover:bg-gold-light transition-colors">Save Permissions</button>
              <button onClick={() => setMatrixOpen(false)} className="px-4 py-2 text-xs uppercase tracking-widest border border-white/15 text-white/70 hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
