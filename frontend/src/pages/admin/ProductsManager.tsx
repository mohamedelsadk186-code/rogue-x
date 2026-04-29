import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { productsApi, type Product } from '../../api/products'
import Button from '../../components/ui/Button'

interface ProductForm {
  name: string
  slug: string
  category: string
  price: number
  description: string
  image_url: string
  stock: number
  featured: boolean
}

const categories = ['t-shirts', 'pants', 'jackets', 'hoodies']

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [filterCat, setFilterCat] = useState('')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductForm>()

  const load = () => {
    setLoading(true)
    productsApi.getAll(filterCat ? { category: filterCat } : {}).then(r => setProducts(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterCat])

  const openAdd = () => {
    setEditing(null)
    reset({ category: 't-shirts', featured: false })
    setModalOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    reset({
      name: p.name, slug: p.slug, category: p.category, price: p.price,
      description: p.description, image_url: p.image_url, stock: p.stock, featured: p.featured === 1,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: ProductForm) => {
    setSaving(true)
    try {
      const payload = { ...data, price: Number(data.price), stock: Number(data.stock), sizes: ['S','M','L','XL','XXL'], featured: data.featured ? 1 : 0 }
      if (editing) await productsApi.update(editing.id, payload)
      else await productsApi.create(payload)
      setModalOpen(false)
      load()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    setDeletingId(id)
    try {
      await productsApi.delete(id)
      load()
    } finally {
      setDeletingId(null)
    }
  }

  const inputClass = "w-full bg-noir border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-gold/60 transition-colors placeholder-white/20"

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Products</h1>
          <p className="text-white/40 text-sm mt-1">{products.length} items</p>
        </div>
        <Button onClick={openAdd}>Add Product</Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilterCat('')} className={`px-4 py-1.5 text-xs border transition-all ${!filterCat ? 'border-gold bg-gold text-noir font-semibold' : 'border-white/20 text-white/50'}`}>All</button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} className={`px-4 py-1.5 text-xs border capitalize transition-all ${filterCat === c ? 'border-gold bg-gold text-noir font-semibold' : 'border-white/20 text-white/50 hover:border-white/40'}`}>{c}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-noir-800 border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Image', 'Name', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-white/5 animate-pulse rounded" /></td></tr>
              ))
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30">No products found</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3">
                    <img src={p.image_url} alt={p.name} className="w-10 h-14 object-cover" />
                  </td>
                  <td className="px-4 py-3 text-white font-medium max-w-[160px] truncate">{p.name}</td>
                  <td className="px-4 py-3 text-white/50 capitalize">{p.category}</td>
                  <td className="px-4 py-3 text-gold">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-white/60">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 ${p.featured ? 'bg-gold/10 text-gold' : 'text-white/20'}`}>
                      {p.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-white/50 hover:text-white transition-colors px-2 py-1 border border-white/10 hover:border-white/30">Edit</button>
                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="text-xs text-red-400/60 hover:text-red-400 transition-colors px-2 py-1 border border-red-400/10 hover:border-red-400/30">
                        {deletingId === p.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-noir/80 backdrop-blur-sm px-4"
            onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-noir-800 border border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl font-bold text-white">{editing ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Name</label>
                  <input {...register('name', { required: true })} className={inputClass} placeholder="Product name" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Slug</label>
                  <input {...register('slug', { required: true })} className={inputClass} placeholder="product-slug" />
                  {errors.slug && <p className="text-red-400 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Category</label>
                  <select {...register('category', { required: true })} className={inputClass}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Price</label>
                    <input {...register('price', { required: true, min: 0 })} type="number" step="0.01" className={inputClass} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Stock</label>
                    <input {...register('stock', { required: true, min: 0 })} type="number" className={inputClass} placeholder="100" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Image URL</label>
                  <input {...register('image_url', { required: true })} className={inputClass} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Description</label>
                  <textarea {...register('description', { required: true })} rows={3} className={inputClass} placeholder="Product description..." />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input {...register('featured')} type="checkbox" className="accent-gold w-4 h-4" />
                  <span className="text-sm text-white/70">Featured on homepage</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={saving} className="flex-1">{editing ? 'Save Changes' : 'Create Product'}</Button>
                  <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
