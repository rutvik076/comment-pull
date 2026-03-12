import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { comments, videoId, userId } = await request.json()

    // Validate input
    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return NextResponse.json({ error: 'No comments provided' }, { status: 400 })
    }

    // Check if user is premium (AI summary is a Pro feature)
    if (userId) {
      const db = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: premium } = await db
        .from('premium_users')
        .select('is_active, plan')
        .eq('user_id', userId)
        .single()

      if (!premium?.is_active) {
        return NextResponse.json(
          { error: 'AI Summary is a Pro feature. Please upgrade to access it.' },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Please sign in to use AI Summary.' },
        { status: 401 }
      )
    }

    // Prepare comments text — limit to 300 comments to stay within token limits
    const commentsText = comments
      .slice(0, 300)
      .map((c: any, i: number) => `${i + 1}. [${c.likes || 0} likes] ${c.text}`)
      .join('\n')

    const totalComments = comments.length

    // Build the Gemini prompt
    const prompt = `You are an expert YouTube audience analyst. Analyze the following ${totalComments} YouTube comments and provide a structured JSON response.

COMMENTS:
${commentsText}

Respond ONLY with a valid JSON object. No markdown, no backticks, no extra text. Use this exact structure:

{
  "sentimentScore": 8.2,
  "sentimentLabel": "Very Positive",
  "sentimentBreakdown": {
    "positive": 76,
    "neutral": 18,
    "negative": 6
  },
  "summary": "A 2-3 sentence plain English summary of what the audience thinks overall.",
  "topThemes": [
    { "theme": "Theme name", "count": 45, "sentiment": "positive" },
    { "theme": "Theme name", "count": 32, "sentiment": "neutral" },
    { "theme": "Theme name", "count": 28, "sentiment": "negative" },
    { "theme": "Theme name", "count": 21, "sentiment": "positive" },
    { "theme": "Theme name", "count": 15, "sentiment": "positive" }
  ],
  "topQuestions": [
    "Question from audience?",
    "Another question?",
    "Third question?",
    "Fourth question?",
    "Fifth question?"
  ],
  "suggestions": [
    "Suggested next video idea based on comments",
    "Another video idea",
    "Third video idea"
  ],
  "highlights": {
    "mostLikedComment": "The actual text of the most liked comment",
    "mostEngaging": "A notable comment worth highlighting"
  },
  "audienceType": "Short description of who is commenting e.g. beginners, professionals, fans"
}

Rules:
- sentimentScore is out of 10
- sentimentBreakdown values must add up to 100
- topThemes sentiment must be one of: positive, neutral, negative
- All counts are approximate based on theme frequency
- Be specific and accurate based on the actual comments provided`

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Parse JSON response safely
    let analysis
    try {
      // Strip any accidental markdown backticks if present
      const clean = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
      analysis = JSON.parse(clean)
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText)
      return NextResponse.json(
        { error: 'AI analysis failed. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis,
      totalAnalyzed: Math.min(totalComments, 300),
      totalComments,
    })

  } catch (error: any) {
    console.error('AI Summary error:', error)

    // Handle Gemini quota exceeded
    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        { error: 'AI service is temporarily busy. Please try again in a minute.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}