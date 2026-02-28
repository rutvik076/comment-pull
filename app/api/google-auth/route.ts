import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Runs on VERCEL SERVER — generates the Google OAuth URL
// Browser never touches Supabase directly
export async function POST(request: NextRequest) {
  try {
    const appUrl = 'https://comment-pull-rfot.vercel.app'
    const { isLocal } = await request.json().catch(() => ({ isLocal: false }))
    const redirectTo = isLocal ? 'http://localhost:3000/auth/callback' : `${appUrl}/auth/callback`

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'implicit', // No PKCE — server doesn't have localStorage for verifier
        }
      }
    )

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true, // Don't redirect — just return the URL
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'email profile',
      },
    })

    if (error) throw error
    if (!data?.url) throw new Error('No OAuth URL returned from Supabase')

    return NextResponse.json({ url: data.url })
  } catch (e: any) {
    console.error('Google auth error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
