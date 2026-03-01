# CommentPull — Domain + Logo Setup Guide

## 1. LOGO FILES

### Files included:
- `public/favicon.svg`     → Browser tab icon (auto-used by layout.tsx)  
- `public/logo.svg`        → Full logo for use anywhere in app
- `public/manifest.json`   → PWA manifest for mobile home screen

### Files you need to create manually:
These need to be made with a design tool (Canva, Figma, or just use favicon.svg):
- `public/favicon-32x32.png`  → 32×32 PNG version
- `public/icon-192x192.png`   → 192×192 PNG (Android)
- `public/icon-512x512.png`   → 512×512 PNG (Android/PWA)
- `public/apple-touch-icon.png` → 180×180 PNG (iPhone)
- `public/og-image.png`       → 1200×630 PNG (social share preview)

### Quickest way to make PNGs:
1. Go to https://realfavicongenerator.net
2. Upload the favicon.svg
3. Download the full package
4. Copy all files into your /public folder

---

## 2. UPDATE layout.tsx

Replace `app/layout.tsx` with the provided file.
Change this line to your custom domain:
  metadataBase: new URL('https://commentpull.com'),

---

## 3. BUY A DOMAIN

### Recommended registrars:
- **GoDaddy** (godaddy.com) — most popular in India
- **Namecheap** (namecheap.com) — cheapest, ~$10/year
- **Google Domains** → now Squarespace Domains

### Suggested domains to check:
- commentpull.com
- commentpull.in
- getcommentpull.com
- commentpull.io

---

## 4. CONNECT DOMAIN TO VERCEL

### Step 1 — Add domain in Vercel:
1. Go to: vercel.com → commentpull project → Settings → Domains
2. Click "Add Domain"
3. Type your domain: `commentpull.com`
4. Click Add

### Step 2 — Vercel will show you DNS records to add:
It will show something like:
  Type: A      Name: @     Value: 76.76.21.21
  Type: CNAME  Name: www   Value: cname.vercel-dns.com

### Step 3 — Add DNS records in your registrar:
- Log in to GoDaddy / Namecheap
- Go to DNS settings for your domain
- Add the A record and CNAME record exactly as Vercel shows

### Step 4 — Wait 5-30 minutes for DNS to propagate

### Step 5 — Update your env vars:
In Vercel → Settings → Environment Variables, update:
  NEXT_PUBLIC_APP_URL = https://commentpull.com

Also update in app/api/google-auth/route.ts:
  const redirectUri = 'https://commentpull.com/auth/callback'

And in app/api/auth-callback/route.ts:
  const redirectUri = 'https://commentpull.com/auth/callback'

### Step 6 — Add new domain to Google Cloud:
Google Cloud → Credentials → commentpull → Authorized redirect URIs → ADD:
  https://commentpull.com/auth/callback

### Step 7 — Add new domain to Supabase:
Supabase → Authentication → URL Configuration → Site URL:
  https://commentpull.com

---

## 5. SSL CERTIFICATE

Vercel handles this automatically — your site will be HTTPS as soon as DNS connects. No action needed.

---

## SUMMARY CHECKLIST

[ ] Buy domain (Namecheap recommended)
[ ] Add domain in Vercel → Settings → Domains
[ ] Copy DNS records from Vercel to registrar
[ ] Wait for DNS propagation (5-30 min)
[ ] Update NEXT_PUBLIC_APP_URL in Vercel env vars
[ ] Update redirect URI in google-auth/route.ts and auth-callback/route.ts
[ ] Add new domain to Google Cloud authorized redirect URIs
[ ] Update Supabase Site URL
[ ] Redeploy Vercel
[ ] Upload favicon PNGs to /public folder
[ ] Replace app/layout.tsx with provided file
