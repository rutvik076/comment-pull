import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function makeKey() {
  return 'cp_live_' + crypto.randomBytes(24).toString('hex')
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: premium } = await db.from('premium_users').select('is_active').eq('user_id', userId).single()
  if (!premium?.is_active) return NextResponse.json({ error: 'API access requires Premium plan' }, { status: 403 })
  const { data: keys } = await db.from('api_keys').select('id, name, key_preview, created_at, last_used_at, requests_count').eq('user_id', userId).order('created_at', { ascending: false })
  return NextResponse.json({ keys: keys || [] })
}

export async function POST(request: NextRequest) {
  const { userId, name } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: premium } = await db.from('premium_users').select('is_active').eq('user_id', userId).single()
  if (!premium?.is_active) return NextResponse.json({ error: 'API access requires Premium plan' }, { status: 403 })
  const { count } = await db.from('api_keys').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  if ((count || 0) >= 5) return NextResponse.json({ error: 'Maximum 5 API keys allowed' }, { status: 400 })
  const fullKey = makeKey()
  const keyPreview = fullKey.slice(0, 14) + '••••••••' + fullKey.slice(-4)
  const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex')
  const { error } = await db.from('api_keys').insert({ user_id: userId, name: name || 'API Key', key_hash: keyHash, key_preview: keyPreview, requests_count: 0, created_at: new Date().toISOString() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ key: fullKey, keyPreview, name: name || 'API Key' })
}

export async function DELETE(request: NextRequest) {
  const { userId, keyId } = await request.json()
  if (!userId || !keyId) return NextResponse.json({ error: 'userId and keyId required' }, { status: 400 })
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await db.from('api_keys').delete().eq('id', keyId).eq('user_id', userId)
  return NextResponse.json({ success: true })
}
