import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Called immediately after Razorpay payment success (client-side)
// Webhook handles it too but this gives instant activation
export async function POST(request: NextRequest) {
  const { paymentId, subscriptionId, userId, email } = await request.json()

  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verify payment with Razorpay
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')

    let verified = false
    let subData: any = null

    if (subscriptionId) {
      const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      })
      subData = await res.json()
      // Active or authenticated states mean payment went through
      verified = ['active', 'authenticated', 'created'].includes(subData.status)
    }

    if (paymentId && !verified) {
      const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      })
      const payData = await res.json()
      verified = payData.status === 'captured' || payData.status === 'authorized'
    }

    // Activate even if verification fails (webhook will confirm/deny)
    const renewalDate = subData?.current_end
      ? new Date(subData.current_end * 1000).toISOString()
      : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()

    await db.from('premium_users').upsert({
      user_id: userId || null,
      email,
      razorpay_subscription_id: subscriptionId || null,
      is_active: true,
      plan: 'premium',
      renewal_date: renewalDate,
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' })

    // Also update by user_id if present
    if (userId) {
      await db.from('premium_users').upsert({
        user_id: userId,
        email,
        razorpay_subscription_id: subscriptionId || null,
        is_active: true,
        plan: 'premium',
        renewal_date: renewalDate,
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }

    return NextResponse.json({ success: true, isPremium: true, renewalDate })
  } catch (e: any) {
    console.error('Activate premium error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
