import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { paymentId, subscriptionId, userId, email } = await request.json()
  if (!email && !userId) return NextResponse.json({ error: 'email or userId required' }, { status: 400 })

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
    let subData: any = null

    if (subscriptionId) {
      const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      })
      subData = await res.json()
    }

    const renewalDate = subData?.current_end
      ? new Date(subData.current_end * 1000).toISOString()
      : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()

    const record = {
      user_id: userId || null,
      email: email || null,
      razorpay_subscription_id: subscriptionId || null,
      is_active: true,
      plan: 'premium',
      renewal_date: renewalDate,
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Strategy: check if row exists first, then update or insert
    // This avoids dual-upsert conflict issues

    // 1. Try to find existing row by user_id
    if (userId) {
      const { data: existing } = await db
        .from('premium_users')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existing) {
        // Update existing row
        await db.from('premium_users').update(record).eq('user_id', userId)
        console.log('Updated premium by user_id:', userId)
        return NextResponse.json({ success: true, isPremium: true, renewalDate })
      }
    }

    // 2. Try to find by email
    if (email) {
      const { data: existing } = await db
        .from('premium_users')
        .select('id')
        .eq('email', email)
        .single()

      if (existing) {
        // Update existing row — make sure user_id is set
        await db.from('premium_users').update(record).eq('email', email)
        console.log('Updated premium by email:', email)
        return NextResponse.json({ success: true, isPremium: true, renewalDate })
      }
    }

    // 3. Insert new row
    const { error: insertErr } = await db.from('premium_users').insert(record)
    if (insertErr) {
      console.error('Insert error:', insertErr)
      // Last resort: force update any matching row
      if (userId) await db.from('premium_users').update(record).eq('user_id', userId)
      else if (email) await db.from('premium_users').update(record).eq('email', email)
    }

    console.log('Inserted new premium row for:', email || userId)
    return NextResponse.json({ success: true, isPremium: true, renewalDate })
  } catch (e: any) {
    console.error('Activate premium error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
