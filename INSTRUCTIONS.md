# Google Sign In Fix

## Root Cause
The previous code called `supabase.auth.signInWithOAuth()` inside a **server-side API route**
(`/api/google-auth/route.ts`). This broke because:

- Supabase v2 uses **PKCE flow** by default for security
- PKCE generates a `code_verifier` that must be stored in **browser localStorage**
- A server-side route has NO browser storage — the verifier is immediately lost
- When Google redirects back with a `code`, `exchangeCodeForSession()` fails because
  the verifier is gone → user stays logged out silently

## The Fix (3 files changed)

### 1. DELETE this file from your project:
   app/auth/callback/route.ts   ← DELETE IT (replaced by page.tsx below)

### 2. ADD/REPLACE these 3 files:
   app/auth/callback/page.tsx   ← NEW client-side page (replaces the server route)
   app/auth/success/page.tsx    ← REPLACE (simplified fallback)
   app/login/page.tsx           ← REPLACE (OAuth now runs client-side)

## What Changed
- `login/page.tsx` — `handleGoogleLogin` now imports Supabase and calls
  `signInWithOAuth()` DIRECTLY IN THE BROWSER. Supabase stores the PKCE verifier
  in localStorage automatically.

- `auth/callback/page.tsx` — This is now a CLIENT-SIDE React page (not a server
  route). It reads the `code` from the URL and calls `exchangeCodeForSession()`
  in the browser where the PKCE verifier is available.

- `auth/auth/success/page.tsx` — Simplified fallback for edge cases.

## Deploy
1. Delete `app/auth/callback/route.ts` from your project
2. Add the 3 files from this zip
3. git add . && git commit -m "fix: Google OAuth PKCE flow" && git push
