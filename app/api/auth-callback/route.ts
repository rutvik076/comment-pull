import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Runs on VERCEL SERVER — handles both code exchange AND token validation
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { code, access_token } = body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // Handle implicit flow: access_token in hash
    if (access_token) {
      const { data: { user }, error } = await supabase.auth.getUser(access_token)
      if (error || !user) {
        return NextResponse.json({ error: error?.message || 'Invalid token' }, { status: 401 })
      }
      return NextResponse.json({
        access_token,
        user: { id: user.id, email: user.email }
      })
    }

    // Handle code flow: exchange code for session
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (!data.session || !data.user) {
        return NextResponse.json({ error: 'No session returned' }, { status: 400 })
      }
      return NextResponse.json({
        access_token: data.session.access_token,
        user: { id: data.user.id, email: data.user.email }
      })
    }

    return NextResponse.json({ error: 'No code or token provided' }, { status: 400 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
