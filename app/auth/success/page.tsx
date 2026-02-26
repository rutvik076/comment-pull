'use client'
// Fallback page — main OAuth flow now completes in /auth/callback
// This page handles any edge cases where a redirect lands here

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSuccess() {
  const router = useRouter()

  useEffect(() => {
    // If user is already in localStorage (set by /auth/callback), go home
    const user = localStorage.getItem('sb_user')
    if (user) { router.replace('/'); return }

    // Otherwise try to get session from Supabase client (handles any implicit flow)
    async function tryGetSession() {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          localStorage.setItem('sb_session', JSON.stringify({ access_token: session.access_token }))
          localStorage.setItem('sb_user', JSON.stringify({ id: session.user.id, email: session.user.email }))
          router.replace('/')
        } else {
          router.replace('/login?error=session_not_found')
        }
      } catch {
        router.replace('/login?error=auth_error')
      }
    }
    tryGetSession()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
        <p className="text-white/60 text-sm">Finishing sign in...</p>
      </div>
    </div>
  )
}
