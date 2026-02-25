import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature') || ''
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!

  // Verify signature
  if (!verifyWebhookSignature(body, signature, webhookSecret)) {
    console.error('Invalid Razorpay webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('Razorpay webhook event:', event.event)

  switch (event.event) {
    case 'subscription.activated':
    case 'subscription.charged': {
      const subscription = event.payload.subscription.entity
      const email = subscription.notes?.email

      if (email) {
        // Find user by email
        const { data: users } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', email)
          .limit(1)

        const userId = users?.[0]?.id

        await supabase.from('premium_users').upsert({
          user_id: userId || null,
          email,
          razorpay_subscription_id: subscription.id,
          is_active: true,
          expires_at: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })

        console.log(`✅ Premium activated for: ${email}`)
      }
      break
    }

    case 'subscription.cancelled':
    case 'subscription.completed': {
      const subscription = event.payload.subscription.entity
      await supabase
        .from('premium_users')
        .update({ is_active: false })
        .eq('razorpay_subscription_id', subscription.id)

      console.log(`❌ Premium cancelled: ${subscription.id}`)
      break
    }

    case 'subscription.halted': {
      // Payment failed repeatedly
      const subscription = event.payload.subscription.entity
      await supabase
        .from('premium_users')
        .update({ is_active: false })
        .eq('razorpay_subscription_id', subscription.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
