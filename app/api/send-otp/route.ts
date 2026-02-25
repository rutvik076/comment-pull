import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Beautiful HTML email template
function getEmailTemplate(otp: string, email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email - CommentPull</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background:#111118;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 14px;margin-bottom:12px;">
                    <span style="color:white;font-size:20px;">▶</span>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;color:white;font-size:22px;font-weight:800;letter-spacing:-0.5px;">CommentPull</div>
              <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px;">YouTube Comments Downloader</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="color:white;font-size:24px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px;">Verify your email</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:15px;margin:0 0 32px;line-height:1.6;">
                Use the code below to verify <strong style="color:rgba(255,255,255,0.8);">${email}</strong> and complete your account setup.
              </p>
              
              <!-- OTP Box -->
              <div style="background:rgba(220,38,38,0.08);border:2px solid rgba(220,38,38,0.3);border-radius:16px;padding:28px;text-align:center;margin-bottom:32px;">
                <div style="color:rgba(255,255,255,0.4);font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Your verification code</div>
                <div style="color:white;font-size:42px;font-weight:900;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</div>
                <div style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:12px;">⏱ Expires in 10 minutes</div>
              </div>

              <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;margin:0;">
                If you didn't request this, you can safely ignore this email. Someone may have entered your email by mistake.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.06);padding:20px 40px;text-align:center;">
              <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">
                © 2025 CommentPull by Crestlabs · Built with ❤️ in India
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

  try {
    // Store OTP in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase.from('email_otps').upsert({
      email,
      otp,
      expires_at: expiresAt,
      verified: false,
      created_at: new Date().toISOString(),
    }, { onConflict: 'email' })

    // Send OTP via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CommentPull <onboarding@resend.dev>',
        to: [email],
        subject: `${otp} is your CommentPull verification code`,
        html: getEmailTemplate(otp, email),
      }),
    })

    if (!resendRes.ok) {
      const err = await resendRes.json()
      throw new Error(err.message || 'Failed to send email')
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })

  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 })
  }
}
