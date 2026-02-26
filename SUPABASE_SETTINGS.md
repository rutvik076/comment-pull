# CRITICAL: Fix These Settings in Supabase Dashboard

## 1. Enable Email Provider (FIXES "Email logins are disabled")
Supabase → Authentication → Sign In / Providers → Email
- Enable Email provider → ON ✅
- Confirm email → OFF ✅  (no email confirmation needed)
- Click Save

## 2. Fix Google OAuth Redirect URL (FIXES Google login)
Supabase → Authentication → URL Configuration
- Add to "Redirect URLs":
  https://comment-pull-rfot.vercel.app/auth/callback

## 3. Google OAuth App Setup (if not done yet)
Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client
- Add to Authorized redirect URIs:
  https://jxdzfprmsitrizgkkwnv.supabase.co/auth/v1/callback

## 4. Delete broken user accounts
Supabase → Authentication → Users → delete patelrutvik2715@gmail.com
(It's in a broken state, create fresh)
