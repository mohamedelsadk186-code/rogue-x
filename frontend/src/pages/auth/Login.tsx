import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'
import { GoogleLogin } from '@react-oauth/google'

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
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID || ''

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

  useEffect(() => {
    if (!appleClientId) return
    const script = document.createElement('script')
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    script.async = true
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [appleClientId])

  const googleSuccess = async (credential?: string | null) => {
    if (!credential) {
      setError('Google credential missing')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authApi.googleOAuth(credential)
      setAuth(res.data.user, res.data.token)
      navigate(redirect)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const appleSignIn = async () => {
    if (!appleClientId) {
      setError('Apple Sign In is not configured (missing VITE_APPLE_CLIENT_ID)')
      return
    }
    const apple = (window as any).AppleID
    if (!apple?.auth?.signIn) {
      setError('Apple Sign In script not loaded yet. Try again in a moment.')
      return
    }

    try {
      setLoading(true)
      setError('')
      apple.auth.init({
        clientId: appleClientId,
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      })

      const response = await apple.auth.signIn()
      const identityToken = response.authorization?.id_token as string | undefined
      if (!identityToken) {
        setError('Apple did not return an identity token')
        return
      }
      const apiRes = await authApi.appleOAuth(identityToken)
      setAuth(apiRes.data.user, apiRes.data.token)
      navigate(redirect)
    } catch (err: any) {
      setError(err?.error || err.response?.data?.error || err.message || 'Apple authentication failed')
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

          <div className="mt-5 space-y-3">
            {googleClientId ? (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={(creds) => googleSuccess((creds as any).credential)}
                  onError={() => setError('Google authentication failed')}
                  theme="filled_black"
                  size="large"
                  width="100%"
                  text="continue_with"
                  shape="rectangular"
                  useOneTap={false}
                />
              </div>
            ) : (
              <div className="text-xs text-white/35 border border-white/10 px-3 py-3">
                Configure <span className="font-mono">VITE_GOOGLE_CLIENT_ID</span> + <span className="font-mono">GOOGLE_CLIENT_ID</span> on the backend to enable Google Sign-In.
              </div>
            )}

            <button
              type="button"
              disabled={loading || !appleClientId}
              onClick={() => appleSignIn()}
              className={`w-full border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition-colors py-2.5 text-sm ${!appleClientId ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Continue with Apple
            </button>
          </div>

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
