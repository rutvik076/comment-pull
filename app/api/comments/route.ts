import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Rate limit: 3 free fetches per IP per day (stored in Supabase)
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; count: number }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('ip', ip)
      .eq('date', today)
      .single()

    if (error || !data) {
      // First request today — create record
      await supabase.from('rate_limits').upsert({ ip, date: today, count: 1 })
      return { allowed: true, count: 1 }
    }

    if (data.count >= 3) return { allowed: false, count: data.count }

    await supabase.from('rate_limits').update({ count: data.count + 1 }).eq('ip', ip).eq('date', today)
    return { allowed: true, count: data.count + 1 }
  } catch {
    // If Supabase fails, allow the request (fail open)
    return { allowed: true, count: 0 }
  }
}

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('videoId')
  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId parameter' }, { status: 400 })
  }

  const YT_API_KEY = process.env.YOUTUBE_API_KEY

  if (!YT_API_KEY) {
    console.error('YOUTUBE_API_KEY is not set in environment variables')
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 })
  }

  // Get IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { allowed, count } = await checkRateLimit(ip)

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Daily limit reached. You have used 3 free downloads today. Upgrade to Premium for unlimited access.',
        upgradeUrl: '/pricing',
      },
      { status: 429 }
    )
  }

  try {
    // Fetch comments from YouTube Data API v3
    const ytUrl = new URL('https://www.googleapis.com/youtube/v3/commentThreads')
    ytUrl.searchParams.set('part', 'snippet')
    ytUrl.searchParams.set('videoId', videoId)
    ytUrl.searchParams.set('maxResults', '100')
    ytUrl.searchParams.set('order', 'relevance')
    ytUrl.searchParams.set('key', YT_API_KEY)

    const response = await fetch(ytUrl.toString())
    const data = await response.json()

    if (!response.ok) {
      const errMsg = data.error?.message || 'YouTube API error'
      if (errMsg.includes('disabled comments')) {
        return NextResponse.json({ error: 'Comments are disabled for this video.' }, { status: 400 })
      }
      return NextResponse.json({ error: errMsg }, { status: response.status })
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'No comments found for this video.' }, { status: 404 })
    }

    const comments = data.items.map((item: any) => {
      const snippet = item.snippet.topLevelComment.snippet
      return {
        author: snippet.authorDisplayName,
        text: snippet.textDisplay.replace(/<[^>]*>/g, ''), // strip HTML
        likes: snippet.likeCount || 0,
        publishedAt: snippet.publishedAt,
        replyCount: item.snippet.totalReplyCount || 0,
      }
    })

    return NextResponse.json({
      comments,
      totalFetched: comments.length,
      remainingFreeToday: Math.max(0, 3 - count),
      videoId,
    })
  } catch (error: any) {
    console.error('Comments API error:', error)
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 })
  }
}