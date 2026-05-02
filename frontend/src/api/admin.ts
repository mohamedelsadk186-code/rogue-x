import client from './client'
import type { User } from './auth'

export const adminApi = {
  getStats: () =>
    client.get<{
      totalUsers: number
      totalOrders: number
      totalRevenue: number
      pendingOrders: number
      totalProducts: number
      recentOrders: any[]
    }>('/admin/stats'),
  getHomepage: () => client.get<{ banner: any; featured_products: number[] }>('/admin/homepage'),
  updateHomepage: (data: { banner?: any; featured_products?: number[] }) =>
    client.patch('/admin/homepage', data),
  getUsers: () => client.get<User[]>('/users'),
  updateUserRole: (id: number, role: string) =>
    client.patch(`/users/${id}/role`, { role }),
  deleteUser: (id: number) => client.delete(`/users/${id}`),
  getUserPermissionsMatrix: (id: number) =>
    client.get<{ permissions: string[]; available: string[] }>(`/users/${id}/permissions`),
  updateUserPermissionsMatrix: (id: number, permissions: string[]) =>
    client.put(`/users/${id}/permissions`, { permissions }),
  refreshMyPermissions: () => client.get<{ permissions: string[] }>('/admin/me/permissions'),
  askAssistant: (prompt: string) =>
    client.post<{ answer: string }>('/admin/assistant', { prompt }),
}
