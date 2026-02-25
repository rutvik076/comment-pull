import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('videoId')
  const includeReplies = request.nextUrl.searchParams.get('includeReplies') === 'true'
  const isPremium = request.nextUrl.searchParams.get('isPremium') === 'true'

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId parameter' }, { status: 400 })
  }

  const YT_API_KEY = process.env.YOUTUBE_API_KEY
  if (!YT_API_KEY) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 })
  }

  // Free = 100 comments max, Premium = up to 10,000
  const maxComments = isPremium ? 10000 : 100

  try {
    let allComments: any[] = []
    let nextPageToken = ''
    const maxResultsPerPage = 100

    // Fetch pages until we hit our limit
    do {
      const ytUrl = new URL('https://www.googleapis.com/youtube/v3/commentThreads')
      ytUrl.searchParams.set('part', includeReplies ? 'snippet,replies' : 'snippet')
      ytUrl.searchParams.set('videoId', videoId)
      ytUrl.searchParams.set('maxResults', String(maxResultsPerPage))
      ytUrl.searchParams.set('order', 'relevance')
      ytUrl.searchParams.set('key', YT_API_KEY)
      if (nextPageToken) ytUrl.searchParams.set('pageToken', nextPageToken)

      const response = await fetch(ytUrl.toString())
      const data = await response.json()

      if (!response.ok) {
        const errMsg = data.error?.message || 'YouTube API error'
        if (errMsg.toLowerCase().includes('disabled')) {
          return NextResponse.json({ error: 'Comments are disabled for this video.' }, { status: 400 })
        }
        return NextResponse.json({ error: errMsg }, { status: response.status })
      }

      if (!data.items?.length) break

      for (const item of data.items) {
        const snippet = item.snippet.topLevelComment.snippet
        const comment: any = {
          id: item.id,
          author: snippet.authorDisplayName,
          text: snippet.textDisplay.replace(/<[^>]*>/g, ''),
          likes: snippet.likeCount || 0,
          publishedAt: snippet.publishedAt,
          replyCount: item.snippet.totalReplyCount || 0,
          isReply: false,
        }
        allComments.push(comment)

        // Include replies if requested
        if (includeReplies && item.replies?.comments?.length) {
          for (const reply of item.replies.comments) {
            const rs = reply.snippet
            allComments.push({
              id: reply.id,
              author: rs.authorDisplayName,
              text: rs.textDisplay.replace(/<[^>]*>/g, ''),
              likes: rs.likeCount || 0,
              publishedAt: rs.publishedAt,
              replyCount: 0,
              isReply: true,
              parentId: item.id,
            })
          }
        }

        if (allComments.length >= maxComments) break
      }

      nextPageToken = data.nextPageToken || ''
    } while (nextPageToken && allComments.length < maxComments && isPremium)

    // Cap to limit
    const comments = allComments.slice(0, maxComments)

    return NextResponse.json({
      comments,
      totalFetched: comments.length,
      hasMore: !isPremium && allComments.length >= 100, // tells frontend there are more
      videoId,
    })
  } catch (error: any) {
    console.error('Comments API error:', error)
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 })
  }
}
