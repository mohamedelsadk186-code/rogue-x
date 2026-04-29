import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { ordersApi } from '../api/orders'
import { useCartStore } from '../store/cartStore'
import Button from '../components/ui/Button'

interface CheckoutForm {
  shipping_name: string
  shipping_address: string
  shipping_city: string
  shipping_country: string
  card_number: string
  card_expiry: string
  card_cvv: string
}

export default function Checkout() {
  const { items, total, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>()

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) return
    setLoading(true)
    setError('')
    try {
      await ordersApi.create({
        items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity, size: i.size })),
        shipping_name: data.shipping_name,
        shipping_address: data.shipping_address,
        shipping_city: data.shipping_city,
        shipping_country: data.shipping_country,
      })
      clearCart()
      navigate('/order-success')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Order failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-noir-700 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors placeholder-white/20"

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-white mb-10">Checkout</h1>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping */}
              <div className="bg-noir-800 border border-white/5 p-6">
                <h2 className="text-xs font-semibold text-gold tracking-widest uppercase mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Full Name</label>
                    <input
                      {...register('shipping_name', { required: 'Name is required' })}
                      placeholder="John Doe"
                      className={inputClass}
                    />
                    {errors.shipping_name && <p className="text-red-400 text-xs mt-1">{errors.shipping_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Address</label>
                    <input
                      {...register('shipping_address', { required: 'Address is required' })}
                      placeholder="123 Luxury Lane"
                      className={inputClass}
                    />
                    {errors.shipping_address && <p className="text-red-400 text-xs mt-1">{errors.shipping_address.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">City</label>
                      <input
                        {...register('shipping_city', { required: 'City is required' })}
                        placeholder="New York"
                        className={inputClass}
                      />
                      {errors.shipping_city && <p className="text-red-400 text-xs mt-1">{errors.shipping_city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Country</label>
                      <input
                        {...register('shipping_country', { required: 'Country is required' })}
                        placeholder="USA"
                        className={inputClass}
                      />
                      {errors.shipping_country && <p className="text-red-400 text-xs mt-1">{errors.shipping_country.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-noir-800 border border-white/5 p-6">
                <h2 className="text-xs font-semibold text-gold tracking-widest uppercase mb-6">Payment Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Card Number</label>
                    <input
                      {...register('card_number', { required: 'Card number is required' })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={inputClass}
                    />
                    {errors.card_number && <p className="text-red-400 text-xs mt-1">{errors.card_number.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Expiry</label>
                      <input
                        {...register('card_expiry', { required: 'Expiry is required' })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={inputClass}
                      />
                      {errors.card_expiry && <p className="text-red-400 text-xs mt-1">{errors.card_expiry.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">CVV</label>
                      <input
                        {...register('card_cvv', { required: 'CVV is required' })}
                        placeholder="123"
                        maxLength={4}
                        className={inputClass}
                      />
                      {errors.card_cvv && <p className="text-red-400 text-xs mt-1">{errors.card_cvv.message}</p>}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/20 mt-4">* Payment UI is for demonstration purposes only.</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-noir-800 border border-white/5 p-6 sticky top-24">
                <h2 className="font-display text-xl font-bold text-white mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                      <img src={item.product.image_url} alt={item.product.name} className="w-12 h-16 object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/70 truncate">{item.product.name}</p>
                        <p className="text-xs text-white/40">Size: {item.size} × {item.quantity}</p>
                        <p className="text-xs text-gold mt-1">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white">${total().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                    <span className="text-white">Total</span>
                    <span className="text-gold text-lg">${total().toFixed(2)}</span>
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full mt-6" loading={loading}>
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
