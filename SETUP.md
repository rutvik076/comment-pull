# Setup Steps

## 1. Enable Google OAuth in Supabase
- Supabase → Authentication → Providers → Google → Enable
- Create Google OAuth app at console.cloud.google.com
- Add Client ID + Secret to Supabase
- Add to Authorized redirect URIs: https://jxdzfprmsitrizgkkwnv.supabase.co/auth/v1/callback

## 2. Add to Vercel env vars (already set, no changes needed)

## 3. Files to add/replace:
app/page.tsx                      ← REPLACE
app/login/page.tsx                ← REPLACE
app/dashboard/page.tsx            ← REPLACE
app/api/auth/route.ts             ← REPLACE
app/api/save-download/route.ts    ← REPLACE
app/api/google-auth/route.ts      ← NEW
app/auth/callback/route.ts        ← NEW
app/auth/success/page.tsx         ← NEW

## 4. Deploy
git add .
git commit -m "Full redesign: login gate, Google OAuth, premium lock UI"
git push
