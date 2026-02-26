'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSuccess() {
  const router = useRouter()
  const [status, setStatus] = useState('Signing you in...')

  useEffect(() => {
    async function handleAuth() {
      try {
        // Method 1: Cookie set by server callback route
        const cookies = document.cookie.split(';')
        const sessionCookie = cookies.find(c => c.trim().startsWith('sb_session_data='))

        if (sessionCookie) {
          const raw = decodeURIComponent(sessionCookie.split('=').slice(1).join('='))
          const data = JSON.parse(raw)
          if (data.access_token && data.user) {
            localStorage.setItem('sb_session', JSON.stringify({ access_token: data.access_token }))
            localStorage.setItem('sb_user', JSON.stringify(data.user))
            document.cookie = 'sb_session_data=; max-age=0; path=/'
            setStatus('Redirecting...')
            router.replace('/')
            return
          }
        }

        // Method 2: Hash fragment — Supabase sometimes uses #access_token=...
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          const params = new URLSearchParams(hash.substring(1))
          const accessToken = params.get('access_token')

          if (accessToken) {
            // Get user info from token
            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
              headers: { 'Authorization': `Bearer ${accessToken}`, 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! }
            })
            if (res.ok) {
              const user = await res.json()
              localStorage.setItem('sb_session', JSON.stringify({ access_token: accessToken }))
              localStorage.setItem('sb_user', JSON.stringify({ id: user.id, email: user.email }))
              setStatus('Redirecting...')
              router.replace('/')
              return
            }
          }
        }

        // Method 3: Use Supabase client to get existing session (implicit flow)
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          localStorage.setItem('sb_session', JSON.stringify({ access_token: session.access_token }))
          localStorage.setItem('sb_user', JSON.stringify({ id: session.user.id, email: session.user.email }))
          setStatus('Redirecting...')
          router.replace('/')
          return
        }

        // Nothing worked
        setStatus('Login issue — redirecting...')
        setTimeout(() => router.replace('/login?error=session_not_found'), 2000)

      } catch (e) {
        console.error('Auth success error:', e)
        router.replace('/login?error=auth_error')
      }
    }

    handleAuth()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
        <p className="text-white/60 text-sm">{status}</p>
      </div>
    </div>
  )
}
