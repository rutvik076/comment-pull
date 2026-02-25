import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, videoId, commentCount } = await request.json()
    if (!userId || !videoId) {
      return NextResponse.json({ error: 'userId and videoId required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('downloads').insert({
      user_id: userId,
      video_id: videoId,
      comment_count: commentCount,
      created_at: new Date().toISOString(),
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Save download error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
