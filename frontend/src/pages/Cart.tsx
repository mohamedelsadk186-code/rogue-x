import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'

export default function Cart() {
  const { items, removeItem, updateQuantity, total, count } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth/login?redirect=/checkout')
    } else {
      navigate('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">Your cart is empty</h2>
          <p className="text-white/40 mb-8">Discover our collection and add items to your cart</p>
          <Link to="/">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-white mb-2">Shopping Cart</h1>
          <p className="text-white/40 text-sm mb-10">{count()} item{count() !== 1 ? 's' : ''}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.product.id}-${item.size}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 bg-noir-800 border border-white/5 p-4"
                >
                  <Link to={`/product/${item.product.id}`}>
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-24 h-32 object-cover flex-shrink-0"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">{item.product.category}</p>
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="text-sm font-medium text-white hover:text-gold transition-colors mt-1">{item.product.name}</h3>
                        </Link>
                        <p className="text-xs text-white/40 mt-1">Size: <span className="text-white/70">{item.size}</span></p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-white/10">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="px-3 py-1.5 text-white/60 hover:text-white transition-colors"
                        >-</button>
                        <span className="px-4 py-1.5 text-sm font-medium text-white border-x border-white/10">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="px-3 py-1.5 text-white/60 hover:text-white transition-colors"
                        >+</button>
                      </div>
                      <p className="text-gold font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-noir-800 border border-white/5 p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-white mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-white/50 truncate mr-2">{item.product.name} × {item.quantity}</span>
                    <span className="text-white flex-shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white font-medium">${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-white/60">Shipping</span>
                  <span className="text-green-400 text-sm">Free</span>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-white/10">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-gold text-lg">${total().toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Link to="/" className="block text-center mt-4 text-xs text-white/30 hover:text-white/60 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
