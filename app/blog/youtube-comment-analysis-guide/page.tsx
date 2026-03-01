import Link from 'next/link'
import { Youtube } from 'lucide-react'

export const metadata = {
  title: 'YouTube Comment Analysis Guide — CommentPull',
  description: 'Learn how to analyze YouTube comments for sentiment, trends, and audience insights using free tools.',
}

export default function Article2() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Youtube size={16} /></div>
            <span className="font-bold text-lg">CommentPull</span>
          </Link>
          <Link href="/blog" className="text-white/40 hover:text-white text-sm transition-colors">← All articles</Link>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">Guide</span>
            <span className="text-white/30 text-sm">March 1, 2026 · 6 min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-5">
            YouTube Comment Analysis: How to Turn Comments into Insights
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Your YouTube comments contain more data than you think. Here is how to systematically extract insights about your audience using only free tools.
          </p>
        </div>

        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Why Comment Analysis Matters</h2>
            <p className="text-sm sm:text-base">Most creators read comments casually but miss 95% of the signal. Systematic analysis reveals what topics resonate, what confuses viewers, and what your next video should be about.</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {[
                { icon: '💬', t: 'What topics resonate', d: 'Which parts of your video generated the most discussion' },
                { icon: '😤', t: 'Pain points', d: 'Recurring complaints or confusions you can address' },
                { icon: '💡', t: 'Content ideas', d: 'Questions asked in comments = your next video topic' },
                { icon: '📈', t: 'Sentiment trends', d: 'How audience perception shifts over your video history' },
              ].map((item, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4">
                  <p className="text-2xl mb-2">{item.icon}</p>
                  <p className="font-semibold text-white text-sm">{item.t}</p>
                  <p className="text-white/50 text-xs mt-1">{item.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Step 1: Export Your Comments</h2>
            <p className="text-sm sm:text-base">Use CommentPull to export comments as a CSV file. It takes about 30 seconds per video. Your CSV includes author name, comment text, like count, publish date, reply count, and comment type.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Step 2: Basic Analysis in Google Sheets</h2>
            <p className="text-sm sm:text-base">Import your CSV into Google Sheets then apply these quick analyses:</p>
            <div className="mt-4 space-y-3">
              {[
                { t: 'Top comments by likes', d: 'Sort column D (Likes) Z to A. The most liked comments show what resonated most.' },
                { t: 'Most active commenters', d: 'Pivot Table: Rows = Author, Values = Count. Shows your most engaged fans.' },
                { t: 'Find questions', d: 'Ctrl+F, search "?" to find every question your audience asked.' },
                { t: 'Engagement over time', d: 'Sort by date to see if engagement dropped or spiked at certain points.' },
              ].map((item, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4">
                  <p className="font-semibold text-white text-sm mb-1">📊 {item.t}</p>
                  <p className="text-white/50 text-xs">{item.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Step 3: Sentiment Analysis (3 Free Methods)</h2>
            <div className="space-y-3">
              <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                <p className="font-semibold text-white text-sm mb-2">Method A: ChatGPT (Easiest)</p>
                <p className="text-white/50 text-xs">Copy 50-100 comments, paste into ChatGPT, ask: "Analyze the sentiment of these YouTube comments. What percentage are positive, negative, neutral? What are the main themes?"</p>
              </div>
              <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                <p className="font-semibold text-white text-sm mb-2">Method B: Google Sheets COUNTIF</p>
                <p className="text-white/50 text-xs">Create a sentiment score column. Count positive words (great, love, amazing) vs negative words (bad, hate, boring) using COUNTIF formulas on the comment text column.</p>
              </div>
              <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                <p className="font-semibold text-white text-sm mb-2">Method C: Python VADER (Most Powerful)</p>
                <p className="text-white/50 text-xs">Run <code className="text-red-400">pip install vaderSentiment</code> then import your CSV with pandas and score every comment in under 10 lines of code.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Step 4: Extract Content Ideas from Questions</h2>
            <p className="text-sm sm:text-base">Filter all comments containing a question mark in Google Sheets:</p>
            <div className="mt-3 bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400">
              =FILTER(B:B, ISNUMBER(SEARCH("?", B:B)))
            </div>
            <p className="mt-3 text-white/50 text-sm">Sort results by likes. The most upvoted unanswered questions are your best video ideas — viewers already told you what they want to watch.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Step 5: Compare Across Multiple Videos</h2>
            <p className="text-sm sm:text-base">Download comments from your last 10 videos. Add a "Video Title" column to each CSV before combining them into one sheet. Then compare: which videos got the most questions? Which had the best sentiment? What topics performed best?</p>
          </section>
        </div>

        <div className="mt-12 bg-gradient-to-r from-red-900/30 to-red-950/20 border border-red-500/20 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-lg mb-2">Start Analyzing Your Comments</h3>
          <p className="text-white/50 text-sm mb-4">Export comments in seconds — free, no setup required</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm">Export Comments Free →</Link>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5">
          <p className="text-white/40 text-sm font-semibold mb-4">Related articles</p>
          <div className="space-y-3">
            <Link href="/blog/how-to-download-youtube-comments" className="block hover:text-red-400 transition-colors text-white/70 text-sm">→ How to Download YouTube Comments as CSV (Free and Easy)</Link>
            <Link href="/blog/best-tools-youtube-creators" className="block hover:text-red-400 transition-colors text-white/70 text-sm">→ 7 Best Free Tools Every YouTube Creator Should Use in 2026</Link>
          </div>
        </div>
      </article>
    </main>
  )
}
