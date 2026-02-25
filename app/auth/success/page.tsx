'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSuccess() {
  const router = useRouter()
  useEffect(() => {
    // Read cookie set by callback route and move to localStorage
    const cookies = document.cookie.split(';')
    const sessionCookie = cookies.find(c => c.trim().startsWith('sb_session_data='))
    if (sessionCookie) {
      try {
        const raw = decodeURIComponent(sessionCookie.split('=').slice(1).join('='))
        const data = JSON.parse(raw)
        localStorage.setItem('sb_session', JSON.stringify({ access_token: data.access_token }))
        localStorage.setItem('sb_user', JSON.stringify(data.user))
        document.cookie = 'sb_session_data=; max-age=0; path=/'
      } catch (e) {}
    }
    router.replace('/')
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40">Signing you in...</p>
      </div>
    </div>
  )
}
