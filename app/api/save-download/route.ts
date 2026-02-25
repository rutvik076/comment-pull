import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FREE_LIMIT = 5

export async function POST(request: NextRequest) {
  try {
    const { userId, videoId, commentCount } = await request.json()
    if (!userId || !videoId) return NextResponse.json({ error: 'userId and videoId required' }, { status: 400 })

    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const today = new Date().toISOString().split('T')[0]

    const { data: premium } = await db.from('premium_users').select('is_active').eq('user_id', userId).single()
    const isPremium = premium?.is_active === true

    if (!isPremium) {
      const { count } = await db.from('downloads').select('*', { count: 'exact', head: true })
        .eq('user_id', userId).gte('created_at', `${today}T00:00:00Z`).lte('created_at', `${today}T23:59:59Z`)
      const used = count || 0
      if (used >= FREE_LIMIT) return NextResponse.json({ limitReached: true, count: used, limit: FREE_LIMIT }, { status: 429 })
      await db.from('downloads').insert({ user_id: userId, video_id: videoId, comment_count: commentCount, created_at: new Date().toISOString() })
      return NextResponse.json({ success: true, count: used + 1, limit: FREE_LIMIT, remaining: FREE_LIMIT - used - 1 })
    }

    await db.from('downloads').insert({ user_id: userId, video_id: videoId, comment_count: commentCount, created_at: new Date().toISOString() })
    return NextResponse.json({ success: true, isPremium: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ count: 0, limit: FREE_LIMIT, remaining: FREE_LIMIT })

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const today = new Date().toISOString().split('T')[0]

  const { data: premium } = await db.from('premium_users').select('is_active').eq('user_id', userId).single()
  if (premium?.is_active) return NextResponse.json({ isPremium: true, count: 0, limit: null, remaining: null })

  const { count } = await db.from('downloads').select('*', { count: 'exact', head: true })
    .eq('user_id', userId).gte('created_at', `${today}T00:00:00Z`)
  const used = count || 0
  return NextResponse.json({ isPremium: false, count: used, limit: FREE_LIMIT, remaining: FREE_LIMIT - used })
}
