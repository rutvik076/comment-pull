'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Youtube, Mail, Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields'); return }
    if (!email.includes('@')) { setError('Please enter a valid email'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Please check your email to verify, then sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <Youtube size={18} />
            </div>
            <span className="font-black text-xl tracking-tight">CommentPull</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-white/40">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess('') }}
              className="text-red-400 hover:text-red-300 transition-colors font-medium">
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-red-500/50 transition-colors" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Min. 6 characters"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-11 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-red-500/50 transition-colors" />
                <button onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="mt-4 flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <CheckCircle size={14} className="shrink-0" />{success}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          {mode === 'signin' && (
            <p className="text-center mt-4 text-white/30 text-sm">
              <button className="hover:text-white/60 transition-colors">Forgot password?</button>
            </p>
          )}
        </div>

        {/* Back to home */}
        <p className="text-center mt-6 text-white/30 text-sm">
          <Link href="/" className="hover:text-white transition-colors">← Back to CommentPull</Link>
        </p>
      </div>
    </main>
  )
}
