'use client'

import { useState, useEffect } from 'react'
import { Download, Youtube, Zap, Shield, TrendingUp, ChevronRight, Loader2, AlertCircle, X, Crown, LayoutDashboard, History } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'


interface Comment {
  author: string
  text: string
  likes: number
  publishedAt: string
  replyCount: number
}

function parseVideoId(url: string): string | null {
  const patterns = [
    /(?:v=|\/)([\w-]{11})(?:\?|&|$)/,
    /youtu\.be\/([\w-]{11})/,
    /embed\/([\w-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function downloadCSV(comments: Comment[], videoId: string) {
  const headers = ['Author', 'Comment', 'Likes', 'Published At', 'Replies']
  const rows = comments.map(c => [
    `"${c.author.replace(/"/g, '""')}"`,
    `"${c.text.replace(/"/g, '""')}"`,
    c.likes,
    c.publishedAt,
    c.replyCount,
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `comments_${videoId}_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Premium Payment Modal (requires account creation) ───────────────────────
function PaymentModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'account' | 'payment'>('account')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateAccount = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) { setError('Please fill in all fields'); return }
    if (!email.includes('@')) { setError('Please enter a valid email'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      // Sign up or sign in
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError && !signUpError.message.includes('already registered')) throw signUpError
      if (signUpError?.message.includes('already registered')) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw new Error('Account exists — wrong password. Try signing in first.')
      }
      setStep('payment')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'CommentPull',
        description: 'Premium Monthly — ₹299/month',
        prefill: { name, email },
        theme: { color: '#dc2626' },
        handler: (response: any) => {
          window.location.href = `${window.location.origin}/success?payment_id=${response.razorpay_payment_id}`
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-[#111118] border border-white/10 rounded-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"><X size={20} /></button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center">
            <Crown className="text-amber-400" size={18} />
          </div>
          <div>
            <h2 className="font-black text-xl">Upgrade to Premium</h2>
            <p className="text-white/40 text-sm">₹299/month · Cancel anytime</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 mt-4">
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${step === 'account' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
            {step === 'account' ? '1' : '✓'} Create Account
          </div>
          <div className="flex-1 h-px bg-white/10" />
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${step === 'payment' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/30 border border-white/10'}`}>
            2 Pay ₹299/month
          </div>
        </div>

        {step === 'account' ? (
          <>
            {/* Benefits */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-5 space-y-1.5">
              {[
                '✅ Unlimited downloads per day',
                '✅ Up to 10,000 comments per video',
                '✅ Download history & dashboard',
                '✅ Pay via UPI, Card, NetBanking',
              ].map((b, i) => <p key={i} className="text-sm text-white/70">{b}</p>)}
            </div>

            <div className="space-y-3 mb-4">
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Create password (min 6 chars)"
                onKeyDown={e => e.key === 'Enter' && handleCreateAccount()}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors" />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <AlertCircle size={14} className="shrink-0" />{error}
              </div>
            )}

            <button onClick={handleCreateAccount} disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Continue to Payment →'}
            </button>

            <p className="text-white/25 text-xs text-center mt-3">
              Already have an account?{' '}
              <Link href="/login" onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors">Sign in here</Link>
            </p>
          </>
        ) : (
          <>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-5">
              <p className="text-green-400 font-semibold text-sm">✅ Account ready!</p>
              <p className="text-white/50 text-xs mt-1">Signed in as {email}</p>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">CommentPull Premium</span>
                <span className="font-black text-xl">₹299<span className="text-white/40 text-sm font-normal">/mo</span></span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <AlertCircle size={14} className="shrink-0" />{error}
              </div>
            )}

            <button onClick={handlePayment} disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
              {loading ? 'Opening payment...' : 'Pay ₹299/month via Razorpay'}
            </button>

            <p className="text-white/30 text-xs text-center mt-3">UPI · Cards · NetBanking · EMI</p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [url, setUrl] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoId, setVideoId] = useState('')
  const [fetched, setFetched] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) checkPremium(data.user.id)
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) checkPremium(session.user.id)
      else setIsPremium(false)
    })
  }, [])

  async function checkPremium(userId: string) {
    const { data } = await supabase
      .from('premium_users')
      .select('is_active')
      .eq('user_id', userId)
      .single()
    setIsPremium(data?.is_active || false)
  }

  const handleFetch = async () => {
    setError(''); setComments([]); setFetched(false)
    const vid = parseVideoId(url)
    if (!vid) { setError('Invalid YouTube URL. Please paste a valid link.'); return }
    setVideoId(vid); setLoading(true)
    try {
      const res = await fetch(`/api/comments?videoId=${vid}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch comments')
      setComments(data.comments); setFetched(true)
      // Save to history only if logged in
      if (user) {
        await supabase.from('downloads').insert({
          user_id: user.id,
          video_id: vid,
          comment_count: data.comments.length,
          created_at: new Date().toISOString(),
        })
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-800/8 blur-[100px] animate-pulse delay-1000" />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px'}} />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="border-b border-white/5 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Youtube size={16} /></div>
              <span className="font-bold text-lg tracking-tight">CommentPull</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/50">
              <a href="#features" className="hover:text-white transition-colors hidden md:block">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors hidden md:block">Pricing</a>
              {user ? (
                <>
                  {isPremium && (
                    <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold border border-amber-500/30 px-2 py-1 rounded-full">
                      <Crown size={10} />Premium
                    </span>
                  )}
                  <Link href="/dashboard"
                    className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                    <LayoutDashboard size={14} />Dashboard
                  </Link>
                </>
              ) : (
                <Link href="/login"
                  className="border border-white/20 hover:border-white/40 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                  Sign In
                </Link>
              )}
              <button onClick={() => setShowPayment(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5">
                <Crown size={13} />Go Premium
              </button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-6 pt-24 pb-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-full px-4 py-1.5 text-sm text-red-400 mb-6">
              <Zap size={12} />Free · No signup required · 3 downloads/day
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">
              Download YouTube<span className="block text-red-500">Comments Instantly</span>
            </h1>
            <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              Paste any YouTube URL and export all comments as CSV in seconds.
              Perfect for research, sentiment analysis, and content strategy.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFetch()}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors" />
                <button onClick={handleFetch} disabled={loading || !url.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {loading ? 'Fetching...' : 'Fetch Comments'}
                </button>
              </div>
              {error && (
                <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <AlertCircle size={14} />{error}
                </div>
              )}
              {/* Show login nudge for free users after fetch */}
              {fetched && !user && (
                <div className="mt-3 flex items-center justify-between bg-white/3 border border-white/8 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <History size={14} />
                    <span>Sign in to save your download history</span>
                  </div>
                  <Link href="/login" className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                    Sign in →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Results */}
        {fetched && comments.length > 0 && (
          <section className="px-6 pb-16">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{comments.length} Comments Found</h2>
                  <p className="text-white/40 text-sm">Video ID: {videoId}</p>
                </div>
                <button onClick={() => downloadCSV(comments, videoId)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm">
                  <Download size={14} />Download CSV
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-white/40 uppercase tracking-wider border-b border-white/5 font-medium">
                  <div className="col-span-3">Author</div>
                  <div className="col-span-6">Comment</div>
                  <div className="col-span-1 text-center">Likes</div>
                  <div className="col-span-2 text-right">Date</div>
                </div>
                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                  {comments.map((c, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-sm">
                      <div className="col-span-3 font-medium text-white/80 truncate">{c.author}</div>
                      <div className="col-span-6 text-white/60 line-clamp-2 leading-relaxed">{c.text}</div>
                      <div className="col-span-1 text-center text-white/40">{c.likes.toLocaleString()}</div>
                      <div className="col-span-2 text-right text-white/30 text-xs">
                        {new Date(c.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-amber-400">Want more than 100 comments?</p>
                  <p className="text-white/50 text-sm">Upgrade to Premium — fetch up to 10,000 comments per video</p>
                </div>
                <button onClick={() => setShowPayment(true)}
                  className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap">
                  Go Premium <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section id="features" className="px-6 py-24 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black tracking-tight text-center mb-3">Everything you need</h2>
            <p className="text-white/40 text-center mb-16">Built for creators, researchers, and marketers</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <Zap className="text-yellow-400" size={20} />, title: 'Blazing Fast', desc: 'Fetch 100 comments in under 3 seconds using YouTube Data API v3 with smart pagination.' },
                { icon: <Download className="text-green-400" size={20} />, title: 'CSV Export', desc: 'Download author, comment text, likes, date and reply count in clean spreadsheet format.' },
                { icon: <Shield className="text-blue-400" size={20} />, title: 'Secure & Private', desc: 'No comments stored on our servers. All data goes directly to your browser.' },
                { icon: <TrendingUp className="text-purple-400" size={20} />, title: 'Sentiment Ready', desc: 'Export structured data ready for Excel, Google Sheets, or Python analysis.' },
                { icon: <Youtube className="text-red-400" size={20} />, title: 'Any Public Video', desc: 'Works with any public YouTube video. Just paste the URL and go.' },
                { icon: <Crown className="text-amber-400" size={20} />, title: 'Premium Bulk', desc: 'Upgrade to export 10,000+ comments across multiple videos automatically.' },
              ].map((f, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-colors">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
                  <h3 className="font-bold mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-6 py-24 border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black tracking-tight mb-3">Simple Pricing</h2>
            <p className="text-white/40 mb-16">Start free, scale when you need</p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">

              {/* Free Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-left">
                <div className="text-2xl font-black mb-1">Free</div>
                <div className="text-white/40 text-sm mb-6">Forever · No signup needed</div>
                <div className="text-4xl font-black mb-8">₹0</div>
                <ul className="space-y-3 text-sm text-white/60 mb-8">
                  {[
                    '3 downloads/day',
                    '100 comments/video',
                    'CSV export',
                    'No account required',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>{f}
                    </li>
                  ))}
                  {/* Locked features */}
                  {[
                    'Download history',
                    'Dashboard access',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 opacity-40">
                      <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-xs">🔒</div>
                      <span className="line-through">{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => document.getElementById('hero-input')?.focus()}
                  className="w-full border border-white/20 hover:border-white/40 text-white py-3 rounded-xl font-semibold transition-colors">
                  Start for Free ↑
                </button>
              </div>

              {/* Premium Card */}
              <div className="bg-gradient-to-b from-red-900/30 to-red-950/20 border border-red-500/30 rounded-2xl p-8 text-left relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">POPULAR</div>
                <div className="text-2xl font-black mb-1">Premium</div>
                <div className="text-white/40 text-sm mb-6">With account · Cancel anytime</div>
                <div className="text-4xl font-black mb-1">₹299</div>
                <div className="text-white/30 text-sm mb-8">UPI · Cards · NetBanking</div>
                <ul className="space-y-3 text-sm text-white/80 mb-8">
                  {[
                    'Unlimited downloads/day',
                    '10,000 comments/video',
                    'Bulk video processing',
                    'Download history dashboard',
                    'Access all past downloads',
                    'Priority support',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500/30 flex items-center justify-center text-xs text-red-400">✓</div>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowPayment(true)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                  <Crown size={16} />Upgrade Now — ₹299/month
                </button>
                <p className="text-white/30 text-xs text-center mt-3">Account created during checkout</p>
              </div>

            </div>
          </div>
        </section>

        {/* AdSense Placeholder */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white/3 border border-dashed border-white/10 rounded-xl h-24 flex items-center justify-center text-white/20 text-sm">
            Google AdSense Ad Unit — 728×90 Leaderboard
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-10 mt-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center"><Youtube size={12} /></div>
              <span>CommentPull © 2025</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
