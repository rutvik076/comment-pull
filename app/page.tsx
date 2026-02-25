'use client'

import { useState } from 'react'
import { Download, Youtube, Zap, Shield, TrendingUp, ChevronRight, Loader2, AlertCircle } from 'lucide-react'

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

export default function Home() {
  const [url, setUrl] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoId, setVideoId] = useState('')
  const [fetched, setFetched] = useState(false)

  const handleFetch = async () => {
    setError('')
    setComments([])
    setFetched(false)
    const vid = parseVideoId(url)
    if (!vid) {
      setError('Invalid YouTube URL. Please paste a valid link.')
      return
    }
    setVideoId(vid)
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?videoId=${vid}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch comments')
      setComments(data.comments)
      setFetched(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* Animated background */}
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
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Youtube size={16} />
              </div>
              <span className="font-bold text-lg tracking-tight">CommentPull</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Sign Up Free
              </button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-6 pt-24 pb-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-full px-4 py-1.5 text-sm text-red-400 mb-6">
              <Zap size={12} />
              Free · No signup required for first 3 downloads
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">
              Download YouTube
              <span className="block text-red-500">Comments Instantly</span>
            </h1>
            <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              Paste any YouTube URL and export all comments as CSV in seconds.
              Perfect for research, sentiment analysis, and content strategy.
            </p>

            {/* Main Tool */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFetch()}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors"
                />
                <button
                  onClick={handleFetch}
                  disabled={loading || !url.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {loading ? 'Fetching...' : 'Fetch Comments'}
                </button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <AlertCircle size={14} />
                  {error}
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
                <button
                  onClick={() => downloadCSV(comments, videoId)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                >
                  <Download size={14} />
                  Download CSV
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-white/40 uppercase tracking-wider border-b border-white/5 font-medium">
                  <div className="col-span-3">Author</div>
                  <div className="col-span-6">Comment</div>
                  <div className="col-span-1 text-center">Likes</div>
                  <div className="col-span-2 text-right">Date</div>
                </div>

                {/* Table Rows */}
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

              {/* Premium upsell */}
              <div className="mt-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-amber-400">Want more than 100 comments?</p>
                  <p className="text-white/50 text-sm">Upgrade to Premium — fetch up to 10,000 comments per video</p>
                </div>
                <button className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap">
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
                { icon: <ChevronRight className="text-orange-400" size={20} />, title: 'Premium Bulk', desc: 'Upgrade to export 10,000+ comments across multiple videos automatically.' },
              ].map((f, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-colors">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
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
                <div className="text-white/40 text-sm mb-6">Forever</div>
                <div className="text-4xl font-black mb-8">₹0</div>
                <ul className="space-y-3 text-sm text-white/60 mb-8">
                  {['3 downloads/day', '100 comments/video', 'CSV export', 'No signup needed'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full border border-white/20 hover:border-white/40 text-white py-3 rounded-xl font-semibold transition-colors">
                  Get Started
                </button>
              </div>
              {/* Premium */}
              <div className="bg-gradient-to-b from-red-900/30 to-red-950/20 border border-red-500/30 rounded-2xl p-8 text-left relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">POPULAR</div>
                <div className="text-2xl font-black mb-1">Premium</div>
                <div className="text-white/40 text-sm mb-6">Per month</div>
                <div className="text-4xl font-black mb-1">₹299</div>
                <div className="text-white/30 text-sm mb-8">~$3.50 USD</div>
                <ul className="space-y-3 text-sm text-white/80 mb-8">
                  {['Unlimited downloads', '10,000 comments/video', 'Bulk video processing', 'Priority support', 'API access'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500/30 flex items-center justify-center text-xs text-red-400">✓</div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-semibold transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* AdSense Placeholder */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white/3 border border-dashed border-white/10 rounded-xl h-24 flex items-center justify-center text-white/20 text-sm">
            {/* Replace with: <ins className="adsbygoogle" ... /> */}
            Google AdSense Ad Unit — 728×90 Leaderboard
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-10 mt-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                <Youtube size={12} />
              </div>
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
