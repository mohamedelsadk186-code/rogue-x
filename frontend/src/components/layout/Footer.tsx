import { Link } from 'react-router-dom'

const categories = [
  { label: 'T-Shirts', slug: 't-shirts' },
  { label: 'Pants', slug: 'pants' },
  { label: 'Jackets', slug: 'jackets' },
  { label: 'Hoodies', slug: 'hoodies' },
]

export default function Footer() {
  return (
    <footer className="bg-noir-800 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/">
              <span className="font-display text-3xl font-bold tracking-widest text-white">
                ROGUE <span className="text-gold">X</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/40 leading-relaxed">
              Premium men's clothing for the bold. Crafted for those who refuse to blend in.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold text-gold tracking-widest uppercase mb-4">Shop</h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.slug}>
                  <Link to={`/category/${cat.slug}`}
                    className="text-sm text-white/50 hover:text-white transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold text-gold tracking-widest uppercase mb-4">Support</h3>
            <ul className="space-y-2">
              {['FAQ', 'Shipping Info', 'Returns', 'Size Guide'].map(item => (
                <li key={item}>
                  <span className="text-sm text-white/50 cursor-pointer hover:text-white transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-semibold text-gold tracking-widest uppercase mb-4">Account</h3>
            <ul className="space-y-2">
              <li><Link to="/auth/login" className="text-sm text-white/50 hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/auth/register" className="text-sm text-white/50 hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/cart" className="text-sm text-white/50 hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-white/30">© 2024 ROGUE X. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {['Privacy Policy', 'Terms of Service'].map(item => (
              <span key={item} className="text-xs text-white/30 cursor-pointer hover:text-white/60 transition-colors">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
