import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase — bypasses browser/ISP restrictions
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  const { action, email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const supabase = getSupabase()

  try {
    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      return NextResponse.json({
        success: true,
        user: { id: data.user?.id, email: data.user?.email },
        session: data.session,
        message: data.session
          ? 'Account created successfully!'
          : 'Account created! Please check your email to verify.',
      })
    }

    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return NextResponse.json({
        success: true,
        user: { id: data.user?.id, email: data.user?.email },
        session: data.session,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 400 }
    )
  }
}
