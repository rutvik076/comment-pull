import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { email, otp, password, name, action } = await request.json()

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
  }

  try {
    // Always use service role — bypasses all auth provider settings
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ── STEP 2: Verify OTP only ──
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

      await supabase.from('email_otps').update({ verified: true }).eq('email', email)
      return NextResponse.json({ success: true, verified: true })
    }

    // ── STEP 3: Create account + return session ──
    if (action === 'create') {
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 })
      }

      // Confirm OTP was verified
      const { data: otpRecord, error: otpError } = await supabase
        .from('email_otps')
        .select('*')
        .eq('email', email)
        .eq('verified', true)
        .single()

      if (otpError || !otpRecord) {
        return NextResponse.json({ error: 'Email not verified. Please start over.' }, { status: 400 })
      }

      // Check 30-min window
      if (Date.now() - new Date(otpRecord.created_at).getTime() > 30 * 60 * 1000) {
        return NextResponse.json({ error: 'Session expired. Please start over.' }, { status: 400 })
      }

      // Try to create user — admin API, email auto-confirmed, bypasses email provider setting
      let userId: string | undefined
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: name || '' },
      })

      if (createError && !createError.message.includes('already been registered')) {
        throw createError
      }

      userId = newUser?.user?.id

      // If user already existed, get their ID
      if (!userId) {
        const { data: { users } } = await supabase.auth.admin.listUsers()
        const existing = users.find(u => u.email === email)
        if (existing) userId = existing.id
      }

      // Update password if user already existed
      if (userId) {
        await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true })
      }

      // Generate session using admin — no email provider needed
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })

      // Clean up OTP
      await supabase.from('email_otps').delete().eq('email', email)

      // Return user info — we'll create a pseudo-session on the client
      return NextResponse.json({
        success: true,
        verified: true,
        userId,
        email,
        // Client will use /api/auth to sign in with the new password
        readyToSignIn: true,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 })
  }
}
