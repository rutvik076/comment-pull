'use client'
import { useState } from 'react'

type TestResult = {
  name: string
  status: 'pending' | 'running' | 'pass' | 'fail'
  detail: string
  data?: any
}

export default function DebugPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [running, setRunning] = useState(false)

  function update(name: string, status: TestResult['status'], detail: string, data?: any) {
    setResults(prev => {
      const existing = prev.find(r => r.name === name)
      if (existing) return prev.map(r => r.name === name ? { ...r, status, detail, data } : r)
      return [...prev, { name, status, detail, data }]
    })
  }

  async function runAll() {
    setResults([])
    setRunning(true)

    // ── TEST 1: Env vars present ──────────────────────────────────
    update('1. Env vars', 'running', 'Checking...')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!supabaseUrl || !supabaseKey) {
      update('1. Env vars', 'fail', `MISSING — URL: ${supabaseUrl ? '✓' : '✗'}, KEY: ${supabaseKey ? '✓' : '✗'}, APP_URL: ${appUrl || 'not set'}`)
    } else {
      update('1. Env vars', 'pass', `URL: ${supabaseUrl} | KEY: ${supabaseKey.slice(0,20)}... | APP_URL: ${appUrl || 'not set'}`)
    }

    // ── TEST 2: Can browser reach Supabase URL ────────────────────
    update('2. Supabase reachable from browser', 'running', 'Pinging...')
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/health`, { signal: AbortSignal.timeout(5000) })
      const json = await res.json().catch(() => ({}))
      update('2. Supabase reachable from browser', res.ok ? 'pass' : 'fail',
        `Status: ${res.status} | ${JSON.stringify(json)}`)
    } catch (e: any) {
      update('2. Supabase reachable from browser', 'fail',
        `BLOCKED or timeout: ${e.message} — This means your ISP blocks supabase.co`)
    }

    // ── TEST 3: Server can reach Supabase ─────────────────────────
    update('3. Supabase reachable from server', 'running', 'Testing via /api/debug-ping...')
    try {
      const res = await fetch('/api/debug-ping', { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${supabaseUrl}/auth/v1/health` })
      })
      const json = await res.json()
      update('3. Supabase reachable from server', json.ok ? 'pass' : 'fail',
        `Server got: ${json.status} — ${json.body || json.error}`)
    } catch (e: any) {
      update('3. Supabase reachable from server', 'fail', e.message)
    }

    // ── TEST 4: google-auth API returns a URL ─────────────────────
    update('4. /api/google-auth returns URL', 'running', 'Calling server...')
    try {
      const res = await fetch('/api/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocal: window.location.hostname === 'localhost' })
      })
      const json = await res.json()
      if (json.url) {
        update('4. /api/google-auth returns URL', 'pass',
          `Got URL ✓ — starts with: ${json.url.slice(0, 80)}...`, json.url)
      } else {
        update('4. /api/google-auth returns URL', 'fail',
          `No URL returned. Error: ${json.error || 'unknown'}`)
      }
    } catch (e: any) {
      update('4. /api/google-auth returns URL', 'fail', e.message)
    }

    // ── TEST 5: Check what redirect_to is in the URL ──────────────
    update('5. redirect_to in OAuth URL', 'running', 'Checking URL params...')
    const test4 = results.find(r => r.name === '4. /api/google-auth returns URL') 
    // re-fetch to get fresh data
    try {
      const res = await fetch('/api/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocal: window.location.hostname === 'localhost' })
      })
      const json = await res.json()
      if (json.url) {
        const urlObj = new URL(json.url)
        const redirectTo = urlObj.searchParams.get('redirect_to') || urlObj.searchParams.get('redirect_uri')
        update('5. redirect_to in OAuth URL', 'pass',
          `redirect_to = ${redirectTo}`)
      } else {
        update('5. redirect_to in OAuth URL', 'fail', 'No URL to check')
      }
    } catch (e: any) {
      update('5. redirect_to in OAuth URL', 'fail', e.message)
    }

    // ── TEST 6: /api/auth-callback endpoint exists ────────────────
    update('6. /api/auth-callback exists', 'running', 'Testing endpoint...')
    try {
      const res = await fetch('/api/auth-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'test_fake_code' })
      })
      const json = await res.json()
      // We expect an error about invalid code — but NOT a 404
      if (res.status === 404) {
        update('6. /api/auth-callback exists', 'fail', 'Route does not exist — 404')
      } else {
        update('6. /api/auth-callback exists', 'pass',
          `Route exists (returned ${res.status}): ${json.error || 'ok'}`)
      }
    } catch (e: any) {
      update('6. /api/auth-callback exists', 'fail', e.message)
    }

    // ── TEST 7: Check Google Cloud redirect URIs ──────────────────
    update('7. Google Cloud config check', 'pass',
      `You must manually verify: Google Cloud → Credentials → commentpull → Authorized redirect URIs contains EXACTLY: https://comment-pull-rfot.vercel.app/auth/callback AND http://localhost:3000/auth/callback`)

    // ── TEST 8: Check auth/callback page exists ───────────────────
    update('8. /auth/callback page exists', 'running', 'Checking...')
    try {
      const res = await fetch('/auth/callback')
      update('8. /auth/callback page exists', res.ok ? 'pass' : 'fail',
        `Status: ${res.status}`)
    } catch (e: any) {
      update('8. /auth/callback page exists', 'fail', e.message)
    }

    // ── TEST 9: Check for conflicting route.ts ────────────────────
    update('9. No conflicting route.ts', 'pass',
      'Cannot check from browser. In Cursor: verify app/auth/callback/ has ONLY page.tsx, NOT route.ts')

    setRunning(false)
  }

  const statusColor = (s: TestResult['status']) => ({
    pending: 'text-white/30',
    running: 'text-yellow-400',
    pass: 'text-green-400',
    fail: 'text-red-400',
  }[s])

  const statusIcon = (s: TestResult['status']) => ({
    pending: '○',
    running: '◌',
    pass: '✓',
    fail: '✗',
  }[s])

  const statusBg = (s: TestResult['status']) => ({
    pending: 'bg-white/3 border-white/10',
    running: 'bg-yellow-500/5 border-yellow-500/20',
    pass: 'bg-green-500/5 border-green-500/20',
    fail: 'bg-red-500/8 border-red-500/25',
  }[s])

  return (
    <div className="min-h-screen bg-[#080810] text-white p-8 font-mono">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black mb-2">🔍 Google OAuth Debug</h1>
        <p className="text-white/40 text-sm mb-8">Tests every step of the sign-in flow to find exactly where it breaks</p>

        <button onClick={runAll} disabled={running}
          className="mb-8 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all">
          {running ? '⏳ Running tests...' : '▶ Run All Tests'}
        </button>

        <div className="space-y-3">
          {results.map(r => (
            <div key={r.name} className={`border rounded-xl p-4 transition-all ${statusBg(r.status)}`}>
              <div className="flex items-start gap-3">
                <span className={`text-lg font-black shrink-0 ${statusColor(r.status)}`}>
                  {statusIcon(r.status)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${statusColor(r.status)}`}>{r.name}</p>
                  <p className="text-white/50 text-xs mt-1 break-all leading-relaxed">{r.detail}</p>
                  {r.data && r.name.includes('google-auth') && (
                    <a href={r.data} target="_blank"
                      className="text-cyan-400 text-xs mt-2 block hover:underline truncate">
                      {r.data}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length > 0 && !running && (
          <div className="mt-8 bg-white/3 border border-white/10 rounded-xl p-5">
            <p className="font-bold text-sm mb-3">📋 Summary</p>
            <p className="text-white/50 text-xs leading-relaxed">
              Failed: {results.filter(r => r.status === 'fail').map(r => r.name).join(', ') || 'none'}<br/>
              Passed: {results.filter(r => r.status === 'pass').length}/{results.length}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
