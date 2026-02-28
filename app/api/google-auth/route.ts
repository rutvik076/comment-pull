import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { isLocal } = await request.json().catch(() => ({ isLocal: false }))

    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    if (!CLIENT_ID) {
      return NextResponse.json({ error: 'GOOGLE_CLIENT_ID not configured' }, { status: 500 })
    }

    const redirectUri = isLocal
      ? 'http://localhost:3000/auth/callback'
      : 'https://comment-pull-rfot.vercel.app/auth/callback'

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    })

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    return NextResponse.json({ url })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
