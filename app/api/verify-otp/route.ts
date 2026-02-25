import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { email, otp, password, name } = await request.json()

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('verified', false)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired code. Please try again.' }, { status: 400 })
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
    }

    // Mark OTP as used
    await supabase.from('email_otps').update({ verified: true }).eq('email', email)

    // Create or sign in user
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let session = null
    let user = null

    if (password) {
      // New signup — create account
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm since we verified via OTP
        user_metadata: { name: name || '' },
      })

      if (signUpError) {
        // User might already exist — try sign in
        const { data: signInData, error: signInError } = await anonSupabase.auth.signInWithPassword({ email, password })
        if (signInError) throw new Error('Account creation failed. Try signing in instead.')
        session = signInData.session
        user = signInData.user
      } else {
        // Sign in after creating
        const { data: signInData } = await anonSupabase.auth.signInWithPassword({ email, password })
        session = signInData?.session
        user = signInData?.user || signUpData.user
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      user: user ? { id: user.id, email: user.email } : null,
      session,
    })

  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 })
  }
}
