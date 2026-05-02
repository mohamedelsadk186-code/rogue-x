import { useMemo, useState } from 'react'
import { adminApi } from '../../api/admin'
import Button from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const { can } = useAuthStore()
  const allowed = useMemo(() => can('dashboard.view'), [can])

  const ask = async () => {
    if (!allowed) return
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const res = await adminApi.askAssistant(prompt)
      setAnswer(res.data.answer)
    } catch (err: any) {
      setAnswer(err.response?.data?.error || 'Assistant failed to generate a response')
    } finally {
      setLoading(false)
    }
  }

  if (!allowed) {
    return (
      <div className="p-8">
        <h1 className="font-display text-3xl font-bold text-white">AI Store Assistant</h1>
        <p className="text-white/45 text-sm mt-2">You do not have permission to use analytics tools.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">AI Store Assistant</h1>
        <p className="text-white/40 text-sm mt-1">Get insights, suggestions, and action plans for your store.</p>
      </div>

      <div className="bg-noir-800 border border-white/5 p-5">
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Ask the assistant</label>
        <textarea
          rows={4}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Example: Analyze my sales and tell me what to improve this week."
          className="w-full bg-noir border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-gold/60 transition-colors placeholder-white/20"
        />
        <div className="mt-4">
          <Button onClick={ask} loading={loading}>Generate Recommendation</Button>
        </div>
      </div>

      <div className="mt-6 bg-noir-800 border border-white/5 p-5 min-h-[220px]">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Assistant Response</p>
        {answer ? (
          <pre className="whitespace-pre-wrap text-sm text-white/80 font-body">{answer}</pre>
        ) : (
          <p className="text-white/35 text-sm">No response yet. Ask a question to get started.</p>
        )}
      </div>
    </div>
  )
}
