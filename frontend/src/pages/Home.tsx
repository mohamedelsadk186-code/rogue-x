import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productsApi, type Product } from '../api/products'
import { adminApi } from '../api/admin'
import ProductCard from '../components/ui/ProductCard'
import Button from '../components/ui/Button'

const categories = [
  { label: 'T-Shirts', slug: 't-shirts', image: 'https://picsum.photos/seed/cat-tee/800/600', desc: 'Essential luxury basics' },
  { label: 'Pants', slug: 'pants', image: 'https://picsum.photos/seed/cat-pants/800/600', desc: 'Tailored to perfection' },
  { label: 'Jackets', slug: 'jackets', image: 'https://picsum.photos/seed/cat-jacket/800/600', desc: 'Bold outerwear' },
  { label: 'Hoodies', slug: 'hoodies', image: 'https://picsum.photos/seed/cat-hoodie/800/600', desc: 'Premium comfort' },
]

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [banner, setBanner] = useState({
    title: 'ROGUE X',
    subtitle: 'Define Your Edge',
    description: "Premium men's clothing for the bold. Crafted for those who refuse to blend in.",
    cta_text: 'Shop Now',
    cta_link: '/category/t-shirts',
  })

  useEffect(() => {
    productsApi.getAll({ featured: '1' }).then(r => setFeaturedProducts(r.data.slice(0, 4)))
    adminApi.getHomepage().then(r => {
      if (r.data.banner) setBanner(r.data.banner)
    }).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-noir via-noir/90 to-noir" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://picsum.photos/seed/hero-rogue/1920/1080)' }}
        />
        {/* Animated gold lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div className="absolute bottom-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold text-xs tracking-[0.5em] uppercase mb-6 font-medium">
              {banner.subtitle}
            </p>
            <h1 className="font-display text-7xl sm:text-8xl md:text-9xl font-black text-white tracking-wider leading-none">
              {banner.title.split(' ').map((word, i) => (
                <span key={i}>
                  {i === 1 ? <span className="text-gold">{word}</span> : word}
                  {i < banner.title.split(' ').length - 1 ? ' ' : ''}
                </span>
              ))}
            </h1>
            <p className="mt-8 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
              {banner.description}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={banner.cta_link}>
                <Button size="lg">{banner.cta_text}</Button>
              </Link>
              <Link to="/category/jackets">
                <Button variant="outline" size="lg">View Jackets</Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-gold/60 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Curated Selection</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">Featured Pieces</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/category/t-shirts">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Category Grid */}
      <section className="py-24 bg-noir-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Collections</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">Shop by Category</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/category/${cat.slug}`} className="group block relative overflow-hidden aspect-[4/5]">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-xl font-bold text-white mb-1">{cat.label}</h3>
                    <p className="text-xs text-white/60 mb-3">{cat.desc}</p>
                    <span className="text-xs text-gold tracking-widest uppercase group-hover:text-gold-light transition-colors">
                      Shop Now →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="py-32 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-6">The ROGUE X Standard</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              "Wear it like you own the night."
            </h2>
            <div className="mt-8 w-16 h-px bg-gold mx-auto" />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
