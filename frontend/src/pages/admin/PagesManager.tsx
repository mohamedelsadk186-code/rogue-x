import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { pagesApi, type CmsPage } from '../../api/pages'
import Button from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'

interface PageForm {
  title: string
  slug: string
  description: string
  content: string
  seo_title: string
  seo_description: string
  is_published: boolean
}

export default function PagesManager() {
  const { can } = useAuthStore()
  const [pages, setPages] = useState<CmsPage[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CmsPage | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PageForm>()
  const canCreate = can('pages.create')
  const canUpdate = can('pages.update')
  const canDelete = can('pages.delete')

  const load = () => {
    setLoading(true)
    pagesApi.adminList().then(r => setPages(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    reset({
      title: '',
      slug: '',
      description: '',
      content: '',
      seo_title: '',
      seo_description: '',
      is_published: false,
    })
    setModalOpen(true)
  }

  const openEdit = (p: CmsPage) => {
    setEditing(p)
    reset({
      title: p.title,
      slug: p.slug,
      description: p.description || '',
      content: p.content || '',
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
      is_published: p.is_published === 1,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: PageForm) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        // Backend booleans accept truthy flags; typings use SQLite integer-ish fields.
        is_published: data.is_published ? 1 : 0,
      }
      if (editing) await pagesApi.adminUpdate(editing.id, payload)
      else await pagesApi.adminCreate(payload)
      setModalOpen(false)
      load()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this page?')) return
    setDeletingId(id)
    try {
      await pagesApi.adminDelete(id)
      load()
    } finally {
      setDeletingId(null)
    }
  }

  const inputClass = useMemo(() => (
    'w-full bg-noir border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-gold/60 transition-colors placeholder-white/20'
  ), [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">CMS Pages</h1>
          <p className="text-white/40 text-sm mt-1">{pages.length} pages</p>
        </div>
        {canCreate && <Button onClick={openCreate}>New Page</Button>}
      </div>

      <div className="bg-noir-800 border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Slug', 'Title', 'Published', 'Updated', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-white/5 animate-pulse rounded" /></td></tr>
              ))
            ) : pages.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30">No pages yet</td></tr>
            ) : (
              pages.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3 text-white/60">{p.slug}</td>
                  <td className="px-4 py-3 text-white font-medium">{p.title}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 ${p.is_published ? 'bg-green-400/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {canUpdate && (
                        <button onClick={() => openEdit(p)} className="text-xs text-white/50 hover:text-white transition-colors px-2 py-1 border border-white/10 hover:border-white/30">Edit</button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="text-xs text-red-400/60 hover:text-red-400 transition-colors px-2 py-1 border border-red-400/10 hover:border-red-400/30">
                          {deletingId === p.id ? '...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
              className="bg-noir-800 border border-white/10 p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl font-bold text-white">{editing ? 'Edit Page' : 'Create Page'}</h2>
                <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Title</label>
                    <input {...register('title', { required: true })} className={inputClass} />
                    {errors.title && <p className="text-red-400 text-xs mt-1">Required</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Slug</label>
                    <input {...register('slug', { required: true })} className={inputClass} placeholder="about-us" />
                    {errors.slug && <p className="text-red-400 text-xs mt-1">Required</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Description</label>
                  <textarea {...register('description')} rows={2} className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Content</label>
                  <textarea {...register('content')} rows={10} className={inputClass} placeholder="Separate paragraphs with a blank line." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">SEO Title</label>
                    <input {...register('seo_title')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">SEO Description</label>
                    <input {...register('seo_description')} className={inputClass} />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input {...register('is_published')} type="checkbox" className="accent-gold w-4 h-4" />
                  <span className="text-sm text-white/70">Published (visible publicly)</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={saving} className="flex-1">{editing ? 'Save' : 'Create'}</Button>
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
