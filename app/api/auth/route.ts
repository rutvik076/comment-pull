import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { action, email, password } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    if (action === 'signin') {
      // With Supabase OTP flow, signin happens via verifyOtp directly
      // This endpoint is kept as fallback for password signin
      if (!password) {
        return NextResponse.json({ error: 'Password required' }, { status: 400 })
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        user: { id: data.user?.id, email: data.user?.email },
        session: data.session,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (e: any) {
    console.error('Auth error:', e)
    return NextResponse.json({ error: e.message || 'Authentication failed' }, { status: 500 })
  }
}