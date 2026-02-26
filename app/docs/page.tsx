'use client'

import { useState, useEffect } from 'react'
import { Youtube, Crown, Copy, Check, Key, Trash2, Plus, Eye, EyeOff, Terminal, Zap, Shield, Code2, ChevronRight, AlertCircle, Loader2, RefreshCw, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// ── Syntax-highlighted code block ─────────────────────────────────────────────
function CodeBlock({ code, lang = 'bash', title }: { code: string; lang?: string; title?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/8 my-4 font-mono text-sm">
      {title && (
        <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/8">
          <span className="text-white/40 text-xs font-sans font-semibold uppercase tracking-wider">{title}</span>
          <button onClick={copy} className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors text-xs">
            {copied ? <><Check size={12} className="text-green-400" /><span className="text-green-400">Copied!</span></> : <><Copy size={12} />Copy</>}
          </button>
        </div>
      )}
      {!title && (
        <button onClick={copy} className="absolute top-3 right-3 flex items-center gap-1 text-white/30 hover:text-white transition-colors text-xs px-2 py-1 rounded-lg bg-white/5">
          {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
        </button>
      )}
      <div className="relative bg-[#0d0d18] px-5 py-4 overflow-x-auto">
        {!title && (
          <button onClick={copy} className="absolute top-3 right-3 flex items-center gap-1 text-white/30 hover:text-white transition-colors text-xs px-2 py-1 rounded-lg bg-white/5">
            {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
          </button>
        )}
        <pre className="text-white/80 leading-relaxed whitespace-pre-wrap break-all">{code}</pre>
      </div>
    </div>
  )
}

// ── Parameter row ──────────────────────────────────────────────────────────────
function Param({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex gap-4 py-3.5 border-b border-white/5 last:border-0">
      <div className="w-44 shrink-0">
        <code className="text-red-400 text-sm font-mono">{name}</code>
        {required && <span className="ml-2 text-xs text-red-500/70 font-semibold">required</span>}
      </div>
      <div className="w-20 shrink-0 text-cyan-400/80 text-xs font-mono pt-0.5">{type}</div>
      <div className="text-white/50 text-sm leading-relaxed">{desc}</div>
    </div>
  )
}

// ── Section heading ────────────────────────────────────────────────────────────
function Section({ id, title, badge, children }: { id: string; title: string; badge?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-black tracking-tight">{title}</h2>
        {badge && <span className="text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/25 px-2.5 py-1 rounded-full">{badge}</span>}
      </div>
      {children}
    </section>
  )
}

// ── API Key Manager ────────────────────────────────────────────────────────────
function ApiKeyManager({ user, isPremium }: { user: any; isPremium: boolean }) {
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [newKey, setNewKey] = useState('')  // shown once after creation
  const [showNewKey, setShowNewKey] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { if (user?.id && isPremium) loadKeys() }, [user, isPremium])

  async function loadKeys() {
    setLoading(true)
    try {
      const res = await fetch(`/api/api-keys?userId=${user.id}`)
      if (res.ok) { const d = await res.json(); setKeys(d.keys || []) }
    } catch (e) { }
    setLoading(false)
  }

  async function createKey() {
    if (!newKeyName.trim()) { setError('Please enter a name for your API key'); return }
    setCreating(true); setError('')
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name: newKeyName.trim() })
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setNewKey(d.key); setShowNewKey(true)
      setShowNameInput(false); setNewKeyName('')
      loadKeys()
    } catch (e: any) { setError(e.message) }
    setCreating(false)
  }

  async function deleteKey(keyId: string) {
    setDeletingId(keyId)
    await fetch('/api/api-keys', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, keyId })
    })
    setKeys(k => k.filter(k => k.id !== keyId))
    setDeletingId(null)
  }

  if (!isPremium) return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
      <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Crown className="text-amber-400" size={26} />
      </div>
      <h3 className="font-black text-lg mb-2">Premium Required</h3>
      <p className="text-white/40 text-sm mb-5">API access is available on the Premium plan (₹299/month)</p>
      <Link href="/#pricing" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-6 py-3 rounded-xl transition-all hover:from-amber-400 hover:to-orange-400">
        <Crown size={15} />Upgrade to Premium
      </Link>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* New key revealed banner */}
      {newKey && (
        <div className="bg-green-500/8 border border-green-500/25 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Check className="text-green-400" size={16} />
            <p className="text-green-400 font-bold text-sm">API key created — save it now!</p>
          </div>
          <p className="text-white/40 text-xs mb-3">This key will only be shown once. Copy it and store it securely.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/40 rounded-xl px-4 py-3 text-green-300 text-sm font-mono border border-green-500/20 break-all select-all">
              {showNewKey ? newKey : newKey.slice(0, 14) + '••••••••••••••••••••' + newKey.slice(-4)}
            </code>
            <button onClick={() => setShowNewKey(v => !v)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors shrink-0">
              {showNewKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button onClick={() => { navigator.clipboard.writeText(newKey) }} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors shrink-0">
              <Copy size={15} />
            </button>
          </div>
          <button onClick={() => setNewKey('')} className="mt-3 text-white/30 hover:text-white text-xs transition-colors">
            I've saved it, dismiss
          </button>
        </div>
      )}

      {/* Keys list */}
      {loading ? (
        <div className="flex items-center gap-3 py-6 text-white/40">
          <Loader2 size={16} className="animate-spin" /><span className="text-sm">Loading keys...</span>
        </div>
      ) : keys.length === 0 ? (
        <div className="bg-white/3 border border-dashed border-white/10 rounded-2xl p-8 text-center">
          <Key className="text-white/20 mx-auto mb-3" size={28} />
          <p className="text-white/40 text-sm">No API keys yet. Generate one to get started.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs text-white/30 uppercase tracking-wider border-b border-white/5 font-semibold">
            <div className="col-span-4">Name</div>
            <div className="col-span-4">Key</div>
            <div className="col-span-2 text-center">Requests</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {keys.map(k => (
            <div key={k.id} className="grid grid-cols-12 gap-2 px-5 py-4 hover:bg-white/3 transition-colors items-center border-b border-white/5 last:border-0">
              <div className="col-span-4">
                <p className="font-semibold text-sm text-white/80">{k.name}</p>
                <p className="text-white/30 text-xs mt-0.5">Created {new Date(k.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
              </div>
              <div className="col-span-4">
                <code className="text-cyan-400/80 text-xs font-mono bg-cyan-500/5 border border-cyan-500/15 rounded-lg px-2.5 py-1.5 block truncate">{k.key_preview}</code>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-white/50 text-sm font-mono">{(k.requests_count || 0).toLocaleString()}</span>
              </div>
              <div className="col-span-2 flex justify-end">
                <button onClick={() => deleteKey(k.id)} disabled={deletingId === k.id}
                  className="flex items-center gap-1.5 text-red-400/60 hover:text-red-400 border border-red-500/15 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-40">
                  {deletingId === k.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={13} />{error}</p>}

      {/* Create key */}
      {showNameInput ? (
        <div className="flex gap-2">
          <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createKey()}
            placeholder="e.g. Production App, Analytics Pipeline…"
            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-red-500/50 transition-colors" autoFocus />
          <button onClick={createKey} disabled={creating}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}Generate
          </button>
          <button onClick={() => { setShowNameInput(false); setNewKeyName('') }} className="px-4 py-2.5 text-white/40 hover:text-white border border-white/10 rounded-xl text-sm transition-colors">Cancel</button>
        </div>
      ) : (
        keys.length < 5 && (
          <button onClick={() => setShowNameInput(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all">
            <Plus size={15} />Generate New API Key
          </button>
        )
      )}
    </div>
  )
}

// ── Main docs page ─────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [user, setUser] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    try {
      const u = localStorage.getItem('sb_user')
      if (u) {
        const parsed = JSON.parse(u)
        setUser(parsed)
        if (parsed.id) {
          fetch(`/api/dashboard?userId=${parsed.id}`)
            .then(r => r.json())
            .then(d => setIsPremium(d.isPremium || false))
        }
      }
    } catch (e) {}
  }, [])

  const BASE = 'https://comment-pull-rfot.vercel.app'

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'auth', label: 'Authentication' },
    { id: 'endpoints', label: 'Endpoints' },
    { id: 'parameters', label: 'Parameters' },
    { id: 'responses', label: 'Response Format' },
    { id: 'examples', label: 'Code Examples' },
    { id: 'errors', label: 'Error Codes' },
    { id: 'keys', label: 'My API Keys' },
  ]

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-cyan-600/4 blur-[100px]" />
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 1px 1px,rgba(255,255,255,0.02) 1px,transparent 0)',backgroundSize:'28px 28px'}} />
      </div>

      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#080810]/90 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Youtube size={16} /></div>
              <span className="font-black text-lg tracking-tight">CommentPull</span>
            </Link>
            <span className="text-white/15">/</span>
            <span className="text-white/50 font-semibold">API Reference</span>
          </div>
          <div className="flex items-center gap-3">
            {isPremium && <span className="flex items-center gap-1.5 text-amber-400 text-xs font-bold bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-full"><Crown size={11} />Premium</span>}
            <Link href="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1.5 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex relative z-10">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto py-8 px-4 hidden md:block">
          <p className="text-white/25 text-xs font-bold uppercase tracking-widest mb-4 px-3">Contents</p>
          <nav className="space-y-0.5">
            {navItems.map(item => (
              <a key={item.id} href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`block px-3 py-2.5 rounded-xl text-sm transition-all ${activeSection === item.id ? 'bg-red-500/10 text-red-400 font-semibold' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
                {item.id === 'keys' && isPremium ? <span className="flex items-center gap-2"><Key size={12} />{item.label}</span> : item.label}
              </a>
            ))}
          </nav>

          <div className="mt-8 px-3">
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <p className="text-white/50 text-xs font-semibold mb-2">Base URL</p>
              <code className="text-cyan-400 text-xs font-mono break-all">{BASE}/api/v1</code>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-8 py-10 max-w-3xl">

          {/* Hero */}
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 bg-red-600/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                <Terminal className="text-red-400" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">REST API</span>
                <span className="font-black text-xl tracking-tight leading-none">API Reference</span>
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-4 leading-tight">
              Integrate CommentPull<br />
              <span className="text-red-500">into your systems</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed mb-6">
              The CommentPull REST API lets you programmatically fetch YouTube comments at scale. Available exclusively on the Premium plan.
            </p>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5">
                <Zap className="text-yellow-400" size={14} />
                <span className="text-white/70 text-sm font-medium">Up to 10,000 comments/request</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5">
                <Shield className="text-green-400" size={14} />
                <span className="text-white/70 text-sm font-medium">API key authentication</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5">
                <Code2 className="text-cyan-400" size={14} />
                <span className="text-white/70 text-sm font-medium">JSON + CSV output</span>
              </div>
            </div>
          </div>

          {/* Overview */}
          <Section id="overview" title="Overview">
            <p className="text-white/60 leading-relaxed mb-4">
              All API endpoints are served at <code className="text-cyan-400 bg-cyan-500/8 px-1.5 py-0.5 rounded-lg text-sm">{BASE}/api/v1</code>. The API uses standard HTTP methods and returns JSON by default. CSV output is also supported for direct file downloads.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Protocol', value: 'HTTPS only' },
                { label: 'Format', value: 'JSON / CSV' },
                { label: 'Auth', value: 'Bearer token' },
              ].map((item, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4">
                  <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Authentication */}
          <Section id="auth" title="Authentication">
            <p className="text-white/60 leading-relaxed mb-4">
              Authenticate by passing your API key in the <code className="text-cyan-400 text-sm bg-cyan-500/8 px-1.5 py-0.5 rounded-lg">Authorization</code> header as a Bearer token. Generate your key in the <a href="#keys" className="text-red-400 hover:text-red-300 transition-colors">My API Keys</a> section below.
            </p>
            <CodeBlock title="Authorization Header" code={`Authorization: Bearer cp_live_your_api_key_here`} />
            <CodeBlock title="cURL Example" code={`curl -H "Authorization: Bearer cp_live_xxx" \\
  "${BASE}/api/v1/comments?videoId=dQw4w9WgXcQ"`} />
            <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 mt-2">
              <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={15} />
              <p className="text-white/60 text-sm">Keep your API key secret. Never expose it in client-side code or public repositories. Regenerate it immediately if compromised.</p>
            </div>
          </Section>

          {/* Endpoints */}
          <Section id="endpoints" title="Endpoints" badge="v1">
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex items-start gap-4 px-6 py-5">
                <span className="bg-green-500/15 text-green-400 border border-green-500/25 text-xs font-black px-2.5 py-1 rounded-lg font-mono shrink-0 mt-0.5">GET</span>
                <div className="flex-1 min-w-0">
                  <code className="text-white font-mono text-sm">/api/v1/comments</code>
                  <p className="text-white/50 text-sm mt-2 leading-relaxed">Fetch comments from any public YouTube video. Returns top-level comments and optionally their replies. Supports JSON and CSV output formats.</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Parameters */}
          <Section id="parameters" title="Query Parameters">
            <div className="bg-white/3 border border-white/8 rounded-2xl px-5 divide-y divide-white/5">
              <Param name="videoId" type="string" required desc="YouTube video ID (11 chars). Example: dQw4w9WgXcQ" />
              <Param name="url" type="string" desc="Full YouTube URL. Alternative to videoId. Example: https://youtube.com/watch?v=dQw4w9WgXcQ" />
              <Param name="max_results" type="integer" desc="Max comments to return. Default: 100. Maximum: 10,000." />
              <Param name="include_replies" type="boolean" desc="Include replies to top-level comments. Default: false." />
              <Param name="format" type="string" desc='Response format: "json" (default) or "csv" for direct file download.' />
            </div>
          </Section>

          {/* Responses */}
          <Section id="responses" title="Response Format">
            <p className="text-white/50 text-sm mb-2">Successful JSON response:</p>
            <CodeBlock title="200 OK" lang="json" code={`{
  "success": true,
  "video_id": "dQw4w9WgXcQ",
  "total_fetched": 100,
  "has_more": true,
  "comments": [
    {
      "id": "UgxABC123",
      "type": "comment",
      "author": "John Doe",
      "text": "This is an amazing video!",
      "likes": 42,
      "reply_count": 3,
      "published_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "UgxDEF456",
      "type": "reply",
      "parent_id": "UgxABC123",
      "author": "Jane Smith",
      "text": "I agree completely!",
      "likes": 7,
      "reply_count": 0,
      "published_at": "2024-01-15T11:00:00Z"
    }
  ]
}`} />
          </Section>

          {/* Code Examples */}
          <Section id="examples" title="Code Examples">
            <p className="text-white/50 text-sm mb-1">Replace <code className="text-cyan-400 text-xs">YOUR_API_KEY</code> with your actual key from the section below.</p>

            <CodeBlock title="cURL — JSON" code={`curl -X GET \\
  "${BASE}/api/v1/comments?videoId=dQw4w9WgXcQ&max_results=500" \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />

            <CodeBlock title="cURL — CSV Download" code={`curl -X GET \\
  "${BASE}/api/v1/comments?videoId=dQw4w9WgXcQ&format=csv" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o comments.csv`} />

            <CodeBlock title="JavaScript / Node.js" code={`const API_KEY = 'YOUR_API_KEY';
const VIDEO_ID = 'dQw4w9WgXcQ';

const res = await fetch(
  \`${BASE}/api/v1/comments?videoId=\${VIDEO_ID}&max_results=1000&include_replies=true\`,
  { headers: { 'Authorization': \`Bearer \${API_KEY}\` } }
);

const data = await res.json();
console.log(\`Fetched \${data.total_fetched} comments\`);
data.comments.forEach(c => console.log(c.author, ':', c.text));`} />

            <CodeBlock title="Python" code={`import requests

API_KEY = 'YOUR_API_KEY'
VIDEO_ID = 'dQw4w9WgXcQ'

response = requests.get(
    f'${BASE}/api/v1/comments',
    params={
        'videoId': VIDEO_ID,
        'max_results': 2000,
        'include_replies': 'true'
    },
    headers={'Authorization': f'Bearer {API_KEY}'}
)

data = response.json()
print(f"Fetched {data['total_fetched']} comments")

for comment in data['comments']:
    print(f"{comment['author']}: {comment['text'][:80]}")`} />

            <CodeBlock title="Python — Save as CSV" code={`import requests

response = requests.get(
    '${BASE}/api/v1/comments',
    params={'videoId': 'dQw4w9WgXcQ', 'format': 'csv', 'max_results': 5000},
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

with open('comments.csv', 'wb') as f:
    f.write(response.content)

print("Saved to comments.csv")`} />

            <CodeBlock title="PHP" code={`<?php
$apiKey = 'YOUR_API_KEY';
$videoId = 'dQw4w9WgXcQ';

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => "${BASE}/api/v1/comments?videoId={$videoId}&max_results=500",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer {$apiKey}"],
]);

$response = json_decode(curl_exec($ch), true);
echo "Fetched " . $response['total_fetched'] . " comments";
?>`} />
          </Section>

          {/* Error Codes */}
          <Section id="errors" title="Error Codes">
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              {[
                { code: '200', color: 'green', label: 'OK', desc: 'Request successful' },
                { code: '400', color: 'amber', label: 'Bad Request', desc: 'Missing or invalid parameters (e.g. missing videoId, comments disabled on video)' },
                { code: '401', color: 'red', label: 'Unauthorized', desc: 'Missing or invalid API key' },
                { code: '403', color: 'red', label: 'Forbidden', desc: 'Valid key but Premium subscription has expired or been cancelled' },
                { code: '429', color: 'amber', label: 'Rate Limited', desc: 'Too many requests. Contact support to increase limits.' },
                { code: '500', color: 'red', label: 'Server Error', desc: 'Internal error. Retry after a few seconds.' },
              ].map((e, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4 border-b border-white/5 last:border-0">
                  <code className={`text-xs font-black px-2.5 py-1.5 rounded-lg shrink-0 font-mono ${e.color === 'green' ? 'bg-green-500/15 text-green-400' : e.color === 'amber' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>{e.code}</code>
                  <div>
                    <p className="font-bold text-sm text-white/80">{e.label}</p>
                    <p className="text-white/40 text-sm mt-0.5">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* API Keys section */}
          <Section id="keys" title="My API Keys">
            {!user ? (
              <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
                <Key className="text-white/20 mx-auto mb-4" size={32} />
                <p className="text-white/50 mb-5">Sign in to manage your API keys</p>
                <Link href="/login" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-all">
                  Sign In
                </Link>
              </div>
            ) : (
              <ApiKeyManager user={user} isPremium={isPremium} />
            )}
          </Section>

        </main>
      </div>
    </div>
  )
}
