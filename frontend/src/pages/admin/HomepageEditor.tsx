import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { adminApi } from '../../api/admin'
import { productsApi, type Product } from '../../api/products'
import Button from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'

interface BannerForm {
  title: string
  subtitle: string
  description: string
  cta_text: string
  cta_link: string
}

export default function HomepageEditor() {
  const { can } = useAuthStore()
  const canRead = useMemo(() => can('homepage.read'), [can])
  const canWrite = useMemo(() => can('homepage.update'), [can])

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [featuredIds, setFeaturedIds] = useState<number[]>([])
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset } = useForm<BannerForm>()

  useEffect(() => {
    if (!canRead) {
      setLoading(false)
      return
    }

    Promise.all([
      adminApi.getHomepage(),
      productsApi.getAll(),
    ]).then(([hpRes, prodRes]) => {
      if (hpRes.data.banner) reset(hpRes.data.banner)
      setFeaturedIds(hpRes.data.featured_products || [])
      setProducts(prodRes.data)
    }).finally(() => setLoading(false))
  }, [canRead])

  const toggleFeatured = (id: number) => {
    setFeaturedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 8)
    )
  }

  const onSubmit = async (data: BannerForm) => {
    if (!canWrite) {
      alert('Missing permission to update homepage')
      return
    }
    setSaving(true)
    try {
      await adminApi.updateHomepage({ banner: data, featured_products: featuredIds })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full bg-noir border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-gold/60 transition-colors placeholder-white/20"

  if (!canRead) {
    return (
      <div className="p-8">
        <h1 className="font-display text-3xl font-bold text-white">Homepage Editor</h1>
        <p className="text-white/45 text-sm mt-2">You do not have permission to view homepage settings.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="p-8"><div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Homepage Editor</h1>
        <p className="text-white/40 text-sm mt-1">Customize your homepage content</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 max-w-2xl ${!canWrite ? 'opacity-60' : ''}`}>
        {/* Banner settings */}
        <div className="bg-noir-800 border border-white/5 p-6">
          <h2 className="text-xs font-semibold text-gold tracking-widest uppercase mb-6">Hero Banner</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Title</label>
              <input {...register('title')} disabled={!canWrite} className={inputClass} placeholder="ROGUE X" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Subtitle</label>
              <input {...register('subtitle')} disabled={!canWrite} className={inputClass} placeholder="Define Your Edge" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Description</label>
              <textarea {...register('description')} disabled={!canWrite} rows={3} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">CTA Text</label>
                <input {...register('cta_text')} disabled={!canWrite} className={inputClass} placeholder="Shop Now" />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">CTA Link</label>
                <input {...register('cta_link')} disabled={!canWrite} className={inputClass} placeholder="/category/t-shirts" />
              </div>
            </div>
          </div>
        </div>

        {/* Featured products */}
        <div className="bg-noir-800 border border-white/5 p-6">
          <h2 className="text-xs font-semibold text-gold tracking-widest uppercase mb-2">Featured Products</h2>
          <p className="text-xs text-white/30 mb-6">Select up to 8 products to feature on homepage. {featuredIds.length} selected.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {products.map(p => (
              <button
                key={p.id}
                type="button"
                disabled={!canWrite}
                onClick={() => toggleFeatured(p.id)}
                className={`flex items-center gap-2 p-2 border text-left transition-all ${
                  featuredIds.includes(p.id)
                    ? 'border-gold bg-gold/5'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img src={p.image_url} alt={p.name} className="w-10 h-14 object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white truncate">{p.name}</p>
                  <p className="text-xs text-gold">${p.price}</p>
                  {featuredIds.includes(p.id) && (
                    <p className="text-xs text-gold/70 mt-0.5">✓ Featured</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" size="lg" loading={saving} disabled={!canWrite}>Save Changes</Button>
          {saved && <span className="text-green-400 text-sm">Changes saved!</span>}
          {!canWrite && <span className="text-white/35 text-xs">Read-only mode</span>}
        </div>
      </form>
    </div>
  )
}
