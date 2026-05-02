import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { pagesApi, type CmsPage } from '../../api/pages'

const categories = [
  { label: 'T-Shirts', slug: 't-shirts' },
  { label: 'Pants', slug: 'pants' },
  { label: 'Jackets', slug: 'jackets' },
  { label: 'Hoodies', slug: 'hoodies' },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const cartCount = useCartStore(s => s.count())
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cmsPages, setCmsPages] = useState<CmsPage[]>([])

  useEffect(() => {
    pagesApi.publicList()
      .then(r => setCmsPages(r.data.slice(0, 6)))
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-noir/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-display text-2xl font-bold tracking-widest text-white">
              ROGUE <span className="text-gold">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="text-sm font-medium text-white/70 hover:text-gold transition-colors tracking-wider uppercase"
              >
                {cat.label}
              </Link>
            ))}

            <Link
              to="/pages"
              className="text-sm font-medium text-white/70 hover:text-gold transition-colors tracking-wider uppercase"
            >
              Pages
            </Link>

            {cmsPages.slice(0, 3).map(p => (
              <Link
                key={p.id}
                to={`/p/${p.slug}`}
                className="text-sm font-medium text-white/55 hover:text-gold transition-colors tracking-wider uppercase"
              >
                {p.title}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-white/70 hover:text-gold transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-noir text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-white/70 hover:text-gold transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-noir-700 border border-white/10 rounded-sm shadow-xl"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-white/50 truncate">{user.email}</p>
                      </div>
                      {(user.role === 'admin' || user.role === 'manager') && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gold hover:bg-white/5 transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="text-sm font-medium text-white/70 hover:text-gold transition-colors tracking-wider"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 bg-noir-800 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-white/70 hover:text-gold transition-colors tracking-wider uppercase"
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                to="/pages"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-white/70 hover:text-gold transition-colors tracking-wider uppercase"
              >
                Pages
              </Link>

              {cmsPages.map(p => (
                <Link
                  key={`m-${p.id}`}
                  to={`/p/${p.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-white/60 hover:text-gold transition-colors tracking-wider"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
