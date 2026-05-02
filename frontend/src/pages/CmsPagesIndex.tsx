import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pagesApi, type CmsPage } from '../api/pages'

export default function CmsPagesIndex() {
  const [pages, setPages] = useState<CmsPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pagesApi.publicList().then(r => setPages(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <p className="text-xs text-gold tracking-[0.35em] uppercase mb-3">Explore</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Pages</h1>
        <p className="text-white/40 text-sm mt-2 max-w-xl">Stories, editorial, drops, campaigns — curated by your team.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pages.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-noir-800 border border-white/10 p-6"
            >
              <p className="text-xs text-white/30 uppercase tracking-widest">Editorial</p>
              <h2 className="font-display text-xl text-white mt-2">{p.title}</h2>
              {p.description && <p className="text-white/50 text-sm mt-3">{p.description}</p>}
              <div className="mt-6">
                <Link to={`/p/${p.slug}`} className="text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors">
                  Read →
                </Link>
              </div>
            </motion.article>
          ))}
          {pages.length === 0 && (
            <p className="text-white/35 text-sm">No published pages yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
