import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This runs on VERCEL SERVER — no ISP DNS blocking issue
// Browser calls this with the code, server exchanges it with Supabase
export async function POST(request: NextRequest) {
  const { code } = await request.json()

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Exchange error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.session || !data.user) {
      return NextResponse.json({ error: 'No session returned' }, { status: 400 })
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    })
  } catch (e: any) {
    console.error('Auth callback error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
