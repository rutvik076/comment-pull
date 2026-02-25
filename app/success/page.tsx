'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ArrowRight, Youtube } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="text-green-400" size={48} />
        </div>

        <h1 className="text-4xl font-black tracking-tight mb-4">
          You're Premium! 🎉
        </h1>
        <p className="text-white/50 text-lg mb-8 leading-relaxed">
          Payment successful. You now have <span className="text-white font-semibold">unlimited downloads</span> and can fetch up to <span className="text-white font-semibold">10,000 comments</span> per video.
        </p>

        {/* Benefits */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
          {[
            '✅ Unlimited downloads per day',
            '✅ Up to 10,000 comments per video',
            '✅ Bulk video processing',
            '✅ Priority support',
            '✅ API access coming soon',
          ].map((benefit, i) => (
            <p key={i} className="text-white/80 text-sm">{benefit}</p>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
        >
          Start Downloading
          <ArrowRight size={20} />
        </Link>

        <p className="text-white/30 text-sm mt-6">
          Receipt sent to your email. Questions? Contact us anytime.
        </p>
      </div>
    </main>
  )
}
