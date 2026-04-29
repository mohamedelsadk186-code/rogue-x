import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'

interface LoginForm {
  email: string
  password: string
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login(data)
      setAuth(res.data.user, res.data.token)
      navigate(redirect)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-noir-700 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors placeholder-white/20"

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/">
            <span className="font-display text-3xl font-bold tracking-widest text-white">
              ROGUE <span className="text-gold">X</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white mt-6 mb-2">Welcome Back</h1>
          <p className="text-white/40 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-noir-800 border border-white/5 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Email</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                placeholder="you@example.com"
                className={inputClass}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Password</label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                placeholder="••••••••"
                className={inputClass}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-white/40">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-gold hover:text-gold-light transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
