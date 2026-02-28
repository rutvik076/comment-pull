# Deploy Steps

## 1. Add env var in Vercel
GOOGLE_CLIENT_SECRET = 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

## 2. Add these redirect URIs in Google Cloud Console
Google Cloud → Credentials → commentpull → Authorized redirect URIs → ADD:
  https://comment-pull-rfot.vercel.app/auth/callback
  http://localhost:3000/auth/callback

## 3. Replace these 3 files
  app/api/google-auth/route.ts
  app/api/auth-callback/route.ts
  app/auth/callback/page.tsx

## 4. Push → Vercel redeploys

## 5. Run debug page again
https://comment-pull-rfot.vercel.app/debug
Test 4 should now show accounts.google.com URL (not supabase.co)
