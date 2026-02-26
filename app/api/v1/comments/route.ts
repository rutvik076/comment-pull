import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

async function validateApiKey(db: any, rawKey: string) {
  if (!rawKey?.startsWith('cp_live_')) return null
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const { data } = await db.from('api_keys').select('id, user_id, requests_count').eq('key_hash', keyHash).single()
  if (!data) return null
  // Update last_used_at and increment counter
  await db.from('api_keys').update({ last_used_at: new Date().toISOString(), requests_count: (data.requests_count || 0) + 1 }).eq('id', data.id)
  return data
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || ''
  const apiKey = authHeader.replace('Bearer ', '').trim() || request.nextUrl.searchParams.get('api_key') || ''

  if (!apiKey) {
    return NextResponse.json({
      error: 'Missing API key',
      message: 'Pass your API key as: Authorization: Bearer cp_live_xxx',
      docs: 'https://comment-pull-rfot.vercel.app/docs',
    }, { status: 401 })
  }

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const keyData = await validateApiKey(db, apiKey)

  if (!keyData) {
    return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 })
  }

  // Verify user is still premium
  const { data: premium } = await db.from('premium_users').select('is_active').eq('user_id', keyData.user_id).single()
  if (!premium?.is_active) {
    return NextResponse.json({ error: 'Premium subscription required for API access. Visit comment-pull-rfot.vercel.app to upgrade.' }, { status: 403 })
  }

  const videoId = request.nextUrl.searchParams.get('videoId') || request.nextUrl.searchParams.get('video_id')
  const videoUrl = request.nextUrl.searchParams.get('url')
  const includeReplies = request.nextUrl.searchParams.get('include_replies') === 'true'
  const maxResults = Math.min(parseInt(request.nextUrl.searchParams.get('max_results') || '100'), 10000)
  const format = request.nextUrl.searchParams.get('format') || 'json' // json | csv

  // Parse video ID from URL if provided
  let vid = videoId
  if (!vid && videoUrl) {
    const patterns = [/(?:v=|\/)([\w-]{11})(?:\?|&|$)/, /youtu\.be\/([\w-]{11})/, /embed\/([\w-]{11})/]
    for (const p of patterns) { const m = videoUrl.match(p); if (m) { vid = m[1]; break } }
  }
  if (!vid) {
    return NextResponse.json({
      error: 'Missing video identifier',
      message: 'Provide either videoId=VIDEO_ID or url=YOUTUBE_URL',
      example: '/api/v1/comments?videoId=dQw4w9WgXcQ',
    }, { status: 400 })
  }

  const YT_API_KEY = process.env.YOUTUBE_API_KEY!
  let allComments: any[] = []
  let nextPageToken = ''

  try {
    do {
      const ytUrl = new URL('https://www.googleapis.com/youtube/v3/commentThreads')
      ytUrl.searchParams.set('part', includeReplies ? 'snippet,replies' : 'snippet')
      ytUrl.searchParams.set('videoId', vid)
      ytUrl.searchParams.set('maxResults', '100')
      ytUrl.searchParams.set('order', 'relevance')
      ytUrl.searchParams.set('key', YT_API_KEY)
      if (nextPageToken) ytUrl.searchParams.set('pageToken', nextPageToken)

      const res = await fetch(ytUrl.toString())
      const data = await res.json()

      if (!res.ok) return NextResponse.json({ error: data.error?.message || 'YouTube API error' }, { status: 400 })
      if (!data.items?.length) break

      for (const item of data.items) {
        const s = item.snippet.topLevelComment.snippet
        allComments.push({
          id: item.id,
          type: 'comment',
          author: s.authorDisplayName,
          text: s.textDisplay.replace(/<[^>]*>/g, ''),
          likes: s.likeCount || 0,
          reply_count: item.snippet.totalReplyCount || 0,
          published_at: s.publishedAt,
          updated_at: s.updatedAt,
        })
        if (includeReplies && item.replies?.comments) {
          for (const reply of item.replies.comments) {
            const rs = reply.snippet
            allComments.push({ id: reply.id, type: 'reply', parent_id: item.id, author: rs.authorDisplayName, text: rs.textDisplay.replace(/<[^>]*>/g, ''), likes: rs.likeCount || 0, reply_count: 0, published_at: rs.publishedAt, updated_at: rs.updatedAt })
          }
        }
        if (allComments.length >= maxResults) break
      }
      nextPageToken = data.nextPageToken || ''
    } while (nextPageToken && allComments.length < maxResults)

    const comments = allComments.slice(0, maxResults)

    // CSV format
    if (format === 'csv') {
      const headers = ['id', 'type', 'author', 'text', 'likes', 'reply_count', 'published_at', 'parent_id']
      const rows = comments.map(c => headers.map(h => {
        const v = (c as any)[h] ?? ''
        return typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
      }).join(','))
      const csv = [headers.join(','), ...rows].join('\n')
      return new NextResponse(csv, {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="comments_${vid}.csv"` }
      })
    }

    // JSON format
    return NextResponse.json({
      success: true,
      video_id: vid,
      total_fetched: comments.length,
      has_more: allComments.length >= maxResults,
      comments,
    }, {
      headers: {
        'X-Total-Comments': String(comments.length),
        'X-Video-ID': vid,
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
