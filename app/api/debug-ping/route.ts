import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { url } = await request.json()
  try {
    const res = await fetch(url, {
      headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
      signal: AbortSignal.timeout(5000)
    })
    const body = await res.text()
    return NextResponse.json({ ok: res.ok, status: res.status, body: body.slice(0, 200) })
  } catch (e: any) {
    return NextResponse.json({ ok: false, status: 0, error: e.message })
  }
}
