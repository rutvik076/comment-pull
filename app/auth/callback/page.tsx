'use client'
// This MUST be a client-side page — PKCE code_verifier lives in browser localStorage
// A server route cannot access it, so exchangeCodeForSession must run in the browser

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Completing sign in...')

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDesc = searchParams.get('error_description')

      if (error) {
        console.error('OAuth error:', error, errorDesc)
        router.replace(`/login?error=${encodeURIComponent(errorDesc || error)}`)
        return
      }

      if (!code) {
        // No code — check for hash-based token (implicit flow fallback)
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          await handleHashToken(hash)
          return
        }
        router.replace('/login?error=no_code')
        return
      }

      setStatus('Verifying with Google...')

      // Import Supabase CLIENT-SIDE so PKCE verifier is available in localStorage
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // exchangeCodeForSession works here because the PKCE verifier
      // was stored in browser localStorage when signInWithOAuth was called
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange failed:', exchangeError)
        router.replace(`/login?error=${encodeURIComponent(exchangeError.message)}`)
        return
      }

      if (data.session && data.user) {
        // Store in our custom localStorage keys (same as email login)
        localStorage.setItem('sb_session', JSON.stringify({
          access_token: data.session.access_token
        }))
        localStorage.setItem('sb_user', JSON.stringify({
          id: data.user.id,
          email: data.user.email
        }))

        setStatus('Signed in! Redirecting...')
        router.replace('/')
        return
      }

      router.replace('/login?error=no_session')
    } catch (e: any) {
      console.error('Callback error:', e)
      router.replace(`/login?error=${encodeURIComponent(e.message || 'auth_error')}`)
    }
  }

  async function handleHashToken(hash: string) {
    try {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      if (!accessToken) { router.replace('/login?error=no_token'); return }

      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        }
      })
      if (!res.ok) throw new Error('Failed to get user from token')
      const user = await res.json()

      localStorage.setItem('sb_session', JSON.stringify({ access_token: accessToken }))
      localStorage.setItem('sb_user', JSON.stringify({ id: user.id, email: user.email }))
      setStatus('Signed in! Redirecting...')
      router.replace('/')
    } catch (e: any) {
      router.replace(`/login?error=${encodeURIComponent(e.message)}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
        <p className="text-white/60 text-sm font-medium">{status}</p>
        <p className="text-white/25 text-xs mt-2">Please wait, do not close this page</p>
      </div>
    </div>
  )
}
