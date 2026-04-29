import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    setError('')
    try {
      const res = await authApi.register({ name: data.name, email: data.email, password: data.password })
      setAuth(res.data.user, res.data.token)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
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
          <h1 className="font-display text-2xl font-bold text-white mt-6 mb-2">Create Account</h1>
          <p className="text-white/40 text-sm">Join the ROGUE X community</p>
        </div>

        <div className="bg-noir-800 border border-white/5 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Full Name</label>
              <input
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
                placeholder="John Doe"
                className={inputClass}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Email</label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                    message: 'Please use a Gmail address (example@gmail.com)'
                  }
                })}
                type="email"
                placeholder="you@gmail.com"
                className={inputClass}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Password</label>
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                type="password"
                placeholder="••••••••"
                className={inputClass}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">Confirm Password</label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: val => val === watch('password') || 'Passwords do not match',
                })}
                type="password"
                placeholder="••••••••"
                className={inputClass}
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-white/40">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-gold hover:text-gold-light transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
