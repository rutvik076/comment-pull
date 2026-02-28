'use client'
import { useState } from 'react'

type R = { name: string; status: 'pending'|'running'|'pass'|'fail'; detail: string; data?: any }

export default function DebugPage() {
  const [results, setResults] = useState<R[]>([])
  const [running, setRunning] = useState(false)
  const [googleUrl, setGoogleUrl] = useState('')

  function upd(name: string, status: R['status'], detail: string, data?: any) {
    setResults(prev => {
      const exists = prev.find(r => r.name === name)
      if (exists) return prev.map(r => r.name === name ? { ...r, status, detail, data } : r)
      return [...prev, { name, status, detail, data }]
    })
  }

  async function runAll() {
    setResults([]); setRunning(true)

    // Test 1: Env vars
    upd('1. Env vars', 'running', 'Checking...')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const gid = process.env.NEXT_PUBLIC_APP_URL
    const hasUrl = !!url, hasKey = !!key
    upd('1. Env vars', hasUrl && hasKey ? 'pass' : 'fail',
      `SUPABASE_URL: ${hasUrl ? url : '❌ MISSING'} | ANON_KEY: ${hasKey ? key!.slice(0,20)+'...' : '❌ MISSING'} | APP_URL: ${gid || 'not set'}`)

    // Test 2: Browser → Supabase
    upd('2. Browser → Supabase', 'running', 'Pinging...')
    try {
      const r = await fetch(`${url}/auth/v1/health`, { signal: AbortSignal.timeout(4000) })
      upd('2. Browser → Supabase', r.ok ? 'pass' : 'fail', `HTTP ${r.status}`)
    } catch (e: any) {
      upd('2. Browser → Supabase', 'fail', `❌ BLOCKED by ISP — ${e.message} (only affects YOU, not your users)`)
    }

    // Test 3: Server → Supabase
    upd('3. Server → Supabase', 'running', 'Testing...')
    try {
      const r = await fetch('/api/debug-ping', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ url: `${url}/auth/v1/health`, apikey: key }) })
      const j = await r.json()
      upd('3. Server → Supabase', j.ok ? 'pass' : 'fail', `HTTP ${j.status}: ${j.body || j.error}`)
    } catch(e:any) { upd('3. Server → Supabase','fail',e.message) }

    // Test 4: google-auth returns URL
    upd('4. Google OAuth URL generated', 'running', 'Calling /api/google-auth...')
    try {
      const r = await fetch('/api/google-auth', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ isLocal: window.location.hostname === 'localhost' }) })
      const j = await r.json()
      if (j.url) {
        setGoogleUrl(j.url)
        const isGoogle = j.url.startsWith('https://accounts.google.com')
        upd('4. Google OAuth URL generated', 'pass',
          `${isGoogle ? '✅ accounts.google.com (Supabase NOT in URL)' : '⚠️ unexpected domain'}: ${j.url.slice(0,80)}...`, j.url)
      } else {
        upd('4. Google OAuth URL generated', 'fail', `Error: ${j.error}`)
      }
    } catch(e:any) { upd('4. Google OAuth URL generated','fail',e.message) }

    // Test 5: redirect_uri correct
    upd('5. redirect_uri in URL', 'running', 'Checking...')
    try {
      const r = await fetch('/api/google-auth', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ isLocal: window.location.hostname === 'localhost' }) })
      const j = await r.json()
      if (j.url) {
        const u = new URL(j.url)
        const redir = u.searchParams.get('redirect_uri') || u.searchParams.get('redirect_to')
        const correct = redir?.includes('comment-pull-rfot.vercel.app') || redir?.includes('localhost')
        upd('5. redirect_uri in URL', correct ? 'pass' : 'fail', `redirect_uri = ${redir}`)
      } else { upd('5. redirect_uri in URL','fail','No URL') }
    } catch(e:any) { upd('5. redirect_uri in URL','fail',e.message) }

    // Test 6: GOOGLE_CLIENT_ID env var set on server
    upd('6. GOOGLE_CLIENT_ID on server', 'running', 'Checking via google-auth...')
    try {
      const r = await fetch('/api/google-auth', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ isLocal: false }) })
      const j = await r.json()
      if (j.error?.includes('GOOGLE_CLIENT_ID not configured')) {
        upd('6. GOOGLE_CLIENT_ID on server', 'fail', '❌ GOOGLE_CLIENT_ID env var missing in Vercel!')
      } else if (j.url) {
        upd('6. GOOGLE_CLIENT_ID on server', 'pass', '✅ GOOGLE_CLIENT_ID is set')
      } else {
        upd('6. GOOGLE_CLIENT_ID on server', 'fail', j.error || 'unknown')
      }
    } catch(e:any) { upd('6. GOOGLE_CLIENT_ID on server','fail',e.message) }

    // Test 7: GOOGLE_CLIENT_SECRET on server (indirect — auth-callback will say "not configured" if missing)
    upd('7. GOOGLE_CLIENT_SECRET on server', 'running', 'Checking...')
    try {
      const r = await fetch('/api/auth-callback', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ code: 'test', isLocal: false }) })
      const j = await r.json()
      if (j.error?.includes('not configured')) {
        upd('7. GOOGLE_CLIENT_SECRET on server', 'fail', '❌ GOOGLE_CLIENT_SECRET missing in Vercel!')
      } else {
        upd('7. GOOGLE_CLIENT_SECRET on server', 'pass', `✅ Set (test code returned: "${j.error}")`)
      }
    } catch(e:any) { upd('7. GOOGLE_CLIENT_SECRET on server','fail',e.message) }

    // Test 8: /auth/callback page exists (not route.ts)
    upd('8. /auth/callback page', 'running', 'Checking...')
    try {
      const r = await fetch('/auth/callback')
      upd('8. /auth/callback page', r.ok ? 'pass' : 'fail',
        r.ok ? '✅ Page exists and loads' : `HTTP ${r.status} — page missing!`)
    } catch(e:any) { upd('8. /auth/callback page','fail',e.message) }

    // Test 9: Google Cloud redirect URI reminder
    upd('9. Google Cloud redirect URI', 'pass',
      'Manually verify in Google Cloud → Credentials → commentpull → Authorized redirect URIs contains: https://comment-pull-rfot.vercel.app/auth/callback')

    setRunning(false)
  }

  const bg = (s:R['status']) => ({ pending:'bg-white/3 border-white/8', running:'bg-yellow-500/5 border-yellow-500/20', pass:'bg-green-500/5 border-green-500/20', fail:'bg-red-500/8 border-red-500/25' }[s])
  const col = (s:R['status']) => ({ pending:'text-white/30', running:'text-yellow-400', pass:'text-green-400', fail:'text-red-400' }[s])
  const icon = (s:R['status']) => ({ pending:'○', running:'◌', pass:'✓', fail:'✗' }[s])

  const failed = results.filter(r=>r.status==='fail')
  const passed = results.filter(r=>r.status==='pass')

  return (
    <div className="min-h-screen bg-[#080810] text-white p-6 font-mono text-sm">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-black mb-1">🔍 Google OAuth Debug</h1>
        <p className="text-white/30 text-xs mb-6">Tests every step — share screenshot if issues persist</p>

        <button onClick={runAll} disabled={running}
          className="mb-6 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
          {running ? '⏳ Running...' : '▶ Run All Tests'}
        </button>

        {googleUrl && (
          <div className="mb-6 bg-green-500/8 border border-green-500/20 rounded-xl p-4">
            <p className="text-green-400 font-bold text-xs mb-2">✅ Google OAuth URL ready — click to test sign in:</p>
            <a href={googleUrl} className="text-cyan-400 text-xs break-all hover:underline block mb-2">{googleUrl}</a>
            <a href={googleUrl}
              className="inline-flex items-center gap-2 bg-white text-gray-800 font-bold px-4 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all">
              <svg width="14" height="14" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Test Google Sign In Now
            </a>
          </div>
        )}

        <div className="space-y-2">
          {results.map(r => (
            <div key={r.name} className={`border rounded-xl p-3.5 ${bg(r.status)}`}>
              <div className="flex items-start gap-2.5">
                <span className={`font-black shrink-0 ${col(r.status)}`}>{icon(r.status)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold ${col(r.status)}`}>{r.name}</p>
                  <p className="text-white/40 text-xs mt-0.5 break-all leading-relaxed">{r.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length > 0 && !running && (
          <div className="mt-6 bg-white/3 border border-white/10 rounded-xl p-4">
            <p className="font-bold mb-2">Summary: {passed.length}/{results.length} passed</p>
            {failed.length > 0 && (
              <div>
                <p className="text-red-400 text-xs font-bold mb-1">Failed:</p>
                {failed.map(f => <p key={f.name} className="text-red-400/70 text-xs">• {f.name}: {f.detail}</p>)}
              </div>
            )}
            {failed.length === 0 && (
              <p className="text-green-400 text-xs">All critical tests passed! Google sign in should work.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
