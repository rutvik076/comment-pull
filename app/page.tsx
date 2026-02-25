'use client'

import { useState, useEffect } from 'react'
import { Download, Youtube, Zap, Shield, TrendingUp, ChevronRight, Loader2, AlertCircle, X, Crown, LayoutDashboard, Lock, Code2, History, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Comment {
  id?: string
  author: string
  text: string
  likes: number
  publishedAt: string
  replyCount: number
  isReply?: boolean
}

function parseVideoId(url: string): string | null {
  const patterns = [/(?:v=|\/)([\w-]{11})(?:\?|&|$)/, /youtu\.be\/([\w-]{11})/, /embed\/([\w-]{11})/]
  for (const p of patterns) { const m = url.match(p); if (m) return m[1] }
  return null
}

function triggerCSVDownload(comments: Comment[], videoId: string) {
  const headers = ['Type', 'Author', 'Comment', 'Likes', 'Published At', 'Replies']
  const rows = comments.map(c => [
    c.isReply ? 'Reply' : 'Comment',
    `"${c.author.replace(/"/g, '""')}"`,
    `"${c.text.replace(/"/g, '""')}"`,
    c.likes, c.publishedAt, c.replyCount,
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `comments_${videoId}_${Date.now()}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────
function UpgradeModal({ onClose, user }: { onClose: () => void; user: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    if (!user) { window.location.href = '/login'; return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'CommentPull Premium',
        description: '₹299/month · Cancel anytime',
        prefill: { email: user.email },
        theme: { color: '#dc2626' },
        handler: (response: any) => {
          window.location.href = `/success?payment_id=${response.razorpay_payment_id}`
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch (e: any) { setError(e.message); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-[#0f0f1a] border border-white/10 rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center">
            <Crown className="text-amber-400" size={22} />
          </div>
          <div>
            <h2 className="font-black text-xl tracking-tight">Upgrade to Premium</h2>
            <p className="text-white/40 text-sm">₹299/month · Cancel anytime</p>
          </div>
        </div>

        <div className="space-y-2.5 mb-7">
          {[
            { icon: '⚡', text: 'Unlimited downloads per day' },
            { icon: '📊', text: '10,000 comments per video' },
            { icon: '📂', text: 'Full download history & dashboard' },
            { icon: '🔌', text: 'API access for organizations' },
            { icon: '💳', text: 'Pay via UPI · Cards · NetBanking' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/3 rounded-xl px-4 py-2.5">
              <span className="text-lg">{b.icon}</span>
              <span className="text-sm text-white/80">{b.text}</span>
            </div>
          ))}
        </div>

        {error && <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex gap-2 items-center"><AlertCircle size={14} />{error}</div>}

        {user ? (
          <button onClick={handlePayment} disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Crown size={18} />}
            {loading ? 'Opening payment...' : 'Upgrade Now — ₹299/mo'}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-white/50 text-sm text-center">Create a free account first, then upgrade</p>
            <Link href="/login" onClick={onClose}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2">
              Create Account → Upgrade
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Login Gate (shown when user not logged in) ───────────────────────────────
function LoginGate() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="text-white/40" size={28} />
          </div>
          <h3 className="text-2xl font-black tracking-tight mb-2">Sign in to download</h3>
          <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Create a free account to download comments. Free plan includes 5 downloads/day — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link href="/login"
              className="bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
              Create Free Account
            </Link>
            <Link href="/login"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2">
              Sign In
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-white/25 text-xs">
            <span className="flex items-center gap-1.5"><CheckCircle size={11} />5 downloads/day free</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={11} />No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={11} />Sign up in 60 seconds</span>
          </div>
        </div>
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
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [includeReplies, setIncludeReplies] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [downloadsToday, setDownloadsToday] = useState(0)
  const [downloadsRemaining, setDownloadsRemaining] = useState(5)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true; document.body.appendChild(script)
    return () => { if (document.body.contains(script)) document.body.removeChild(script) }
  }, [])

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('sb_user')
      const sessionStr = localStorage.getItem('sb_session')
      if (userStr && sessionStr) {
        const u = JSON.parse(userStr)
        setUser(u)
        if (u?.id) loadUserData(u.id)
      }
    } catch (e) { console.error(e) }
  }, [])

  async function loadUserData(userId: string) {
    try {
      const res = await fetch(`/api/save-download?userId=${userId}`)
      if (res.ok) {
        const d = await res.json()
        if (d.isPremium) {
          setIsPremium(true)
        } else {
          setDownloadsToday(d.count || 0)
          setDownloadsRemaining(Math.max(0, d.remaining ?? 5))
        }
      }
    } catch (e) { console.error(e) }
  }

  const handleFetch = async () => {
    setError(''); setComments([]); setFetched(false); setHasMore(false)
    const vid = parseVideoId(url)
    if (!vid) { setError('Invalid YouTube URL. Please paste a valid link.'); return }
    setVideoId(vid); setLoading(true)
    try {
      const params = new URLSearchParams({ videoId: vid, includeReplies: includeReplies.toString(), isPremium: isPremium.toString() })
      const res = await fetch(`/api/comments?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch comments')
      setComments(data.comments); setFetched(true); setHasMore(data.hasMore || false)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleDownload = async () => {
    if (!user) { window.location.href = '/login'; return }
    if (!isPremium && downloadsRemaining <= 0) { setShowUpgrade(true); return }

    try {
      const res = await fetch('/api/save-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, videoId, commentCount: comments.length })
      })
      const data = await res.json()
      if (data.limitReached) { setShowUpgrade(true); return }
      if (data.count !== null && data.count !== undefined) {
        setDownloadsToday(data.count)
        setDownloadsRemaining(Math.max(0, data.remaining ?? 0))
      }
    } catch (e) { /* fail open */ }

    triggerCSVDownload(comments, videoId)
  }

  function handleSignOut() {
    localStorage.removeItem('sb_user'); localStorage.removeItem('sb_session')
    setUser(null); setIsPremium(false); setDownloadsToday(0); setDownloadsRemaining(5)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} user={user} />}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-800/8 blur-[100px] animate-pulse" style={{animationDelay:'1s'}} />
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 1px 1px,rgba(255,255,255,0.03) 1px,transparent 0)',backgroundSize:'40px 40px'}} />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-xl z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Youtube size={16} /></div>
              <span className="font-bold text-lg tracking-tight">CommentPull</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <a href="#features" className="text-white/50 hover:text-white transition-colors hidden md:block">Features</a>
              <a href="#pricing" className="text-white/50 hover:text-white transition-colors hidden md:block">Pricing</a>
              {user ? (
                <>
                  {isPremium && (
                    <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <Crown size={10} />Premium
                    </span>
                  )}
                  <Link href="/dashboard" className="flex items-center gap-1.5 border border-white/20 hover:border-white/40 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-sm">
                    <LayoutDashboard size={14} />Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="text-white/40 hover:text-white text-sm transition-colors px-2 py-1.5">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="border border-white/20 hover:border-white/40 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">Sign In</Link>
                  <button onClick={() => setShowUpgrade(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5">
                    <Crown size={13} />Go Premium
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-6 pt-20 pb-12 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
              <Zap size={12} />Sign up free · 5 downloads/day · No credit card
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
              Download YouTube<br />
              <span className="text-red-500">Comments Instantly</span>
            </h1>
            <p className="text-white/50 text-lg mb-12 max-w-xl mx-auto">
              Paste any YouTube URL and export all comments as CSV in seconds. Perfect for research, sentiment analysis, and content strategy.
            </p>

            {/* Input card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm max-w-2xl mx-auto mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFetch()}
                  id="hero-input" placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors" />
                <button onClick={handleFetch} disabled={loading || !url.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {loading ? 'Fetching...' : 'Fetch Comments'}
                </button>
              </div>
              {/* Reply checkbox */}
              <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" checked={includeReplies} onChange={e => setIncludeReplies(e.target.checked)} className="sr-only" />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${includeReplies ? 'bg-red-600 border-red-600' : 'bg-transparent border-white/20 group-hover:border-white/40'}`}>
                      {includeReplies && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </div>
                  <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Include replies to comments</span>
                </label>
                <span className="text-xs text-white/30">
                  {isPremium ? '✨ Premium: up to 10,000 comments' : 'Free: top 100 comments · '}
                  {!isPremium && <button onClick={() => setShowUpgrade(true)} className="text-amber-400 hover:text-amber-300 transition-colors">Unlock more →</button>}
                </span>
              </div>
              {error && <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"><AlertCircle size={14} />{error}</div>}
            </div>

            {/* Login nudge for guests */}
            {!user && (
              <p className="text-white/30 text-sm">
                <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors font-medium">Sign in</Link> to save download history and track your usage
              </p>
            )}
            {user && !isPremium && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i <= downloadsToday ? 'bg-red-500' : 'bg-white/15'}`} />
                  ))}
                </div>
                <span className={downloadsRemaining <= 1 ? 'text-red-400 font-medium' : 'text-white/40'}>
                  {downloadsRemaining > 0 ? `${downloadsRemaining} download${downloadsRemaining !== 1 ? 's' : ''} left today` : 'Daily limit reached · '}
                  {downloadsRemaining === 0 && <button onClick={() => setShowUpgrade(true)} className="text-amber-400 hover:text-amber-300 transition-colors">Upgrade for unlimited</button>}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        {fetched && comments.length > 0 && (
          <section className="px-6 pb-16">
            <div className="max-w-5xl mx-auto">
              {/* Table header row */}
              <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold">{comments.length} {includeReplies ? 'Comments & Replies' : 'Comments'} Found</h2>
                  <p className="text-white/40 text-sm">Video ID: {videoId}{!isPremium && <span className="ml-2 text-amber-400/70">· Free (top 100)</span>}</p>
                </div>
                {/* Download button — gated */}
                {!user ? (
                  <div className="flex flex-col items-end gap-1">
                    <Link href="/login"
                      className="flex items-center gap-2 bg-white/5 border border-white/20 hover:border-white/40 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm">
                      <Lock size={14} className="text-white/40" />Sign in to Download
                    </Link>
                    <span className="text-white/25 text-xs">Free account required</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1.5">
                    <button onClick={handleDownload} disabled={!isPremium && downloadsRemaining <= 0}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm">
                      <Download size={14} />Download CSV
                    </button>
                    {!isPremium && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i <= downloadsToday ? 'bg-red-500' : 'bg-white/20'}`} />)}
                        </div>
                        <span className={`text-xs font-medium ${downloadsRemaining <= 1 ? 'text-red-400' : 'text-white/40'}`}>
                          {downloadsRemaining > 0 ? `${downloadsRemaining} left today` : 'Limit reached'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Comment table — blurred for non-premium when they hit limit */}
              <div className="relative">
                <div className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all ${!isPremium && downloadsRemaining <= 0 ? 'blur-sm pointer-events-none select-none' : ''}`}>
                  <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-white/40 uppercase tracking-wider border-b border-white/5 font-medium">
                    <div className="col-span-3">Author</div>
                    <div className="col-span-6">Comment</div>
                    <div className="col-span-1 text-center">Likes</div>
                    <div className="col-span-2 text-right">Date</div>
                  </div>
                  <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                    {comments.map((c, i) => (
                      <div key={i} className={`grid grid-cols-12 gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-sm ${c.isReply ? 'bg-white/[0.015] pl-8' : ''}`}>
                        <div className="col-span-3 font-medium text-white/80 truncate">
                          {c.isReply && <span className="text-white/25 text-xs mr-1">↳</span>}{c.author}
                        </div>
                        <div className="col-span-6 text-white/60 line-clamp-2 leading-relaxed">{c.text}</div>
                        <div className="col-span-1 text-center text-white/40">{c.likes.toLocaleString()}</div>
                        <div className="col-span-2 text-right text-white/30 text-xs">
                          {new Date(c.publishedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blur overlay — shown when limit hit */}
                {!user && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                    <div className="text-center px-6">
                      <Lock className="text-white/60 mx-auto mb-3" size={32} />
                      <p className="font-bold text-lg mb-2">Sign in to download</p>
                      <p className="text-white/50 text-sm mb-5">Free account · 5 downloads/day · No credit card</p>
                      <Link href="/login" className="bg-red-600 hover:bg-red-500 text-white px-7 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2">
                        Create Free Account
                      </Link>
                    </div>
                  </div>
                )}

                {user && !isPremium && downloadsRemaining <= 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl">
                    <div className="text-center px-6">
                      <Crown className="text-amber-400 mx-auto mb-3" size={36} />
                      <p className="font-bold text-xl mb-2">Daily limit reached</p>
                      <p className="text-white/50 text-sm mb-1">You've used all 5 free downloads today.</p>
                      <p className="text-white/40 text-sm mb-6">Upgrade to Premium for unlimited downloads.</p>
                      <button onClick={() => setShowUpgrade(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-7 py-3 rounded-xl transition-all inline-flex items-center gap-2">
                        <Crown size={16} />Unlock Unlimited — ₹299/mo
                      </button>
                      <p className="text-white/25 text-xs mt-3">Resets at midnight · Or wait till tomorrow</p>
                    </div>
                  </div>
                )}
              </div>

              {hasMore && !isPremium && (
                <div className="mt-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-400">🔒 Showing top 100 of thousands of comments</p>
                    <p className="text-white/50 text-sm">Premium fetches up to 10,000 comments per video</p>
                  </div>
                  <button onClick={() => setShowUpgrade(true)} className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ml-4">
                    Go Premium <ChevronRight size={14} />
                  </button>
                </div>
              )}
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
                { icon: <Zap className="text-yellow-400" size={20} />, title: 'Blazing Fast', desc: 'Fetch 100 comments in under 3 seconds using YouTube Data API v3.' },
                { icon: <Download className="text-green-400" size={20} />, title: 'CSV Export', desc: 'Download author, comment text, likes, date and reply count in clean spreadsheet format.' },
                { icon: <Shield className="text-blue-400" size={20} />, title: 'Secure & Private', desc: 'No comments stored on our servers. All data goes directly to your browser.' },
                { icon: <TrendingUp className="text-purple-400" size={20} />, title: 'Sentiment Ready', desc: 'Export structured data ready for Excel, Google Sheets, or Python analysis.' },
                { icon: <History className="text-pink-400" size={20} />, title: 'Download History', desc: 'Track all your past downloads from your personal dashboard. Available on all plans.' },
                { icon: <Code2 className="text-cyan-400" size={20} />, title: 'API Access', desc: 'Premium users get full REST API access to integrate CommentPull into their own systems.' },
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

              {/* Free */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-left">
                <div className="text-2xl font-black mb-1">Free</div>
                <div className="text-white/40 text-sm mb-6">Account required</div>
                <div className="text-4xl font-black mb-8">₹0</div>
                <ul className="space-y-3 text-sm mb-8">
                  {['5 downloads/day', '100 comments/video', 'CSV export', 'Download history dashboard'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-white/70">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-xs flex-shrink-0">✓</div>{f}
                    </li>
                  ))}
                  {['Unlimited downloads', '10,000 comments/video', 'API access'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-white/25">
                      <Lock size={12} className="flex-shrink-0 ml-1" /><span className="line-through">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="w-full border border-white/20 hover:border-white/40 text-white py-3 rounded-xl font-semibold transition-colors block text-center">
                  Get Started Free
                </Link>
              </div>

              {/* Premium */}
              <div className="bg-gradient-to-b from-red-900/30 to-red-950/20 border border-red-500/30 rounded-2xl p-8 text-left relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">POPULAR</div>
                <div className="text-2xl font-black mb-1">Premium</div>
                <div className="text-white/40 text-sm mb-6">Cancel anytime</div>
                <div className="text-4xl font-black mb-1">₹299</div>
                <div className="text-white/30 text-sm mb-8">per month · UPI · Cards · NetBanking</div>
                <ul className="space-y-3 text-sm text-white/80 mb-8">
                  {[
                    'Unlimited downloads/day',
                    '10,000 comments/video',
                    'Download history dashboard',
                    'API access for organizations',
                    'Priority support',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500/30 flex items-center justify-center text-xs text-red-400 flex-shrink-0">✓</div>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowUpgrade(true)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                  <Crown size={16} />Upgrade Now — ₹299/month
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center"><Youtube size={12} /></div>
              <span>CommentPull © 2025 · Crestlabs</span>
            </div>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:hello@crestlabs.in" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
