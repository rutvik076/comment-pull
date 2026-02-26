import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    const [downloadsRes, premiumRes] = await Promise.all([
      db.from('downloads').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      db.from('premium_users').select('*').eq('user_id', userId).single()
    ])

    const premium = premiumRes.data
    const isPremium = premium?.is_active === true

    // Check if cancelled but still in grace period
    const isCancelled = !!premium?.cancelled_at
    const renewalDate = premium?.renewal_date || null
    const gracePeriodActive = isCancelled && renewalDate && new Date(renewalDate) > new Date()

    return NextResponse.json({
      downloads: downloadsRes.data || [],
      isPremium: isPremium || !!gracePeriodActive,
      plan: isPremium ? 'premium' : 'free',
      renewalDate,
      activatedAt: premium?.activated_at || null,
      cancelledAt: premium?.cancelled_at || null,
      subscriptionId: premium?.razorpay_subscription_id || null,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
