import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productsApi, type Product } from '../api/products'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/ui/ProductCard'
import Button from '../components/ui/Button'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImage, setSelectedImage] = useState('')
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    setLoading(true)
    productsApi.getOne(id!).then(r => {
      setProduct(r.data)
      setSelectedImage(r.data.images?.[0] || r.data.image_url)
      setSelectedSize('')
      productsApi.getAll({ category: r.data.category }).then(related => {
        setRelated(related.data.filter(p => p.id !== r.data.id).slice(0, 4))
      })
    }).finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!selectedSize || !product) return
    addItem(product, selectedSize)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-white/40">
        Product not found. <Link to="/" className="ml-2 text-gold">Go home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/30 mb-10">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category}`} className="hover:text-white transition-colors capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-white/60">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="aspect-[3/4] overflow-hidden bg-noir-700"
          >
            <img
              src={selectedImage || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs text-gold tracking-[0.3em] uppercase mb-3">{product.category}</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
            <div className="flex items-end gap-3 mb-8">
              <p className="text-3xl font-semibold text-gold">${product.price.toFixed(2)}</p>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <p className="text-white/30 text-lg line-through">${product.compare_at_price.toFixed(2)}</p>
              )}
            </div>

            <div className="w-12 h-px bg-gold/40 mb-8" />

            <p className="text-white/60 leading-relaxed mb-10">{product.description}</p>

            {!!product.colors?.length && (
              <div className="mb-8">
                <p className="text-xs text-white/40 tracking-widest uppercase mb-3">Available Colors</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <span key={color} className="px-3 py-1 text-xs border border-white/15 text-white/70 capitalize">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div className="mb-8">
              <p className="text-xs text-white/40 tracking-widest uppercase mb-4">
                Select Size {!selectedSize && <span className="text-red-400 ml-1">*</span>}
              </p>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 border text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'border-gold bg-gold text-noir font-bold'
                        : 'border-white/20 text-white/60 hover:border-gold/50 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to cart */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!selectedSize || product.status === 'unavailable'}
              className="w-full sm:w-auto"
            >
              {product.status === 'unavailable' ? 'Currently Unavailable' : addedFeedback ? 'Added to Cart ✓' : 'Add to Cart'}
            </Button>

            {!selectedSize && (
              <p className="text-xs text-white/30 mt-3">Please select a size to continue</p>
            )}

            {/* Stock info */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-xs text-white/30">
                <span className={product.status === 'unavailable' ? 'text-red-400' : 'text-green-400'}>
                  {product.status === 'unavailable' ? 'Unavailable' : 'In Stock'}
                </span>{' '}
                · {product.stock} units available
              </p>
            </div>
          </motion.div>
        </div>

        {!!product.images?.length && (
          <div className="mt-5 flex gap-2 overflow-x-auto">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-20 border ${selectedImage === img ? 'border-gold' : 'border-white/15'}`}
              >
                <img src={img} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-8 h-px bg-gold" />
              <h2 className="font-display text-2xl font-bold text-white">You May Also Like</h2>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
