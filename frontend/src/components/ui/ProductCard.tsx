import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Product } from '../../api/products'

interface Props {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden bg-noir-700 aspect-[3/4]">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.featured === 1 && (
            <div className="absolute top-3 left-3">
              <span className="text-xs font-semibold tracking-widest text-noir bg-gold px-2 py-1 uppercase">
                Featured
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/20 transition-colors duration-300" />
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs text-white/40 tracking-widest uppercase">{product.category}</p>
          <h3 className="text-sm font-medium text-white group-hover:text-gold transition-colors">{product.name}</h3>
          <p className="text-sm font-semibold text-gold">${product.price.toFixed(2)}</p>
        </div>
      </Link>
    </motion.div>
  )
}
