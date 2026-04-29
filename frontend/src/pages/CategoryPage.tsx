import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productsApi, type Product } from '../api/products'
import ProductCard from '../components/ui/ProductCard'

const categoryLabels: Record<string, string> = {
  't-shirts': 'T-Shirts',
  'pants': 'Pants',
  'jackets': 'Jackets',
  'hoodies': 'Hoodies',
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [selectedSize, setSelectedSize] = useState('')

  useEffect(() => {
    setLoading(true)
    const sortParam = sort === 'price_asc' ? 'price_asc' : sort === 'price_desc' ? 'price_desc' : undefined
    productsApi.getAll({ category: slug, sort: sortParam }).then(r => {
      setProducts(r.data)
    }).finally(() => setLoading(false))
  }, [slug, sort])

  const filtered = selectedSize
    ? products.filter(p => p.sizes.includes(selectedSize))
    : products

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-noir-800 border-b border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Collection</p>
            <h1 className="font-display text-5xl font-bold text-white">
              {categoryLabels[slug || ''] || slug}
            </h1>
            <p className="mt-3 text-white/40 text-sm">{filtered.length} items</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          {/* Size filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/40 tracking-widest uppercase mr-2">Size</span>
            {['', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-3 py-1 text-xs border transition-all ${
                  selectedSize === s
                    ? 'border-gold bg-gold text-noir font-semibold'
                    : 'border-white/20 text-white/50 hover:border-white/50'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 tracking-widest uppercase">Sort</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-noir-700 border border-white/10 text-white text-sm px-3 py-1.5 outline-none focus:border-gold/50 transition-colors"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-noir-700 rounded-sm" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-noir-700 rounded w-1/3" />
                  <div className="h-4 bg-noir-700 rounded w-2/3" />
                  <div className="h-4 bg-noir-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/30 text-lg">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
