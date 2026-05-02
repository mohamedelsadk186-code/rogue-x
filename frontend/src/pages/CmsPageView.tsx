import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pagesApi, type CmsPage } from '../api/pages'

export default function CmsPageView() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<CmsPage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    pagesApi.publicGet(slug).then(r => setPage(r.data)).finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-white/40">
        Page not found. <Link className="ml-2 text-gold" to="/pages">Browse pages</Link>
      </div>
    )
  }

  const paragraphs = (page.content || '')
    .split(/\n\s*\n/g)
    .map(p => p.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <nav className="flex items-center gap-2 text-xs text-white/30 mb-10">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to="/pages" className="hover:text-white transition-colors">Pages</Link>
        <span>/</span>
        <span className="text-white/60">{page.title}</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-xs text-gold tracking-[0.35em] uppercase mb-3">Story</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight">{page.title}</h1>

        {(page.seo_title || page.seo_description) && (
          <div className="mt-6 border border-white/10 bg-noir-800 p-4">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">SEO</p>
            {page.seo_title && <p className="text-sm text-white/70">{page.seo_title}</p>}
            {page.seo_description && <p className="text-sm text-white/50 mt-2">{page.seo_description}</p>}
          </div>
        )}

        {page.description && <p className="text-white/55 text-lg mt-8">{page.description}</p>}

        <div className="mt-10 space-y-5 text-white/70 leading-relaxed">
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
