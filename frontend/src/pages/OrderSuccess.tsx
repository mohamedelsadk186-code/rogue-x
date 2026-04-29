import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'

export default function OrderSuccess() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md px-4"
      >
        <div className="w-20 h-20 border-2 border-gold rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-4xl font-bold text-white mb-4">Order Placed!</h1>
        <p className="text-white/50 mb-10 leading-relaxed">
          Thank you for your order. Your items will be carefully packaged and shipped within 2-3 business days.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
