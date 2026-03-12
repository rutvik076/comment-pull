'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp, HelpCircle, Lightbulb, Star, Loader2, Lock, ChevronDown, ChevronUp } from 'lucide-react'

interface AISummaryProps {
  comments: any[]
  videoId: string
  userId: string | null
  isPremium: boolean
  onUpgradeClick: () => void
}

interface Analysis {
  sentimentScore: number
  sentimentLabel: string
  sentimentBreakdown: { positive: number; neutral: number; negative: number }
  summary: string
  topThemes: { theme: string; count: number; sentiment: string }[]
  topQuestions: string[]
  suggestions: string[]
  highlights: { mostLikedComment: string; mostEngaging: string }
  audienceType: string
}

export default function AISummary({ comments, videoId, userId, isPremium, onUpgradeClick }: AISummaryProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(true)

  async function generateSummary() {
    if (!isPremium) { onUpgradeClick(); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments, videoId, userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate summary')
      setAnalysis(data.analysis)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const sentimentColor = (score: number) => {
    if (score >= 7.5) return 'text-green-400'
    if (score >= 5) return 'text-amber-400'
    return 'text-red-400'
  }

  const themeColor = (sentiment: string) => {
    if (sentiment === 'positive') return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (sentiment === 'negative') return 'bg-red-500/10 text-red-400 border-red-500/20'
    return 'bg-white/5 text-white/60 border-white/10'
  }

  // Not yet generated — show trigger button
  if (!analysis) {
    return (
      <div className="w-full rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="text-purple-400" size={18} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">AI Comment Analysis</p>
              <p className="text-white/40 text-xs">Sentiment · Themes · Questions · Video ideas</p>
            </div>
          </div>

          {!isPremium ? (
            <button
              onClick={onUpgradeClick}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <Lock size={13} /> Upgrade
            </button>
          ) : (
            <button
              onClick={generateSummary}
              disabled={loading || comments.length === 0}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles size={14} /> Analyze</>
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-3 text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
        )}

        {!isPremium && (
          <p className="mt-3 text-white/30 text-xs">
            ✨ Pro feature — upgrade to ₹499/month to unlock AI analysis
          </p>
        )}
      </div>
    )
  }

  // Analysis result
  return (
    <div className="w-full rounded-2xl border border-purple-500/20 bg-[#0f0f1a] p-5 mb-4 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-400" size={18} />
          <span className="text-white font-bold text-sm">AI Analysis</span>
          <span className="text-white/30 text-xs">· {comments.length} comments</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-white/40 hover:text-white transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <>
          {/* Sentiment Score */}
          <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4">
            <div className="text-center">
              <p className={`text-4xl font-black ${sentimentColor(analysis.sentimentScore)}`}>
                {analysis.sentimentScore}
                <span className="text-lg text-white/30">/10</span>
              </p>
              <p className="text-white/50 text-xs mt-1">{analysis.sentimentLabel}</p>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'Positive', value: analysis.sentimentBreakdown.positive, color: 'bg-green-500' },
                { label: 'Neutral', value: analysis.sentimentBreakdown.neutral, color: 'bg-amber-500' },
                { label: 'Negative', value: analysis.sentimentBreakdown.negative, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-white/40 text-xs w-14">{item.label}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-1.5">
                    <div
                      className={`${item.color} h-1.5 rounded-full transition-all`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="text-white/50 text-xs w-8 text-right">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Summary</p>
            <p className="text-white/80 text-sm leading-relaxed">{analysis.summary}</p>
            <p className="text-white/30 text-xs mt-2">👥 Audience: {analysis.audienceType}</p>
          </div>

          {/* Top Themes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-purple-400" size={14} />
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Top Themes</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.topThemes.map((t, i) => (
                <span key={i} className={`text-xs px-3 py-1.5 rounded-full border ${themeColor(t.sentiment)}`}>
                  {t.theme} · {t.count}
                </span>
              ))}
            </div>
          </div>

          {/* Top Questions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="text-blue-400" size={14} />
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Audience Questions</p>
            </div>
            <div className="space-y-2">
              {analysis.topQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 bg-white/5 rounded-xl px-3 py-2">
                  <span className="text-blue-400 text-xs mt-0.5">Q{i + 1}</span>
                  <p className="text-white/70 text-xs">{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Video Ideas */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="text-amber-400" size={14} />
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Suggested Next Videos</p>
            </div>
            <div className="space-y-2">
              {analysis.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-2">
                  <span className="text-amber-400 text-xs">💡</span>
                  <p className="text-white/70 text-xs">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="text-amber-400" size={14} />
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Highlights</p>
            </div>
            <div className="space-y-2">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/30 text-xs mb-1">Most liked comment</p>
                <p className="text-white/70 text-xs italic">"{analysis.highlights.mostLikedComment}"</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/30 text-xs mb-1">Most engaging</p>
                <p className="text-white/70 text-xs italic">"{analysis.highlights.mostEngaging}"</p>
              </div>
            </div>
          </div>

          {/* Re-analyze button */}
          <button
            onClick={generateSummary}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-xs font-medium py-2.5 rounded-xl transition-all"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Re-analyze
          </button>
        </>
      )}
    </div>
  )
}
