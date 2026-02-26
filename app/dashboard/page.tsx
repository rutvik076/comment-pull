'use client'

import { useEffect, useState } from 'react'
import {
  Youtube, Download, Crown, LogOut, Clock, FileText,
  TrendingUp, Lock, Code2, ExternalLink, AlertTriangle,
  CheckCircle, XCircle, Loader2, Settings, Zap, Calendar,
  CreditCard, Shield
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DownloadRecord {
  id: string; video_id: string; comment_count: number; created_at: string
}

interface PremiumInfo {
  isPremium: boolean
  plan: 'free' | 'premium'
  renewalDate: string | null
  activatedAt: string | null
  cancelledAt: string | null
  subscriptionId: string | null
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [premiumInfo, setPremiumInfo] = useState<PremiumInfo>({ isPremium: false, plan: 'free', renewalDate: null, activatedAt: null, cancelledAt: null, subscriptionId: null })
  const [downloads, setDownloads] = useState<DownloadRecord[]>([])
  const [downloadsToday, setDownloadsToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'subscription'>('overview')

  // Cancel state
  const [cancelling, setCancelling] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      const userStr = localStorage.getItem('sb_user')
      if (!userStr) { router.push('/login'); return }
      const u = JSON.parse(userStr)
      setUser(u)

      // Load all dashboard data in parallel
      const [dashRes, countRes] = await Promise.all([
        fetch(`/api/dashboard?userId=${u.id}`),
        fetch(`/api/save-download?userId=${u.id}`)
      ])

      if (dashRes.ok) {
        const d = await dashRes.json()
        setDownloads(d.downloads || [])
        setPremiumInfo({
          isPremium: d.isPremium || false,
          plan: d.isPremium ? 'premium' : 'free',
          renewalDate: d.renewalDate || null,
          activatedAt: d.activatedAt || null,
          cancelledAt: d.cancelledAt || null,
          subscriptionId: d.subscriptionId || null,
        })
      }

      if (countRes.ok) {
        const c = await countRes.json()
        setDownloadsToday(c.count || 0)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function handleCancelSubscription() {
    if (!user?.id) return
    setCancelling(true); setCancelError('')
    try {
      const res = await fetch('/api/subscription', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel')
      setCancelDone(true)
      setShowCancelConfirm(false)
      setPremiumInfo(p => ({ ...p, cancelledAt: new Date().toISOString() }))
    } catch (e: any) {
      setCancelError(e.message)
    } finally {
      setCancelling(false)
    }
  }

  function handleSignOut() {
    localStorage.removeItem('sb_user'); localStorage.removeItem('sb_session'); router.push('/')
  }

  const fmt = (d: string | null) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  const isPremium = premiumInfo.isPremium
  const isCancelled = !!premiumInfo.cancelledAt

  if (loading) return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Loading dashboard...</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isPremium
          ? <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-600/6 blur-[120px]" />
          : <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-red-600/6 blur-[100px]" />
        }
      </div>

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-xl z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Youtube size={16} /></div>
            <span className="font-bold text-lg tracking-tight">CommentPull</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Premium badge in nav */}
            {isPremium ? (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30 rounded-full px-3 py-1.5">
                <Crown className="text-amber-400" size={13} />
                <span className="text-amber-400 text-xs font-bold">PREMIUM</span>
                {isCancelled && <span className="text-amber-600 text-xs">· Cancels {fmt(premiumInfo.renewalDate)}</span>}
              </div>
            ) : null}
            <span className="text-white/40 text-sm hidden md:block">{user?.email}</span>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg">
              <LogOut size={14} />Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Header row */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
              {isPremium && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black px-3 py-1 rounded-full">
                  <Crown size={11} />PREMIUM
                </div>
              )}
            </div>
            <p className="text-white/40">Welcome back, <span className="text-white/70">{user?.email?.split('@')[0]}</span></p>
          </div>
          {!isPremium && (
            <button onClick={() => router.push('/#pricing')}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/20">
              <Crown size={14} />Upgrade to Premium
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 border border-white/8 rounded-2xl p-1 w-fit">
          {[
            { key: 'overview', label: 'Overview', icon: <TrendingUp size={14} /> },
            { key: 'subscription', label: 'Subscription', icon: <CreditCard size={14} /> },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: <Download className="text-blue-400" size={18} />, label: 'Total Downloads', value: downloads.length },
                {
                  icon: <Clock className="text-yellow-400" size={18} />,
                  label: 'Today',
                  value: isPremium ? `${downloadsToday} / ∞` : `${downloadsToday} / 5`
                },
                {
                  icon: <Crown className={isPremium ? 'text-amber-400' : 'text-white/30'} size={18} />,
                  label: 'Plan',
                  value: isPremium ? (
                    <span className="text-amber-400">Premium ✓</span>
                  ) : 'Free'
                },
                {
                  icon: <TrendingUp className="text-green-400" size={18} />,
                  label: 'This Month',
                  value: downloads.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length
                },
              ].map((s, i) => (
                <div key={i} className={`border rounded-2xl p-5 ${i === 2 && isPremium ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20' : 'bg-white/5 border-white/8'}`}>
                  <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center mb-3">{s.icon}</div>
                  <div className="text-2xl font-black mb-1">{s.value}</div>
                  <div className="text-white/40 text-sm">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Free user: download bar */}
            {!isPremium && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">Daily Downloads</p>
                    <p className="text-white/40 text-xs mt-0.5">{downloadsToday} of 5 used · Resets at midnight</p>
                  </div>
                  <button onClick={() => router.push('/#pricing')} className="text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors">
                    Upgrade for unlimited →
                  </button>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${downloadsToday >= 5 ? 'bg-red-500' : downloadsToday >= 3 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (downloadsToday / 5) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-white/25 text-xs mt-1.5"><span>0</span><span>5 downloads/day</span></div>
              </div>
            )}

            {/* Premium: active features grid */}
            {isPremium && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                  { icon: <Zap className="text-yellow-400" size={16} />, label: 'Unlimited Downloads', active: true },
                  { icon: <FileText className="text-blue-400" size={16} />, label: '10,000 Comments/Video', active: true },
                  { icon: <TrendingUp className="text-green-400" size={16} />, label: 'Full History', active: true },
                  { icon: <Code2 className="text-cyan-400" size={16} />, label: 'API Access', active: true },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-xl px-3.5 py-3">
                    <CheckCircle className="text-green-400 shrink-0" size={14} />
                    <div>
                      <div className="w-6 h-6 mb-1">{f.icon}</div>
                      <p className="text-white/70 text-xs leading-tight">{f.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Main two-col */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* History */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black">Download History</h2>
                  <Link href="/" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                    <Download size={14} />New Download
                  </Link>
                </div>
                {downloads.length === 0 ? (
                  <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-white/20" size={22} />
                    </div>
                    <p className="text-white/40 font-medium mb-1">No downloads yet</p>
                    <p className="text-white/25 text-sm mb-5">Download comments from any YouTube video</p>
                    <Link href="/" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                      <Youtube size={14} />Start Downloading
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs text-white/40 uppercase tracking-wider border-b border-white/5 font-medium">
                      <div className="col-span-5">Video</div>
                      <div className="col-span-3 text-center">Comments</div>
                      <div className="col-span-4 text-right">Date</div>
                    </div>
                    <div className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
                      {downloads.map((d, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 px-5 py-3.5 hover:bg-white/3 transition-colors text-sm items-center">
                          <div className="col-span-5">
                            <a href={`https://youtube.com/watch?v=${d.video_id}`} target="_blank" rel="noopener noreferrer"
                              className="text-red-400 hover:text-red-300 transition-colors font-mono text-xs flex items-center gap-1.5 group">
                              <Youtube size={11} />{d.video_id}
                              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </div>
                          <div className="col-span-3 text-center text-white/60">{d.comment_count?.toLocaleString()}</div>
                          <div className="col-span-4 text-right text-white/30 text-xs">
                            {new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <h2 className="text-xl font-black">Premium Features</h2>

                {/* API Access card */}
                <div className={`relative bg-white/3 border rounded-2xl p-5 overflow-hidden ${isPremium ? 'border-cyan-500/30' : 'border-white/8'}`}>
                  {!isPremium && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                      <div className="text-center px-4">
                        <Lock className="text-white/40 mx-auto mb-2" size={20} />
                        <p className="text-white/60 text-xs font-semibold mb-2">Premium only</p>
                        <button onClick={() => router.push('/#pricing')} className="text-amber-400 text-xs hover:text-amber-300 transition-colors font-medium border border-amber-500/30 px-3 py-1.5 rounded-lg">Unlock →</button>
                      </div>
                    </div>
                  )}
                  <div className={!isPremium ? 'blur-sm' : ''}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center"><Code2 className="text-cyan-400" size={15} /></div>
                      <div><p className="font-bold text-sm">API Access</p><p className="text-white/40 text-xs">For organizations</p></div>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed">Integrate CommentPull directly into your systems with our REST API.</p>
                    {isPremium && (
                  <a href="/docs" className="mt-3 text-cyan-400 text-xs font-semibold hover:text-cyan-300 transition-colors flex items-center gap-1 w-fit">
                    View API Docs & Keys <ExternalLink size={10} />
                  </a>
                )}
                  </div>
                </div>

                {/* Unlimited downloads card */}
                <div className={`relative bg-white/3 border rounded-2xl p-5 overflow-hidden ${isPremium ? 'border-green-500/30' : 'border-white/8'}`}>
                  {!isPremium && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                      <div className="text-center px-4">
                        <Lock className="text-white/40 mx-auto mb-2" size={20} />
                        <p className="text-white/60 text-xs font-semibold mb-2">Premium only</p>
                        <button onClick={() => router.push('/#pricing')} className="text-amber-400 text-xs hover:text-amber-300 transition-colors font-medium border border-amber-500/30 px-3 py-1.5 rounded-lg">Unlock →</button>
                      </div>
                    </div>
                  )}
                  <div className={!isPremium ? 'blur-sm' : ''}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center"><Download className="text-green-400" size={15} /></div>
                      <div><p className="font-bold text-sm">Unlimited Downloads</p><p className="text-white/40 text-xs">10,000 comments/video</p></div>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed">No daily limits. Fetch up to 10,000 comments per video every day.</p>
                  </div>
                </div>

                {!isPremium && (
                  <button onClick={() => router.push('/#pricing')}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                    <Crown size={15} />Upgrade — ₹299/mo
                  </button>
                )}

                {isPremium && (
                  <button onClick={() => setActiveTab('subscription')}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white py-3 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                    <Settings size={14} />Manage Subscription
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── SUBSCRIPTION TAB ── */}
        {activeTab === 'subscription' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black mb-6">Manage Subscription</h2>

            {isPremium ? (
              <div className="space-y-5">

                {/* Current plan card */}
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/25 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center">
                        <Crown className="text-amber-400" size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-lg">Premium Plan</p>
                          {isCancelled
                            ? <span className="text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Cancels Soon</span>
                            : <span className="text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">Active</span>
                          }
                        </div>
                        <p className="text-white/40 text-sm">₹299/month</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { icon: <Calendar size={14} className="text-white/40" />, label: isCancelled ? 'Access Until' : 'Next Renewal', value: fmt(premiumInfo.renewalDate) },
                      { icon: <CheckCircle size={14} className="text-green-400" />, label: 'Activated On', value: fmt(premiumInfo.activatedAt) },
                      { icon: <CreditCard size={14} className="text-white/40" />, label: 'Amount', value: '₹299 / month' },
                      { icon: <Shield size={14} className="text-white/40" />, label: 'Payment', value: 'Razorpay' },
                    ].map((item, i) => (
                      <div key={i} className="bg-black/20 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">{item.icon}<span className="text-white/40 text-xs">{item.label}</span></div>
                        <p className="text-white font-semibold text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {isCancelled ? (
                    <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                      <AlertTriangle className="text-orange-400 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-orange-400 font-semibold text-sm">Subscription cancelled</p>
                        <p className="text-white/50 text-xs mt-0.5 leading-relaxed">
                          Your Premium access stays active until <span className="text-white font-semibold">{fmt(premiumInfo.renewalDate)}</span>. After that, your account moves to the Free plan.
                        </p>
                      </div>
                    </div>
                  ) : cancelDone ? (
                    <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <CheckCircle className="text-green-400 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-green-400 font-semibold text-sm">Cancellation confirmed</p>
                        <p className="text-white/50 text-xs mt-0.5">Premium stays active until {fmt(premiumInfo.renewalDate)}.</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* What's included */}
                <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Included in your plan</p>
                  <div className="space-y-3">
                    {[
                      { icon: <Zap size={15} className="text-yellow-400" />, text: 'Unlimited downloads every day' },
                      { icon: <FileText size={15} className="text-blue-400" />, text: 'Up to 10,000 comments per video' },
                      { icon: <TrendingUp size={15} className="text-green-400" />, text: 'Full download history & dashboard' },
                      { icon: <Code2 size={15} className="text-cyan-400" />, text: 'API access for organizations' },
                      { icon: <Shield size={15} className="text-purple-400" />, text: 'Priority support' },
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center shrink-0">{f.icon}</div>
                        <span className="text-white/70 text-sm">{f.text}</span>
                        <CheckCircle className="text-green-400/60 ml-auto shrink-0" size={14} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cancel button */}
                {!isCancelled && !cancelDone && (
                  <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold mb-1">Cancel Subscription</p>
                        <p className="text-white/40 text-sm leading-relaxed">
                          You can cancel anytime. Your Premium access stays active until the end of your current billing period — you won't be charged again.
                        </p>
                      </div>
                      <button onClick={() => setShowCancelConfirm(true)}
                        className="shrink-0 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                        Cancel
                      </button>
                    </div>

                    {cancelError && (
                      <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        <XCircle size={14} />{cancelError}
                      </div>
                    )}

                    {/* Confirm dialog */}
                    {showCancelConfirm && (
                      <div className="mt-5 bg-red-500/8 border border-red-500/20 rounded-xl p-5">
                        <p className="font-bold text-red-400 mb-2">Are you sure?</p>
                        <p className="text-white/50 text-sm mb-5 leading-relaxed">
                          Your Premium features will stay active until <strong className="text-white">{fmt(premiumInfo.renewalDate)}</strong>. After that you'll be on the Free plan.
                        </p>
                        <div className="flex gap-3">
                          <button onClick={handleCancelSubscription} disabled={cancelling}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
                            {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                            {cancelling ? 'Cancelling...' : 'Yes, Cancel Subscription'}
                          </button>
                          <button onClick={() => setShowCancelConfirm(false)} className="text-white/50 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-white/10">
                            Keep Premium
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              /* Not premium — show upgrade */
              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Crown className="text-amber-400" size={28} />
                </div>
                <h3 className="text-2xl font-black mb-3">No active subscription</h3>
                <p className="text-white/40 mb-8">You're on the Free plan. Upgrade to Premium to unlock unlimited downloads, 10,000 comments/video, and API access.</p>
                <button onClick={() => router.push('/#pricing')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-2 mx-auto">
                  <Crown size={18} />Upgrade to Premium — ₹299/mo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
