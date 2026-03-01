import Link from 'next/link'
import { Youtube } from 'lucide-react'

export const metadata = {
  title: 'How to Download YouTube Comments as CSV — CommentPull',
  description: 'Step-by-step guide to exporting YouTube comments for research and analysis. Free, no coding required.',
}

export default function Article1() {
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
            <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">Tutorial</span>
            <span className="text-white/30 text-sm">March 1, 2026 · 4 min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-5">
            How to Download YouTube Comments as CSV (Free & Easy)
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            YouTube comments are a goldmine of audience insights. Here's how to export them in minutes — no coding, no API keys, completely free.
          </p>
        </div>

        <div className="space-y-10 text-white/70 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Why Download YouTube Comments?</h2>
            <p>YouTube comments reveal what your audience actually thinks — their questions, frustrations, and what they love. Common use cases:</p>
            <ul className="mt-4 space-y-2">
              {['Sentiment analysis — understand how viewers feel','Content ideas — find questions your audience is asking','Competitor research — see what people say about rival videos','Academic studies — analyze social media behavior','Bulk moderation — review comments offline'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm"><span className="text-red-400 shrink-0 mt-0.5">→</span>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Step-by-Step: Using CommentPull</h2>
            <div className="space-y-3">
              {[
                { n: '1', t: 'Go to CommentPull', d: 'Visit the site — no installation needed, works in any browser.' },
                { n: '2', t: 'Create a free account', d: 'Sign up with email or Google. Free plan gives 5 downloads/day.' },
                { n: '3', t: 'Copy the YouTube URL', d: 'Open any YouTube video and copy the URL from the address bar.' },
                { n: '4', t: 'Paste and fetch', d: 'Paste the URL into CommentPull and click "Fetch Comments". Results appear in seconds.' },
                { n: '5', t: 'Download as CSV', d: 'Click "Download CSV" to save. Open in Excel or Google Sheets.' },
              ].map((item) => (
                <div key={item.n} className="flex gap-4 bg-white/3 border border-white/8 rounded-xl p-4">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">{item.n}</div>
                  <div><p className="font-semibold text-white text-sm">{item.t}</p><p className="text-white/50 text-sm mt-0.5">{item.d}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <p className="text-green-400 text-sm font-semibold mb-1">✅ CSV includes:</p>
              <p className="text-white/50 text-sm">Author name, comment text, like count, publish date, reply count, and comment type (top-level or reply).</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">What to Do With Your CSV</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {[
                { t: 'Excel / Google Sheets', d: 'Sort by likes, filter keywords, chart engagement over time.' },
                { t: 'Word clouds', d: 'Paste into wordcloud.online to visualize most common themes.' },
                { t: 'Python / Pandas', d: 'Import for sentiment analysis using NLTK or transformers.' },
                { t: 'ChatGPT', d: 'Paste comments and ask for a summary of themes and sentiment.' },
              ].map((item, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4">
                  <p className="font-semibold text-white text-sm mb-1">{item.t}</p>
                  <p className="text-white/50 text-xs">{item.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Free vs Premium</h2>
            <div className="overflow-hidden border border-white/10 rounded-xl text-sm">
              <table className="w-full">
                <thead><tr className="border-b border-white/10 bg-white/3">
                  <th className="text-left px-4 py-3 text-white/60 font-semibold">Feature</th>
                  <th className="text-center px-4 py-3 text-white/60 font-semibold">Free</th>
                  <th className="text-center px-4 py-3 text-white/60 font-semibold">Premium</th>
                </tr></thead>
                <tbody className="divide-y divide-white/5">
                  {[['Downloads/day','5','Unlimited'],['Comments/video','100','10,000'],['CSV export','✅','✅'],['API access','❌','✅'],['Price','Free','₹149/mo']].map(([f,fr,pr],i)=>(
                    <tr key={i}><td className="px-4 py-3 text-white/70">{f}</td><td className="px-4 py-3 text-center text-white/50">{fr}</td><td className="px-4 py-3 text-center text-green-400 font-medium">{pr}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="mt-12 bg-gradient-to-r from-red-900/30 to-red-950/20 border border-red-500/20 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-lg mb-2">Try CommentPull for Free</h3>
          <p className="text-white/50 text-sm mb-4">5 downloads/day · No credit card · Ready in 30 seconds</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm">Download Comments Now →</Link>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5">
          <p className="text-white/40 text-sm font-semibold mb-4">Related articles</p>
          <div className="space-y-3">
            <Link href="/blog/youtube-comment-analysis-guide" className="block hover:text-red-400 transition-colors text-white/70 text-sm">→ YouTube Comment Analysis: How to Turn Comments into Insights</Link>
            <Link href="/blog/best-tools-youtube-creators" className="block hover:text-red-400 transition-colors text-white/70 text-sm">→ 7 Best Free Tools Every YouTube Creator Should Use in 2026</Link>
          </div>
        </div>
      </article>
    </main>
  )
}
