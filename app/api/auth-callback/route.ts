import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { code, isLocal } = await request.json()

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = isLocal
    ? 'http://localhost:3000/auth/callback'
    : 'https://comment-pull-rfot.vercel.app/auth/callback'

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: 'Google credentials not configured' }, { status: 500 })
  }

  try {
    // Step 1: Exchange code with Google
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || tokenData.error) {
      return NextResponse.json({
        error: `Google token exchange failed: ${tokenData.error_description || tokenData.error}`
      }, { status: 400 })
    }

    // Step 2: Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const googleUser = await userRes.json()

    if (!googleUser.email) {
      return NextResponse.json({ error: 'Could not get email from Google' }, { status: 400 })
    }

    // Step 3: Create or find user in Supabase via admin API
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === googleUser.email)

    let userId: string

    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: googleUser.email,
        email_confirm: true,
        user_metadata: {
          full_name: googleUser.name,
          avatar_url: googleUser.picture,
          provider: 'google',
        }
      })
      if (createError || !newUser?.user) {
        return NextResponse.json({ error: createError?.message || 'Failed to create user' }, { status: 500 })
      }
      userId = newUser.user.id
    }

    // Step 4: Generate magic link to get a valid session token
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: googleUser.email,
    })

    if (linkError || !linkData) {
      // Fallback: return Google access token
      return NextResponse.json({
        access_token: tokenData.access_token,
        user: { id: userId, email: googleUser.email }
      })
    }

    // Extract the token from the magic link
    const actionLink = linkData.properties?.action_link || ''
    const tokenHash = new URL(actionLink).searchParams.get('token') || tokenData.access_token

    return NextResponse.json({
      access_token: tokenHash,
      user: { id: userId, email: googleUser.email }
    })

  } catch (e: any) {
    console.error('[auth-callback] Exception:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
