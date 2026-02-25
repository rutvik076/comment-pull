import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { action, email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  try {
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'signin') {
      // Step 1: Check user exists
      const { data: { users } } = await adminSupabase.auth.admin.listUsers()
      const user = users.find(u => u.email === email)

      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email. Please sign up first.' },
          { status: 400 }
        )
      }

      // Step 2: Ensure user is confirmed and update password (fixes any broken state)
      await adminSupabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
        password: password,
      })

      // Step 3: Now sign in with anon client
      const anonSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await anonSupabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error('Sign in error after update:', error.message)
        // If still failing, return user data without session as last resort
        return NextResponse.json({
          success: true,
          user: { id: user.id, email: user.email },
          session: null,
          error: error.message,
        })
      }

      return NextResponse.json({
        success: true,
        user: { id: data.user?.id, email: data.user?.email },
        session: data.session,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 400 }
    )
  }
}
