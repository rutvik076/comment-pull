import Link from 'next/link'
import { Youtube } from 'lucide-react'

export const metadata = {
  title: 'Blog — CommentPull',
  description: 'Tips, guides, and insights about YouTube comment analysis, content strategy, and data export.',
}

const posts = [
  {
    slug: 'how-to-download-youtube-comments',
    title: 'How to Download YouTube Comments as CSV (Free & Easy)',
    excerpt: 'A step-by-step guide to exporting YouTube comments for research, analysis, and content strategy — no coding required.',
    date: 'March 1, 2026',
    readTime: '4 min read',
    tag: 'Tutorial',
    tagColor: 'bg-green-500/10 border-green-500/20 text-green-400',
  },
  {
    slug: 'youtube-comment-analysis-guide',
    title: 'YouTube Comment Analysis: How to Turn Comments into Insights',
    excerpt: 'Learn how to analyze YouTube comments for sentiment, trends, and audience feedback using free tools like Excel and Google Sheets.',
    date: 'March 1, 2026',
    readTime: '6 min read',
    tag: 'Guide',
    tagColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  },
  {
    slug: 'best-tools-youtube-creators',
    title: '7 Best Free Tools Every YouTube Creator Should Use in 2026',
    excerpt: 'From comment analysis to thumbnail testing — the free tools that top creators use to grow their channels faster.',
    date: 'March 1, 2026',
    readTime: '5 min read',
    tag: 'Resources',
    tagColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Youtube size={16} /></div>
            <span className="font-bold text-lg">CommentPull</span>
          </Link>
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Back to home</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="inline-flex items-center bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">Blog</span>
          <h1 className="text-4xl font-black tracking-tight mb-3">Tips & Guides</h1>
          <p className="text-white/50">YouTube analytics, comment strategies, and creator resources.</p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="block bg-white/3 border border-white/8 hover:border-white/20 rounded-2xl p-6 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${post.tagColor}`}>{post.tag}</span>
                <span className="text-white/25 text-xs">{post.date} · {post.readTime}</span>
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-red-400 transition-colors leading-snug">{post.title}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{post.excerpt}</p>
              <span className="inline-flex items-center gap-1 text-red-400 text-sm mt-4 font-medium">
                Read article →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
