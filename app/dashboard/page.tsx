'use client'

import { useEffect, useState } from 'react'
import { Youtube, Download, Crown, LogOut, Clock, FileText, TrendingUp, Lock, Code2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DownloadRecord {
  id: string; video_id: string; video_title: string; comment_count: number; created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [downloads, setDownloads] = useState<DownloadRecord[]>([])
  const [downloadsToday, setDownloadsToday] = useState(0)
  const [downloadsRemaining, setDownloadsRemaining] = useState(5)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      const userStr = localStorage.getItem('sb_user')
      const sessionStr = localStorage.getItem('sb_session')
      if (!userStr || !sessionStr) { router.push('/login'); return }

      const u = JSON.parse(userStr)
      setUser(u)

      const session = JSON.parse(sessionStr)
      const isLocal = session.access_token?.startsWith('local_')

      if (!isLocal && session.access_token) {
        try {
          const res = await fetch('/api/dashboard', { headers: { 'Authorization': `Bearer ${session.access_token}` } })
          if (res.ok) {
            const data = await res.json()
            setDownloads(data.downloads || [])
            setIsPremium(data.isPremium || false)
          }
        } catch (e) { console.error(e) }
      }

      // Get daily count
      const countRes = await fetch(`/api/save-download?userId=${u.id}`)
      if (countRes.ok) {
        const d = await countRes.json()
        if (d.isPremium) { setIsPremium(true) }
        else { setDownloadsToday(d.count || 0); setDownloadsRemaining(Math.max(0, d.remaining ?? 5)) }
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function handleSignOut() {
    localStorage.removeItem('sb_user'); localStorage.removeItem('sb_session'); router.push('/')
  }

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
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-red-600/6 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-xl z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Youtube size={16} /></div>
            <span className="font-bold text-lg tracking-tight">CommentPull</span>
          </Link>
          <div className="flex items-center gap-3">
            {isPremium && (
              <span className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
                <Crown size={12} />Premium Active
              </span>
            )}
            <span className="text-white/40 text-sm hidden md:block">{user?.email}</span>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg">
              <LogOut size={14} />Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Dashboard</h1>
            <p className="text-white/40">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>
          {!isPremium && (
            <button onClick={() => router.push('/#pricing')}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg">
              <Crown size={14} />Upgrade to Premium
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Download className="text-blue-400" size={18} />, label: 'Total Downloads', value: downloads.length },
            { icon: <Clock className="text-yellow-400" size={18} />, label: 'Today', value: isPremium ? `${downloadsToday} / ∞` : `${downloadsToday} / 5` },
            { icon: <Crown className="text-amber-400" size={18} />, label: 'Plan', value: isPremium ? 'Premium' : 'Free' },
            { icon: <TrendingUp className="text-green-400" size={18} />, label: 'This Month', value: downloads.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center mb-3">{s.icon}</div>
              <div className="text-2xl font-black mb-1">{s.value}</div>
              <div className="text-white/40 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Download counter bar for free users */}
        {!isPremium && (
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-sm">Daily Downloads</p>
                <p className="text-white/40 text-xs mt-0.5">{downloadsToday} of 5 used today · Resets at midnight</p>
              </div>
              <button onClick={() => router.push('/#pricing')} className="text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors">
                Upgrade for unlimited →
              </button>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${downloadsToday >= 5 ? 'bg-red-500' : downloadsToday >= 3 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (downloadsToday / 5) * 100)}%` }} />
            </div>
            <div className="flex justify-between text-white/25 text-xs mt-1.5">
              <span>0</span><span>5 downloads/day</span>
            </div>
          </div>
        )}

        {/* Two column: History + Locked Premium Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Download History (all users) */}
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
                <p className="text-white/25 text-sm mb-5">Download comments from any YouTube video — it'll appear here</p>
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
                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                  {downloads.map((d, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 px-5 py-3.5 hover:bg-white/3 transition-colors text-sm items-center">
                      <div className="col-span-5">
                        <a href={`https://youtube.com/watch?v=${d.video_id}`} target="_blank" rel="noopener noreferrer"
                          className="text-red-400 hover:text-red-300 transition-colors font-mono text-xs flex items-center gap-1.5 group">
                          <Youtube size={11} />{d.video_id}<ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </div>
                      <div className="col-span-3 text-center text-white/60">{d.comment_count?.toLocaleString()}</div>
                      <div className="col-span-4 text-right text-white/30 text-xs">
                        {new Date(d.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Premium features sidebar */}
          <div className="space-y-4">
            <h2 className="text-xl font-black">Premium Features</h2>

            {/* API Access — locked for free */}
            <div className={`relative bg-white/3 border rounded-2xl p-5 overflow-hidden ${isPremium ? 'border-cyan-500/30' : 'border-white/8'}`}>
              {!isPremium && <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                <div className="text-center px-4">
                  <Lock className="text-white/40 mx-auto mb-2" size={20} />
                  <p className="text-white/60 text-xs font-semibold mb-2">Premium only</p>
                  <button onClick={() => router.push('/#pricing')} className="text-amber-400 text-xs hover:text-amber-300 transition-colors font-medium border border-amber-500/30 px-3 py-1.5 rounded-lg">
                    Unlock →
                  </button>
                </div>
              </div>}
              <div className={`${!isPremium ? 'blur-sm' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Code2 className="text-cyan-400" size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">API Access</p>
                    <p className="text-white/40 text-xs">For organizations</p>
                  </div>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">Integrate CommentPull directly into your systems with our REST API. Programmatic access to fetch and export comments at scale.</p>
                {isPremium && <button className="mt-3 text-cyan-400 text-xs font-semibold hover:text-cyan-300 transition-colors flex items-center gap-1">View API Docs <ExternalLink size={10} /></button>}
              </div>
            </div>

            {/* Unlimited downloads — locked for free */}
            <div className={`relative bg-white/3 border rounded-2xl p-5 overflow-hidden ${isPremium ? 'border-green-500/30' : 'border-white/8'}`}>
              {!isPremium && <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                <div className="text-center px-4">
                  <Lock className="text-white/40 mx-auto mb-2" size={20} />
                  <p className="text-white/60 text-xs font-semibold mb-2">Premium only</p>
                  <button onClick={() => router.push('/#pricing')} className="text-amber-400 text-xs hover:text-amber-300 transition-colors font-medium border border-amber-500/30 px-3 py-1.5 rounded-lg">
                    Unlock →
                  </button>
                </div>
              </div>}
              <div className={`${!isPremium ? 'blur-sm' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                    <Download className="text-green-400" size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Unlimited Downloads</p>
                    <p className="text-white/40 text-xs">10,000 comments/video</p>
                  </div>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">No daily limits. Fetch up to 10,000 comments per video and download as many CSVs as you need, every day.</p>
              </div>
            </div>

            {/* Upgrade CTA */}
            {!isPremium && (
              <button onClick={() => router.push('/#pricing')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                <Crown size={15} />Upgrade to Premium — ₹299/mo
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
