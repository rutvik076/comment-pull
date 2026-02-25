import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID!
  const keySecret = process.env.RAZORPAY_KEY_SECRET!
  const planId = process.env.RAZORPAY_PLAN_ID!

  if (!keyId || !keySecret || !planId) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
  }

  try {
    const { email, name } = await request.json()

    // Create subscription via Razorpay API
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: 12, // 12 months
        quantity: 1,
        customer_notify: 1,
        notes: {
          email,
          name,
          product: 'CommentPull Premium',
        },
      }),
    })

    const subscription = await response.json()

    if (!response.ok) {
      throw new Error(subscription.error?.description || 'Failed to create subscription')
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId,
    })
  } catch (error: any) {
    console.error('Razorpay order error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
