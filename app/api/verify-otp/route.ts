import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { email, otp, password, name, action } = await request.json()

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ── ACTION: just verify OTP (step 2, no password yet) ──
    if (action === 'verify') {
      const { data: otpRecord, error: otpError } = await supabase
        .from('email_otps')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .single()

      if (otpError || !otpRecord) {
        return NextResponse.json({ error: 'Invalid or expired code. Please try again.' }, { status: 400 })
      }

      if (new Date(otpRecord.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
      }

      // Mark as verified but keep record so password step can use it
      await supabase
        .from('email_otps')
        .update({ verified: true })
        .eq('email', email)

      return NextResponse.json({ success: true, verified: true })
    }

    // ── ACTION: create account (step 3, has password) ──
    if (action === 'create') {
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 })
      }

      // Check OTP was previously verified (verified = true)
      const { data: otpRecord, error: otpError } = await supabase
        .from('email_otps')
        .select('*')
        .eq('email', email)
        .eq('verified', true)
        .single()

      if (otpError || !otpRecord) {
        return NextResponse.json({ error: 'Email not verified. Please start over.' }, { status: 400 })
      }

      // Check not expired (within 30 min of original send)
      const createdAt = new Date(otpRecord.created_at)
      const thirtyMinutes = 30 * 60 * 1000
      if (Date.now() - createdAt.getTime() > thirtyMinutes) {
        return NextResponse.json({ error: 'Session expired. Please start over.' }, { status: 400 })
      }

      // Create user with admin API (auto-confirmed)
      let userId = null
      let session = null
      let user = null

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: name || '' },
      })

      if (createError && createError.message.includes('already been registered')) {
        // User exists — just sign them in
        const anonSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: signInData, error: signInError } = await anonSupabase.auth.signInWithPassword({ email, password })
        if (signInError) throw new Error('Account exists with different password. Try signing in.')
        session = signInData.session
        user = signInData.user
      } else if (createError) {
        throw createError
      } else {
        userId = newUser.user?.id
        // Sign in after creating
        const anonSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: signInData } = await anonSupabase.auth.signInWithPassword({ email, password })
        session = signInData?.session
        user = signInData?.user || newUser.user
      }

      // Clean up OTP record
      await supabase.from('email_otps').delete().eq('email', email)

      return NextResponse.json({
        success: true,
        verified: true,
        user: user ? { id: user.id, email: user.email } : null,
        session,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 })
  }
}
