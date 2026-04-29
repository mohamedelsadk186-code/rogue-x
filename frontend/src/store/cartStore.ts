import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../api/products'

export interface CartItem {
  product: Product
  quantity: number
  size: string
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, size: string, quantity?: number) => void
  removeItem: (productId: number, size: string) => void
  updateQuantity: (productId: number, size: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size, quantity = 1) => {
        const items = get().items
        const existing = items.find(i => i.product.id === product.id && i.size === size)
        if (existing) {
          set({ items: items.map(i =>
            i.product.id === product.id && i.size === size
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )})
        } else {
          set({ items: [...items, { product, size, quantity }] })
        }
      },
      removeItem: (productId, size) => {
        set({ items: get().items.filter(i => !(i.product.id === productId && i.size === size)) })
      },
      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }
        set({ items: get().items.map(i =>
          i.product.id === productId && i.size === size ? { ...i, quantity } : i
        )})
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'rogue_x_cart',
    }
  )
)
