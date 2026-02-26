'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ArrowRight, Crown, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const [activating, setActivating] = useState(true)
  const [error, setError] = useState('')
  const [renewalDate, setRenewalDate] = useState('')

  useEffect(() => {
    activatePremium()
  }, [])

  async function activatePremium() {
    try {
      const paymentId = searchParams.get('payment_id') || searchParams.get('razorpay_payment_id')
      const subscriptionId = searchParams.get('subscription_id') || searchParams.get('razorpay_subscription_id')

      const userStr = localStorage.getItem('sb_user')
      const user = userStr ? JSON.parse(userStr) : null

      if (!user?.email) {
        setError('Session not found. Please check your dashboard.')
        setActivating(false)
        return
      }

      const res = await fetch('/api/activate-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          subscriptionId,
          userId: user.id,
          email: user.email,
        }),
      })

      const data = await res.json()
      if (data.success) {
        // Update localStorage so rest of app knows immediately
        const session = JSON.parse(localStorage.getItem('sb_session') || '{}')
        session.isPremium = true
        localStorage.setItem('sb_session', JSON.stringify(session))
        if (data.renewalDate) {
          setRenewalDate(new Date(data.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }))
        }
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setActivating(false)
    }
  }

  if (activating) return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-amber-400 animate-spin mx-auto mb-4" size={40} />
        <p className="text-white/60">Activating your Premium account...</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-600/8 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-green-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 text-left">
            <AlertCircle className="text-amber-400 shrink-0" size={20} />
            <div>
              <p className="text-amber-400 font-semibold text-sm">Activation note</p>
              <p className="text-white/50 text-xs mt-0.5">{error} — Your account will be activated within minutes via webhook.</p>
            </div>
          </div>
        )}

        {/* Premium Badge Animation */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 rounded-full flex items-center justify-center">
            <Crown className="text-amber-400" size={52} />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold px-4 py-2 rounded-full mb-5">
          <Crown size={14} />PREMIUM ACTIVATED
        </div>

        <h1 className="text-4xl font-black tracking-tight mb-4">You're Premium! 🎉</h1>
        <p className="text-white/50 text-lg mb-2 leading-relaxed">
          Payment successful. All premium features are now unlocked.
        </p>
        {renewalDate && (
          <p className="text-white/30 text-sm mb-8">Next renewal: {renewalDate}</p>
        )}

        {/* Unlocked features */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Unlocked for you</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '⚡', title: 'Unlimited Downloads', desc: 'No daily limits' },
              { icon: '📊', title: '10,000 Comments', desc: 'Per video' },
              { icon: '📂', title: 'Download History', desc: 'All past downloads' },
              { icon: '🔌', title: 'API Access', desc: 'For organizations' },
            ].map((f, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3.5">
                <div className="text-2xl mb-1.5">{f.icon}</div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-white/40 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-2xl font-bold text-base transition-all">
            Start Downloading <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard" className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-4 rounded-2xl font-semibold text-base transition-all">
            Go to Dashboard
          </Link>
        </div>

        <p className="text-white/25 text-xs mt-6">
          Receipt sent to your email · <Link href="/dashboard/subscription" className="text-white/40 hover:text-white transition-colors">Manage subscription →</Link>
        </p>
      </div>
    </main>
  )
}
