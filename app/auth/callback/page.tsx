'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Completing sign in...')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => { handleCallback() }, [])

  async function handleCallback() {
    try {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDesc = searchParams.get('error_description')

      if (error) {
        setErrorMsg(errorDesc || error)
        setTimeout(() => router.replace(`/login?error=${encodeURIComponent(errorDesc || error)}`), 3000)
        return
      }

      if (!code) {
        setErrorMsg('No sign-in code received. Please try again.')
        setTimeout(() => router.replace('/login?error=no_code'), 3000)
        return
      }

      setStatus('Verifying with Google...')

      // Everything runs on server — no browser→Supabase calls
      const isLocal = window.location.hostname === 'localhost'
      const res = await fetch('/api/auth-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, isLocal }),
      })

      const data = await res.json()
      console.log('[callback] auth-callback response:', res.status, data)

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Sign in failed. Please try again.')
        setTimeout(() => router.replace(`/login?error=${encodeURIComponent(data.error || 'failed')}`), 3000)
        return
      }

      // Store session
      localStorage.setItem('sb_session', JSON.stringify({ access_token: data.access_token }))
      localStorage.setItem('sb_user', JSON.stringify({ id: data.user.id, email: data.user.email }))

      setStatus('Signed in! Redirecting...')
      setTimeout(() => router.replace('/'), 500)

    } catch (e: any) {
      console.error('[callback] Error:', e)
      setErrorMsg(e.message || 'Something went wrong')
      setTimeout(() => router.replace(`/login?error=${encodeURIComponent(e.message)}`), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {errorMsg ? (
          <>
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-red-400 text-2xl">✕</span>
            </div>
            <p className="text-red-400 font-semibold mb-2">Sign in failed</p>
            <p className="text-white/50 text-sm mb-1">{errorMsg}</p>
            <p className="text-white/25 text-xs">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <p className="text-white/70 text-sm font-medium">{status}</p>
            <p className="text-white/25 text-xs mt-2">Please wait, do not close this page</p>
          </>
        )}
      </div>
    </div>
  )
}
