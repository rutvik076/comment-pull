import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function verifySignature(body: string, signature: string, secret: string): boolean {
  return crypto.createHmac('sha256', secret).update(body).digest('hex') === signature
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature') || ''

  if (!verifySignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET!)) {
    console.error('Invalid webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  console.log('Webhook event:', event.event)

  switch (event.event) {
    case 'subscription.activated':
    case 'subscription.charged': {
      const sub = event.payload.subscription.entity
      const payment = event.payload.payment?.entity
      const email = sub.notes?.email || payment?.email

      if (!email) { console.error('No email in webhook payload'); break }

      // Get user ID from Supabase auth using admin API
      const { data: { users } } = await db.auth.admin.listUsers()
      const user = users.find(u => u.email === email)
      const userId = user?.id || null

      // Calculate next renewal
      const currentEnd = sub.current_end
      const renewalDate = currentEnd
        ? new Date(currentEnd * 1000).toISOString()
        : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()

      await db.from('premium_users').upsert({
        user_id: userId,
        email,
        razorpay_subscription_id: sub.id,
        razorpay_plan_id: sub.plan_id,
        is_active: true,
        plan: 'premium',
        renewal_date: renewalDate,
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' })

      console.log(`✅ Premium activated: ${email}, renewal: ${renewalDate}`)
      break
    }

    case 'subscription.cancelled': {
      const sub = event.payload.subscription.entity
      // Keep premium active until billing period ends (grace period)
      const endDate = sub.ended_at
        ? new Date(sub.ended_at * 1000).toISOString()
        : new Date().toISOString()

      await db.from('premium_users').update({
        is_active: true, // Keep active until period ends
        cancelled_at: new Date().toISOString(),
        renewal_date: endDate, // This becomes the expiry date
        updated_at: new Date().toISOString(),
      }).eq('razorpay_subscription_id', sub.id)

      console.log(`⚠️ Premium cancelled (active until ${endDate}): ${sub.id}`)
      break
    }

    case 'subscription.completed':
    case 'subscription.halted': {
      const sub = event.payload.subscription.entity
      await db.from('premium_users').update({
        is_active: false,
        updated_at: new Date().toISOString(),
      }).eq('razorpay_subscription_id', sub.id)

      console.log(`❌ Premium deactivated: ${sub.id}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}
