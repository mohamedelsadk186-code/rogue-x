import client from './client'

export interface OrderItem {
  product_id: number
  quantity: number
  size?: string
  price_at_purchase?: number
  name?: string
  image_url?: string
}

export interface Order {
  id: number
  user_id: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  shipping_name?: string
  shipping_address?: string
  shipping_city?: string
  shipping_country?: string
  created_at: string
  items?: OrderItem[]
  user_name?: string
  user_email?: string
}

export const ordersApi = {
  create: (data: {
    items: { product_id: number; quantity: number; size?: string }[]
    shipping_name: string
    shipping_address: string
    shipping_city: string
    shipping_country: string
  }) => client.post<Order>('/orders', data),
  getMyOrders: () => client.get<Order[]>('/orders'),
  getOne: (id: number) => client.get<Order>(`/orders/${id}`),
  getAllAdmin: () => client.get<Order[]>('/orders/admin/all'),
  updateStatus: (id: number, status: string) =>
    client.patch(`/orders/${id}/status`, { status }),
}
