import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://comment-pull-rfot.vercel.app'

  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')

  if (error) {
    console.error('OAuth error:', error, errorDesc)
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(errorDesc || error)}`)
  }

  if (code) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.session && data.user) {
        const sessionData = JSON.stringify({
          access_token: data.session.access_token,
          user: { id: data.user.id, email: data.user.email }
        })

        const res = NextResponse.redirect(`${appUrl}/auth/success`)
        res.cookies.set('sb_session_data', sessionData, {
          maxAge: 60,
          path: '/',
          httpOnly: false, // Must be readable by JS
          sameSite: 'lax',
          secure: true,
        })
        return res
      }
    } catch (e: any) {
      console.error('Callback exception:', e)
      return NextResponse.redirect(`${appUrl}/login?error=callback_failed`)
    }
  }

  // No code — maybe hash-based flow, send to success page to handle client-side
  return NextResponse.redirect(`${appUrl}/auth/success`)
}
