import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // redirectTo must be your APP callback URL — Supabase will redirect here after Google auth
    // Supabase handles the Google → Supabase exchange automatically
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://comment-pull-rfot.vercel.app'
    const redirectTo = `${appUrl}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error
    if (!data.url) throw new Error('No OAuth URL returned from Supabase')

    return NextResponse.json({ url: data.url })
  } catch (e: any) {
    console.error('Google auth error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
