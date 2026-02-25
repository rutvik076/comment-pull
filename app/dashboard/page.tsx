'use client'

import { useEffect, useState } from 'react'
import { Youtube, Download, Crown, LogOut, Clock, FileText, TrendingUp, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DownloadRecord {
  id: string
  video_id: string
  video_title: string
  comment_count: number
  created_at: string
}

interface UserProfile {
  email: string
  isPremium: boolean
  downloadsToday: number
  totalDownloads: number
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [downloads, setDownloads] = useState<DownloadRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      // Get user from localStorage (set during login)
      const userStr = localStorage.getItem('sb_user')
      const sessionStr = localStorage.getItem('sb_session')

      if (!userStr || !sessionStr) {
        router.push('/login')
        return
      }

      const user = JSON.parse(userStr)
      const session = JSON.parse(sessionStr)

      // Fetch dashboard data via server API
      // Handle both real sessions and local fallback sessions
      const isLocalSession = session.access_token?.startsWith('local_')
      let data = { downloads: [], isPremium: false }

      if (!isLocalSession) {
        const res = await fetch('/api/dashboard', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          data = await res.json()
        }
        // Don't redirect on failure — show empty dashboard instead
      }
      const today = new Date().toISOString().split('T')[0]
      const todayDownloads = (data.downloads || []).filter((d: DownloadRecord) =>
        d.created_at.startsWith(today)
      ).length

      setProfile({
        email: user.email || '',
        isPremium: data.isPremium || false,
        downloadsToday: todayDownloads,
        totalDownloads: data.downloads?.length || 0,
      })
      setDownloads(data.downloads || [])
    } catch (error) {
      console.error('Dashboard error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  function handleSignOut() {
    localStorage.removeItem('sb_user')
    localStorage.removeItem('sb_session')
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40">Loading your dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-red-600/8 blur-[100px]" />
      </div>
      <div className="relative z-10">
        <nav className="border-b border-white/5 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Youtube size={16} /></div>
              <span className="font-bold text-lg tracking-tight">CommentPull</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-sm hidden md:block">{profile?.email}</span>
              <button onClick={handleSignOut}
                className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg">
                <LogOut size={14} />Sign Out
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-1">Dashboard</h1>
              <p className="text-white/40">Welcome back, {profile?.email?.split('@')[0]}</p>
            </div>
            {profile?.isPremium ? (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl text-sm font-semibold">
                <Crown size={14} />Premium Active
              </div>
            ) : (
              <button onClick={() => router.push('/#pricing')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                <Crown size={14} />Upgrade to Premium
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: <Download className="text-blue-400" size={18} />, label: 'Total Downloads', value: profile?.totalDownloads || 0 },
              { icon: <Clock className="text-yellow-400" size={18} />, label: 'Downloads Today', value: `${profile?.downloadsToday || 0}/${profile?.isPremium ? '∞' : '3'}` },
              { icon: <Crown className="text-amber-400" size={18} />, label: 'Plan', value: profile?.isPremium ? 'Premium' : 'Free' },
              { icon: <TrendingUp className="text-green-400" size={18} />, label: 'This Month', value: downloads.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center mb-3">{stat.icon}</div>
                <div className="text-2xl font-black mb-1">{stat.value}</div>
                <div className="text-white/40 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Upgrade nudge */}
          {!profile?.isPremium && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between">
              <div>
                <p className="font-semibold text-amber-400">Unlock unlimited downloads</p>
                <p className="text-white/50 text-sm">Upgrade to Premium for 10,000 comments/video + download history forever</p>
              </div>
              <button onClick={() => router.push('/#pricing')}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition-colors whitespace-nowrap ml-4">
                Upgrade — ₹299/mo
              </button>
            </div>
          )}

          {/* Download History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">Download History</h2>
              <Link href="/" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                <Download size={14} />New Download
              </Link>
            </div>

            {downloads.length === 0 ? (
              <div className="bg-white/3 border border-white/8 rounded-2xl p-16 text-center">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-white/20" size={24} />
                </div>
                <p className="text-white/40 font-medium mb-2">No downloads yet</p>
                <p className="text-white/25 text-sm mb-6">Start by pasting a YouTube URL on the homepage</p>
                <Link href="/" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  <Youtube size={14} />Go to Homepage
                </Link>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-white/40 uppercase tracking-wider border-b border-white/5 font-medium">
                  <div className="col-span-4">Video ID</div>
                  <div className="col-span-3">Title</div>
                  <div className="col-span-2 text-center">Comments</div>
                  <div className="col-span-3 text-right">Date</div>
                </div>
                <div className="divide-y divide-white/5">
                  {downloads.map((d, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-sm items-center">
                      <div className="col-span-4">
                        <a href={`https://youtube.com/watch?v=${d.video_id}`} target="_blank" rel="noopener noreferrer"
                          className="text-red-400 hover:text-red-300 transition-colors font-mono text-xs flex items-center gap-1">
                          <Youtube size={12} />{d.video_id}
                        </a>
                      </div>
                      <div className="col-span-3 text-white/60 truncate text-xs">{d.video_title || '—'}</div>
                      <div className="col-span-2 text-center text-white/60">{d.comment_count?.toLocaleString() || '—'}</div>
                      <div className="col-span-3 text-right text-white/30 text-xs">
                        {new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
