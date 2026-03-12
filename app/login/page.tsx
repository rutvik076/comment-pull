'use client'

import { useState, useEffect } from 'react'
import { Youtube, Loader2, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('sb_user')
      const sessionStr = localStorage.getItem('sb_session')
      if (userStr && sessionStr) {
        const u = JSON.parse(userStr)
        const s = JSON.parse(sessionStr)
        if (u?.id && s?.access_token) {
          const returnTo = sessionStorage.getItem('returnTo') || '/'
          sessionStorage.removeItem('returnTo')
          router.replace(returnTo)
          return
        }
      }
    } catch { /* ignore */ }

    const urlError = searchParams.get('error')
    if (urlError) setError(decodeURIComponent(urlError))
  }, [])

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    const timeout = setTimeout(() => {
      setGoogleLoading(false)
      setError('Google sign in timed out. Please try again.')
    }, 10000)
    try {
      const isLocal = window.location.hostname === 'localhost'
      const res = await fetch('/api/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocal }),
      })
      const data = await res.json()
      clearTimeout(timeout)
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to get Google sign in URL')
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No sign in URL returned. Please try again.')
      }
    } catch (e: any) {
      clearTimeout(timeout)
      setError(e.message || 'Failed to start Google sign in')
      setGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#080810] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize:'32px 32px'}} />
      </div>

      <div className="relative z-10 w-full max-w-[420px] py-8">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <Youtube size={20} />
          </div>
          <span className="font-black text-2xl tracking-tight">CommentPull</span>
        </Link>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-tight mb-2">Welcome to CommentPull</h1>
            <p className="text-white/40 text-sm">Sign in to download YouTube comments</p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60 py-4 rounded-2xl font-bold transition-all text-sm shadow-sm"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {googleLoading ? 'Opening Google...' : 'Continue with Google'}
          </button>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-2xl px-4 py-3">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
            </div>
          )}

          {/* Features */}
          <div className="mt-8 space-y-2.5">
            {[
              '5 free downloads/day — no credit card',
              'Download any YouTube video comments as CSV',
              'Track your download history in dashboard',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-white/50 text-sm">
                <CheckCircle size={14} className="text-green-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-white/20 text-xs">
          <span className="flex items-center gap-1"><Shield size={11} />Secure</span>
          <span className="flex items-center gap-1"><CheckCircle size={11} />No spam</span>
        </div>
        <p className="text-center mt-4 text-white/20 text-xs">
          <Link href="/" className="hover:text-white/50 transition-colors">← Back to CommentPull</Link>
        </p>
      </div>
    </main>
  )
}
