import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    // Fetch downloads
    const { data: downloads } = await db
      .from('downloads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Look up premium by user_id first
    let { data: premium } = await db
      .from('premium_users')
      .select('*')
      .eq('user_id', userId)
      .single()

    // If not found by user_id, try by email (handles users created before user_id was stored)
    if (!premium) {
      const { data: { user } } = await db.auth.admin.getUserById(userId)
      if (user?.email) {
        const { data: premiumByEmail } = await db
          .from('premium_users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (premiumByEmail) {
          premium = premiumByEmail
          // Backfill user_id so next lookup works
          await db.from('premium_users')
            .update({ user_id: userId })
            .eq('email', user.email)
        }
      }
    }

    const isPremium = premium?.is_active === true
    const isCancelled = !!premium?.cancelled_at
    const renewalDate = premium?.renewal_date || null
    const gracePeriodActive = isCancelled && renewalDate && new Date(renewalDate) > new Date()

    return NextResponse.json({
      downloads: downloads || [],
      isPremium: isPremium || !!gracePeriodActive,
      plan: (isPremium || gracePeriodActive) ? 'premium' : 'free',
      renewalDate,
      activatedAt: premium?.activated_at || null,
      cancelledAt: premium?.cancelled_at || null,
      subscriptionId: premium?.razorpay_subscription_id || null,
    })
  } catch (e: any) {
    console.error('Dashboard error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
