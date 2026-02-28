import { NextRequest, NextResponse } from 'next/server'

// Tests if the SERVER can reach a URL — helps diagnose DNS issues
export async function POST(request: NextRequest) {
  const { url } = await request.json()
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    const body = await res.text()
    return NextResponse.json({ ok: res.ok, status: res.status, body: body.slice(0, 200) })
  } catch (e: any) {
    return NextResponse.json({ ok: false, status: 0, error: e.message })
  }
}
