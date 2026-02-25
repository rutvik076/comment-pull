import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session) {
      const res = NextResponse.redirect(`${origin}/auth/success`)
      // Pass session info via cookie so client can pick it up
      res.cookies.set('sb_session_data', JSON.stringify({
        access_token: data.session.access_token,
        user: { id: data.user?.id, email: data.user?.email }
      }), { maxAge: 60, path: '/' })
      return res
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
