import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FREE_DAILY_LIMIT = 5

export async function POST(request: NextRequest) {
  try {
    const { userId, videoId, commentCount } = await request.json()
    if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const today = new Date().toISOString().split('T')[0]
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    // ── Logged in user ──
    if (userId) {
      // Check if premium
      const { data: premium } = await supabase
        .from('premium_users')
        .select('is_active')
        .eq('user_id', userId)
        .single()

      const isPremium = premium?.is_active || false

      if (!isPremium) {
        // Count today's downloads for this user
        const { count } = await supabase
          .from('downloads')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lte('created_at', `${today}T23:59:59.999Z`)

        const todayCount = count || 0
        if (todayCount >= FREE_DAILY_LIMIT) {
          return NextResponse.json({
            error: 'Daily limit reached',
            limitReached: true,
            count: todayCount,
            limit: FREE_DAILY_LIMIT,
          }, { status: 429 })
        }

        // Save download
        await supabase.from('downloads').insert({
          user_id: userId,
          video_id: videoId,
          comment_count: commentCount,
          created_at: new Date().toISOString(),
        })

        return NextResponse.json({
          success: true,
          count: todayCount + 1,
          limit: FREE_DAILY_LIMIT,
          remaining: FREE_DAILY_LIMIT - (todayCount + 1),
        })
      }

      // Premium — save without limit
      await supabase.from('downloads').insert({
        user_id: userId,
        video_id: videoId,
        comment_count: commentCount,
        created_at: new Date().toISOString(),
      })
      return NextResponse.json({ success: true, count: null, limit: null, remaining: null })
    }

    // ── Guest user — track by IP via rate_limits table ──
    const { data: rateData } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('ip', ip)
      .eq('date', today)
      .single()

    const currentCount = rateData?.count || 0

    if (currentCount >= FREE_DAILY_LIMIT) {
      return NextResponse.json({
        error: 'Daily limit reached',
        limitReached: true,
        count: currentCount,
        limit: FREE_DAILY_LIMIT,
      }, { status: 429 })
    }

    // Increment IP count
    await supabase.from('rate_limits').upsert({
      ip,
      date: today,
      count: currentCount + 1,
    }, { onConflict: 'ip,date' })

    return NextResponse.json({
      success: true,
      count: currentCount + 1,
      limit: FREE_DAILY_LIMIT,
      remaining: FREE_DAILY_LIMIT - (currentCount + 1),
    })

  } catch (err: any) {
    console.error('Save download error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET — check how many downloads used today
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const today = new Date().toISOString().split('T')[0]
    const userId = request.nextUrl.searchParams.get('userId')
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    if (userId) {
      const { data: premium } = await supabase
        .from('premium_users')
        .select('is_active')
        .eq('user_id', userId)
        .single()

      if (premium?.is_active) {
        return NextResponse.json({ count: 0, limit: null, remaining: null, isPremium: true })
      }

      const { count } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)

      return NextResponse.json({
        count: count || 0,
        limit: FREE_DAILY_LIMIT,
        remaining: FREE_DAILY_LIMIT - (count || 0),
        isPremium: false,
      })
    }

    // Guest
    const { data: rateData } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('ip', ip)
      .eq('date', today)
      .single()

    const count = rateData?.count || 0
    return NextResponse.json({
      count,
      limit: FREE_DAILY_LIMIT,
      remaining: FREE_DAILY_LIMIT - count,
      isPremium: false,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
