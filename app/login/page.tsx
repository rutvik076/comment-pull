'use client'

import { useState, useRef, useEffect } from 'react'
import { Youtube, Mail, Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft, Shield, Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Step = 'email' | 'otp' | 'password' | 'signin'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  // Check if already logged in + show URL errors
  useEffect(() => {
    const user = localStorage.getItem('sb_user')
    if (user) router.replace('/')
    const urlError = searchParams.get('error')
    if (urlError) setError(decodeURIComponent(urlError))
  }, [])

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  // Google OAuth — must run CLIENT-SIDE so Supabase can store PKCE verifier in localStorage
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')

    // Safety: always reset after 8 seconds if something hangs
    const timeout = setTimeout(() => {
      setGoogleLoading(false)
      setError('Google sign in timed out. Please try again.')
    }, 8000)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('App configuration missing. Please contact support.')
      }

      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      clearTimeout(timeout)

      if (error) throw error

      if (data?.url) {
        window.location.href = data.url
        // Keep loading state — page is navigating away
      } else {
        throw new Error('Google sign in unavailable. Check Supabase Google provider is enabled.')
      }
    } catch (e: any) {
      clearTimeout(timeout)
      setError(e.message || 'Failed to start Google sign in')
      setGoogleLoading(false)
    }
  }

  const handleSendOTP = async () => {
    setError('')
    if (!validateEmail(email)) { setError('Please enter a valid email address'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep('otp'); setResendTimer(60); setSuccess(`Code sent to ${email}`)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleVerifyOTP = async () => {
    setError('')
    const otpString = otp.join('')
    if (otpString.length !== 6) { setError('Please enter the complete 6-digit code'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp: otpString, action: 'verify' }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep('password'); setSuccess('')
    } catch (e: any) {
      setError(e.message)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    }
    finally { setLoading(false) }
  }

  const handleCreateAccount = async () => {
    setError('')
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const otpString = otp.join('')
      const res = await fetch('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp: otpString, password, name, action: 'create' }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const signInRes = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'signin', email, password }) })
      const signInData = await signInRes.json()

      if (signInData.user) {
        localStorage.setItem('sb_user', JSON.stringify(signInData.user))
        localStorage.setItem('sb_session', JSON.stringify(signInData.session || { access_token: `local_${signInData.user.id}` }))
        router.push('/')
      } else {
        setMode('signin'); setStep('signin')
        setError('Account created! Please sign in.')
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleSignIn = async () => {
    setError('')
    if (!validateEmail(email)) { setError('Please enter a valid email'); return }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'signin', email, password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.user) {
        localStorage.setItem('sb_user', JSON.stringify(data.user))
        // Use real session if available, otherwise local fallback
        const sessionToStore = data.session || { access_token: `local_${data.user.id}`, user: data.user }
        localStorage.setItem('sb_session', JSON.stringify(sessionToStore))
        router.push('/')
      } else {
        throw new Error(data.error || 'Sign in failed. Please try again.')
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').split('').slice(0, 6)
      const newOtp = [...otp]
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d })
      setOtp(newOtp)
      otpRefs.current[Math.min(index + digits.length, 5)]?.focus()
      return
    }
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus()
    if (e.key === 'Enter') handleVerifyOTP()
  }

  const switchMode = () => {
    setMode(m => m === 'signup' ? 'signin' : 'signup')
    setStep(mode === 'signup' ? 'signin' : 'email')
    setError(''); setSuccess(''); setOtp(['','','','','','']); setEmail(''); setPassword(''); setName('')
  }

  // Google button (shared)
  const GoogleBtn = () => (
    <button onClick={handleGoogleLogin} disabled={googleLoading}
      className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60 py-3.5 rounded-2xl font-semibold transition-all text-sm shadow-sm">
      {googleLoading ? <Loader2 size={16} className="animate-spin" /> : (
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
      )}
      {googleLoading ? 'Opening Google...' : 'Continue with Google'}
    </button>
  )

  return (
    <main className="min-h-screen bg-[#080810] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize:'32px 32px'}} />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <Youtube size={20} />
          </div>
          <span className="font-black text-2xl tracking-tight">CommentPull</span>
        </Link>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">

          {/* SIGNUP: EMAIL */}
          {mode === 'signup' && step === 'email' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight mb-1.5">Create your account</h1>
                <p className="text-white/40 text-sm">Free plan · 5 downloads/day · No credit card</p>
              </div>
              <GoogleBtn />
              <div className="flex items-center gap-3 my-5 text-xs text-white/25">
                <div className="flex-1 h-px bg-white/8" /><span>or sign up with email</span><div className="flex-1 h-px bg-white/8" />
              </div>
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Sharma"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/60 transition-all text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendOTP()} placeholder="you@gmail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/60 transition-all text-sm" />
                  </div>
                </div>
              </div>
              {error && <ErrBox msg={error} />}
              <button onClick={handleSendOTP} disabled={loading}
                className="w-full mt-5 bg-red-600 hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 text-white py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {loading ? 'Sending code...' : 'Send Verification Code'}
              </button>
              <button onClick={switchMode} className="w-full mt-4 text-sm text-white/50 hover:text-white transition-colors py-2">
                Already have an account? <span className="text-red-400 font-semibold">Sign in</span>
              </button>
            </>
          )}

          {/* SIGNUP: OTP */}
          {mode === 'signup' && step === 'otp' && (
            <>
              <button onClick={() => { setStep('email'); setError('') }} className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft size={14} />Back
              </button>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-green-400" size={24} />
                </div>
                <h1 className="text-2xl font-black tracking-tight mb-2">Check your email</h1>
                <p className="text-white/40 text-sm">6-digit code sent to <span className="text-white font-semibold">{email}</span></p>
              </div>
              <div className="flex gap-2.5 justify-center mb-5">
                {otp.map((digit, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={6} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} onFocus={e => e.target.select()}
                    className={`w-12 h-14 text-center text-xl font-black bg-white/5 border-2 rounded-2xl text-white focus:outline-none transition-all ${digit ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 focus:border-red-500/40'}`} />
                ))}
              </div>
              {success && <OkBox msg={success} />}
              {error && <ErrBox msg={error} />}
              <button onClick={handleVerifyOTP} disabled={loading || otp.join('').length !== 6}
                className="w-full mt-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 active:scale-[0.98] text-white py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <div className="text-center mt-4">
                {resendTimer > 0
                  ? <p className="text-white/30 text-sm">Resend in <span className="font-mono">{resendTimer}s</span></p>
                  : <button onClick={handleSendOTP} className="text-red-400 text-sm font-medium">Resend code</button>}
              </div>
            </>
          )}

          {/* SIGNUP: PASSWORD */}
          {mode === 'signup' && step === 'password' && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-400" size={24} />
                </div>
                <h1 className="text-2xl font-black tracking-tight mb-2">Email verified ✅</h1>
                <p className="text-white/40 text-sm">Set a password to secure your account</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Create Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateAccount()} placeholder="Min. 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-12 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/60 transition-all text-sm" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${password.length >= i*3 ? i<=2?'bg-red-500':i===3?'bg-yellow-500':'bg-green-500' : 'bg-white/10'}`} />
                    ))}
                  </div>
                )}
              </div>
              {error && <ErrBox msg={error} />}
              <button onClick={handleCreateAccount} disabled={loading}
                className="w-full mt-5 bg-red-600 hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 text-white py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading ? 'Creating account...' : 'Create Account & Continue'}
              </button>
            </>
          )}

          {/* SIGN IN */}
          {mode === 'signin' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight mb-1.5">Welcome back</h1>
                <p className="text-white/40 text-sm">Sign in to access your account</p>
              </div>
              <GoogleBtn />
              <div className="flex items-center gap-3 my-5 text-xs text-white/25">
                <div className="flex-1 h-px bg-white/8" /><span>or sign in with email</span><div className="flex-1 h-px bg-white/8" />
              </div>
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignIn()} placeholder="you@gmail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/60 transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignIn()} placeholder="Your password"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-12 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/60 transition-all text-sm" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <ErrBox msg={error} />}
              <button onClick={handleSignIn} disabled={loading}
                className="w-full mt-5 bg-red-600 hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 text-white py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <button onClick={switchMode} className="w-full mt-4 text-sm text-white/50 hover:text-white transition-colors py-2">
                New to CommentPull? <span className="text-red-400 font-semibold">Create account</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-white/20 text-xs">
          <span className="flex items-center gap-1"><Shield size={11} />Secure</span>
          <span className="flex items-center gap-1"><CheckCircle size={11} />No spam</span>
          <span className="flex items-center gap-1"><Mail size={11} />Real email only</span>
        </div>
        <p className="text-center mt-4 text-white/20 text-xs">
          <Link href="/" className="hover:text-white/50 transition-colors">← Back to CommentPull</Link>
        </p>
      </div>
    </main>
  )
}

function ErrBox({ msg }: { msg: string }) {
  return <div className="mt-4 flex items-start gap-2.5 text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-2xl px-4 py-3"><AlertCircle size={15} className="shrink-0 mt-0.5" />{msg}</div>
}
function OkBox({ msg }: { msg: string }) {
  return <div className="mb-4 flex items-start gap-2.5 text-green-400 text-sm bg-green-500/8 border border-green-500/15 rounded-2xl px-4 py-3"><CheckCircle size={15} className="shrink-0 mt-0.5" />{msg}</div>
}
