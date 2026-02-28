'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Completing sign in...')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDesc = searchParams.get('error_description')

      if (error) {
        setErrorMsg(errorDesc || error)
        setTimeout(() => router.replace(`/login?error=${encodeURIComponent(errorDesc || error)}`), 2000)
        return
      }

      if (!code) {
        // Try hash-based token (implicit flow)
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          await handleHashToken(hash)
          return
        }
        setErrorMsg('No auth code found. Please try signing in again.')
        setTimeout(() => router.replace('/login?error=no_code'), 2000)
        return
      }

      setStatus('Verifying with Google...')

      // ── KEY FIX: Call OUR server API instead of Supabase directly ──
      // This runs on Vercel servers — bypasses any ISP/DNS blocking on user's device
      const res = await fetch('/api/auth-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Sign in failed')
        setTimeout(() => router.replace(`/login?error=${encodeURIComponent(data.error || 'exchange_failed')}`), 2000)
        return
      }

      // Store session in localStorage (same as email login)
      localStorage.setItem('sb_session', JSON.stringify({
        access_token: data.access_token
      }))
      localStorage.setItem('sb_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
      }))

      setStatus('Signed in successfully! Redirecting...')
      setTimeout(() => router.replace('/'), 500)

    } catch (e: any) {
      console.error('Callback error:', e)
      setErrorMsg(e.message || 'Something went wrong')
      setTimeout(() => router.replace(`/login?error=${encodeURIComponent(e.message || 'auth_error')}`), 2000)
    }
  }

  async function handleHashToken(hash: string) {
    try {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      if (!accessToken) {
        router.replace('/login?error=no_token')
        return
      }

      // Call server to validate token and get user
      const res = await fetch(`/api/auth-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken }),
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('sb_session', JSON.stringify({ access_token: data.access_token || accessToken }))
        localStorage.setItem('sb_user', JSON.stringify({ id: data.user.id, email: data.user.email }))
        setStatus('Signed in! Redirecting...')
        setTimeout(() => router.replace('/'), 500)
      } else {
        router.replace('/login?error=token_invalid')
      }
    } catch (e: any) {
      router.replace(`/login?error=${encodeURIComponent(e.message)}`)
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
            <p className="text-white/40 text-sm">{errorMsg}</p>
            <p className="text-white/25 text-xs mt-3">Redirecting to login...</p>
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
