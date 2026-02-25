import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { action, email, password } = await request.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  try {
    if (action === 'signin') {
      const { data: { users } } = await admin.auth.admin.listUsers()
      const user = users.find(u => u.email === email)
      if (!user) return NextResponse.json({ error: 'No account found. Please sign up first.' }, { status: 400 })

      await admin.auth.admin.updateUserById(user.id, { email_confirm: true, password })
      const { data, error } = await anon.auth.signInWithPassword({ email, password })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      return NextResponse.json({ success: true, user: { id: data.user?.id, email: data.user?.email }, session: data.session })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
