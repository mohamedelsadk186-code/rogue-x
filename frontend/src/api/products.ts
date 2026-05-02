import client from './client'

export interface Product {
  id: number
  name: string
  slug: string
  category: 'T-shirts' | 'pants' | 'jackets' | 'hoodies' | string
  price: number
  compare_at_price?: number | null
  description: string
  image_url: string
  images?: string[]
  sizes: string[]
  colors?: string[]
  stock: number
  status?: 'available' | 'unavailable'
  featured: number
  created_at: string
}

export const productsApi = {
  getAll: (params?: { category?: string; search?: string; sort?: string; featured?: string }) =>
    client.get<Product[]>('/products', { params }),
  getOne: (id: number | string) => client.get<Product>(`/products/${id}`),
  create: (data: Partial<Product>) => client.post<Product>('/products', data),
  update: (id: number, data: Partial<Product>) => client.put<Product>(`/products/${id}`, data),
  delete: (id: number) => client.delete(`/products/${id}`),
}
