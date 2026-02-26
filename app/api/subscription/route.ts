import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getRazorpay = () => Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')

// GET — fetch subscription info
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: premium } = await db
    .from('premium_users')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!premium) return NextResponse.json({ isPremium: false })

  // Get live subscription status from Razorpay
  let razorpayStatus = null
  if (premium.razorpay_subscription_id) {
    try {
      const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${premium.razorpay_subscription_id}`, {
        headers: { 'Authorization': `Basic ${getRazorpay()}` }
      })
      const sub = await res.json()
      razorpayStatus = sub.status
      // Sync renewal date
      if (sub.current_end) {
        await db.from('premium_users').update({
          renewal_date: new Date(sub.current_end * 1000).toISOString()
        }).eq('user_id', userId)
        premium.renewal_date = new Date(sub.current_end * 1000).toISOString()
      }
    } catch (e) { /* ignore */ }
  }

  return NextResponse.json({
    isPremium: premium.is_active,
    plan: premium.plan || 'premium',
    activatedAt: premium.activated_at,
    renewalDate: premium.renewal_date,
    cancelledAt: premium.cancelled_at,
    subscriptionId: premium.razorpay_subscription_id,
    razorpayStatus,
  })
}

// DELETE — cancel subscription
export async function DELETE(request: NextRequest) {
  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: premium } = await db
    .from('premium_users')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!premium?.razorpay_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  try {
    // Cancel in Razorpay (at period end)
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${premium.razorpay_subscription_id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${getRazorpay()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancel_at_cycle_end: 1 }), // Cancel at end of billing cycle
    })
    const data = await res.json()

    if (!res.ok && data.error?.code !== 'BAD_REQUEST_ERROR') {
      throw new Error(data.error?.description || 'Failed to cancel subscription')
    }

    // Mark as cancelled in DB (keep is_active=true until period ends)
    await db.from('premium_users').update({
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled. Premium stays active until your billing period ends.',
      renewalDate: premium.renewal_date,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
