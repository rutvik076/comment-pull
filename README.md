# 🎯 CommentPull — YouTube Comments Downloader
### Built by Crestlabs | Live: https://comment-pull-rfot.vercel.app
### GitHub: https://github.com/rutvik076/comment-pull

---

## 🟢 STAGE: MVP LIVE — Now Growing to First ₹10,000/month

---

## ✅ COMPLETED (100% Done & Live)

### 🛠️ Core Product
- [x] Homepage with hero, features, pricing sections
- [x] YouTube URL → fetch 100 comments via YouTube Data API v3
- [x] CSV export (author, text, likes, date, replies)
- [x] Rate limiting — 3 free downloads/day per IP
- [x] Dark UI, mobile responsive, animated background
- [x] "No signup needed" messaging for free users

### 🔐 Authentication System
- [x] Professional OTP email verification (via Resend)
- [x] 6-digit animated code input with auto-focus + paste support
- [x] Password strength indicator
- [x] Server-side auth (ISP-bypass — all calls via Vercel, not browser)
- [x] Singleton Supabase client (no duplicate instance warnings)
- [x] Sign in / Sign out
- [x] Session stored in localStorage
- [x] Separate verify + create account actions (OTP double-use bug fixed)

### 💳 Payments
- [x] Razorpay integration — ₹149/month subscription
- [x] 2-step checkout: Create account → Pay
- [x] Razorpay webhook → activates premium in Supabase
- [x] Premium badge in navbar (gold crown)
- [x] Success page after payment
- [x] UPI / Cards / NetBanking / EMI supported

### 📊 Dashboard
- [x] Download history table (video ID, comment count, date)
- [x] Stats: total downloads, today's count, plan, this month
- [x] Upgrade nudge for free users
- [x] Server-side data fetch (auth token based)

### ☁️ Infrastructure
- [x] Next.js 14 + Tailwind CSS
- [x] Supabase PostgreSQL — tables: rate_limits, downloads, premium_users, email_otps
- [x] Vercel deployment with auto-deploy on git push
- [x] All environment variables configured in Vercel
- [x] Duplicate Vercel deployment deleted (keeping comment-pull-rfot)

---

## 🔄 IN PROGRESS (Partially Done)

### Razorpay Live Mode
- [x] Test keys added and working (rzp_test_...)
- [ ] ⏳ Waiting for Razorpay individual account approval (1-2 days)
- [ ] Switch env vars to live keys once approved
- [ ] Test real ₹149 payment end-to-end

### Resend Email Domain
- [x] Resend account created, OTP emails sending
- [ ] ⏳ Currently using onboarding@resend.dev (test sender)
- [ ] Update to noreply@crestlabs.in once domain is bought

---

## ❌ REMAINING TASKS (Do In This Order)

---

### 1️⃣ BUY CUSTOM DOMAIN — ₹500 (Do Today)
**Why first:** AdSense needs it. Razorpay looks professional. Resend email works.
**Time:** 30 minutes

```
Best options (check availability):
→ commentpull.in        (~₹500/year) ⭐ RECOMMENDED
→ crestlabs.in          (~₹500/year) — good for all future products
→ ytcommentpull.com     (~₹800/year)
```

**Steps:**
1. namecheap.com → search domain → buy
2. Vercel → your project → Settings → Domains → Add Domain
3. Namecheap → Advanced DNS → add 2 records Vercel gives you
4. Wait up to 24 hours → site live on custom domain

**After buying, update these 4 places:**
- Vercel env var: `NEXT_PUBLIC_APP_URL=https://yourdomain.in`
- Supabase → Authentication → URL Configuration → new domain + redirect URLs
- Razorpay → Settings → Webhooks → update webhook URL
- Resend → Add domain → update `from:` in `app/api/send-otp/route.ts`

---

### 2️⃣ PRIVACY POLICY + TERMS PAGES (1 hour — Required for AdSense)
**Why:** Google AdSense REQUIRES these pages before approving.
**Time:** 1 hour (ask Claude to generate)

```
Ask Claude: "Generate a Privacy Policy page at app/privacy/page.tsx 
and Terms of Service at app/terms/page.tsx for CommentPull — 
a YouTube comments downloader SaaS. Use the same dark theme."
```

Also update footer links in `app/page.tsx` from `href="#"` to:
- `/privacy`
- `/terms`
- `mailto:hello@crestlabs.in`

---

### 3️⃣ BLOG + FAQ PAGES (3-4 hours — Required for AdSense)
**Why:** AdSense wants real content. Also brings SEO traffic.
**Time:** Half day (ask Claude to generate all of it)

**Pages to create:**
```
app/blog/page.tsx
app/blog/how-to-download-youtube-comments/page.tsx     ← 1,500 words
app/blog/youtube-comment-analysis-guide/page.tsx       ← 1,200 words  
app/blog/best-youtube-comment-tools/page.tsx           ← 1,000 words
app/faq/page.tsx
```

**Target keywords (low competition):**
| Keyword | Monthly Searches |
|---------|-----------------|
| youtube comments downloader | 8,100/mo |
| download youtube comments csv | 2,400/mo |
| export youtube comments | 3,200/mo |
| how to download youtube comments | 5,400/mo |

```
Ask Claude: "Write a complete SEO-optimized blog post for 
'How to Download YouTube Comments' targeting 1,500 words. 
Create it as a Next.js page at app/blog/how-to-download-youtube-comments/page.tsx
using the same dark theme as the rest of CommentPull."
```

---

### 4️⃣ APPLY FOR GOOGLE ADSENSE (30 min — Passive Income)
**Why:** ₹1,000-15,000/month passive income from ads, even free users earn you money.
**When:** After domain + privacy/terms + blog pages are live.
**Time:** 30 minutes to apply, 1-2 weeks for approval.

**Steps:**
1. Go to adsense.google.com
2. Sign in with Google → Get Started
3. Enter your custom domain
4. Copy the verification `<script>` tag they give you
5. In Cursor, open `app/layout.tsx` → paste inside `<head>`:
```tsx
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
  crossOrigin="anonymous"
/>
```
6. Deploy → Submit for review
7. Wait 1-2 weeks

**After approval, replace the placeholder in `app/page.tsx`:**
```tsx
{/* Find this div and replace: */}
<ins className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client="ca-pub-YOUR_ID"
  data-ad-slot="YOUR_SLOT_ID"
  data-ad-format="auto"
  data-full-width-responsive="true"
/>
```

**Realistic earnings:**
| Monthly Visitors | AdSense Revenue |
|----------------|-----------------|
| 5,000 | ₹500-1,000 |
| 20,000 | ₹2,000-5,000 |
| 50,000 | ₹5,000-15,000 |

---

### 5️⃣ POST ON REDDIT TODAY (Free Users This Week)
**Why:** Reddit gives immediate targeted traffic, completely free.
**Time:** 30 minutes. Do this even before the domain is ready.

**Post #1 — r/SideProject (500k members):**
```
Title: Built a free YouTube comments downloader — no signup, instant CSV export

I kept needing to analyze YouTube comments for research but every 
tool I found was either paid or required complex setup.

So I built one over the weekend:
→ Paste any YouTube URL
→ Get all comments as CSV instantly  
→ Completely free (3 downloads/day, no account needed)
→ Premium tier for researchers who need more (₹149/month)

Would love honest feedback from this community!

🔗 [your site URL]

Stack: Next.js + Supabase + Vercel (all free tier)
```

**Post #2 — r/datascience:**
```
Title: Free tool to export YouTube comments to CSV for NLP/sentiment analysis

Built a quick scraper for the research community — paste any YouTube URL,
get all comments exported as CSV with: author, text, likes, date, reply count.

Perfect for building training datasets or sentiment analysis projects.
Completely free to use.

🔗 [your site URL]
```

**Post #3 — r/youtube:**
```
Title: Free tool I built to download all comments from any YouTube video

Useful for creators who want to analyze their own comments,
track sentiment over time, or back up comment data.

🔗 [your site URL]
```

**Also post in:**
- r/entrepreneur
- r/webdev  
- r/passive_income
- r/indiahackers

**Best time:** Tuesday-Thursday, 9-11am IST

---

### 6️⃣ TWITTER/X — BUILD IN PUBLIC (30 min)
**Why:** #buildinpublic tweets get organic reach and attract early users.

**Post this today:**
```
Just launched CommentPull 🚀

Download any YouTube video's comments as CSV instantly.
Free tool — no signup needed.

Built in 48hrs with:
→ @nextjs
→ @supabase  
→ @vercel
→ @cursor_ai

#buildinpublic #indiehacker #SideProject #MadeInIndia

🔗 [your site URL]
```

**Weekly update format (post every week):**
```
Week [N] update for CommentPull 📊

→ [X] total users
→ [X] downloads this week  
→ [X] premium subscribers
→ Revenue: ₹[X]

Working on: [what you built this week]

#buildinpublic
```

---

### 7️⃣ PRODUCTHUNT LAUNCH (Big Traffic Day)
**Why:** A decent ProductHunt launch = 500-3,000 visitors in one day.
**When:** After domain + blog pages are ready. Pick a Tuesday.
**Time:** 2-3 hours to prepare.

**Assets needed:**
- [ ] Logo PNG 240×240px
- [ ] 4-5 screenshots 1270×952px
- [ ] 60-second demo GIF or video
- [ ] Tagline (60 chars max): "Download YouTube comments as CSV instantly — free"
- [ ] Description (200 words)

**Launch checklist:**
1. Create producthunt.com account 1 week early
2. Follow 20+ people + comment on other products
3. Schedule launch for Tuesday 12:01am PST (= 1:31pm IST)
4. Post in r/SideProject same day
5. Tweet with #ProductHunt tag
6. Ask friends/network to upvote first thing in the morning

---

### 8️⃣ SEO SITEMAP + ROBOTS (1 hour — Long-term Traffic)
**Why:** Helps Google index your site faster.

```
Ask Claude: "Create app/sitemap.xml/route.ts that auto-generates 
a sitemap for CommentPull with all pages. Also create app/robots.txt/route.ts
that allows all crawlers."
```

---

### 9️⃣ SWITCH RAZORPAY TO LIVE MODE
**When:** Razorpay approves individual account (usually 1-2 days after submitting PAN + bank details)

**Steps:**
1. Razorpay Dashboard → toggle Live Mode ON
2. Settings → API Keys → Generate Live Keys
3. Vercel → env vars → update:
   - `RAZORPAY_KEY_ID` → `rzp_live_xxx`
   - `RAZORPAY_KEY_SECRET` → live secret
4. Vercel → Redeploy
5. Test with real ₹1 payment ✅

---

## 💰 EARNINGS PROJECTION (Realistic)

| Timeline | Action | Visitors/mo | AdSense | Premium | Monthly Total |
|----------|--------|------------|---------|---------|---------------|
| Right Now | Just launched | 0 | ₹0 | ₹0 | ₹0 |
| Week 1 | Reddit + Twitter | 800 | ₹0* | 2 users | ₹598 |
| Month 1 | ProductHunt | 3,000 | ₹0* | 8 users | ₹2,392 |
| Month 2 | AdSense approved | 5,000 | ₹500 | 20 users | ₹6,480 |
| Month 3 | SEO kicks in | 12,000 | ₹1,200 | 40 users | ₹13,160 |
| Month 6 | Word of mouth | 40,000 | ₹4,000 | 100 users | ₹33,900 |
| Month 12 | Established | 100,000 | ₹10,000 | 250 users | ₹84,750 |

*AdSense needs 1-2 weeks approval after applying

---

## 🔧 FULL TECH STACK

| Layer | Tool | Status | Monthly Cost |
|-------|------|--------|-------------|
| Frontend | Next.js 14 + Tailwind | ✅ Live | Free |
| Backend | Next.js API Routes on Vercel | ✅ Live | Free |
| Database | Supabase PostgreSQL | ✅ Live | Free |
| Auth | Custom OTP via Resend | ✅ Live | Free (3k/mo) |
| Email | Resend | ✅ Live | Free (3k/mo) |
| Hosting | Vercel | ✅ Live | Free |
| YouTube API | Data API v3 | ✅ Live | Free (10k/day) |
| Payments | Razorpay | ⏳ Test mode | 2% per txn |
| Domain | Not bought yet | ❌ Pending | ₹500/year |
| AdSense | Not applied yet | ❌ Pending | Revenue share |
| **TOTAL** | | | **₹42/month** (₹500/year domain only) |

---

## 📁 CURRENT PROJECT STRUCTURE

```
comment-pull/
├── app/
│   ├── page.tsx                       ← Homepage (free tool + pricing)
│   ├── layout.tsx                     ← SEO metadata + fonts + AdSense placeholder
│   ├── globals.css                    ← Tailwind + custom scrollbar
│   ├── login/page.tsx                 ← OTP signup + signin (professional UI)
│   ├── dashboard/page.tsx             ← User download history + stats
│   ├── success/page.tsx               ← Post-payment success page
│   └── api/
│       ├── comments/route.ts          ← YouTube API + rate limiting
│       ├── auth/route.ts              ← Server-side signin
│       ├── send-otp/route.ts          ← Send OTP email via Resend
│       ├── verify-otp/route.ts        ← Verify OTP + create account
│       ├── dashboard/route.ts         ← Fetch user data server-side
│       ├── razorpay-order/route.ts    ← Create Razorpay subscription
│       └── razorpay-webhook/route.ts  ← Handle payment events
├── lib/
│   └── supabase.ts                    ← Singleton Supabase client
├── supabase-setup.sql                 ← Main DB tables
├── supabase-otp.sql                   ← OTP table
├── .env.local                         ← Local secrets (never commit!)
└── README.md                          ← This file
```

---

## 🔑 ENVIRONMENT VARIABLES REFERENCE

```bash
# YouTube
YOUTUBE_API_KEY=AIzaSy...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jxdzfprmsitrizgkkwnv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Razorpay (currently TEST mode — update to live after approval)
RAZORPAY_KEY_ID=rzp_test_SKL3RitZhl6WpJ
RAZORPAY_KEY_SECRET=e2PP6TaVY6IfIR7g5ISTPGiv
RAZORPAY_PLAN_ID=plan_SKL1xFdUHaRjPP
RAZORPAY_WEBHOOK_SECRET=rzp_secret_crestlabs_9821

# Resend (email OTP)
RESEND_API_KEY=re_...

# App URL
NEXT_PUBLIC_APP_URL=https://comment-pull-rfot.vercel.app
# ↑ Update to custom domain once bought
```

---

## 🆘 BUGS FIXED (History)

| Bug | Root Cause | Fix Applied |
|-----|-----------|-------------|
| "YouTube API key not configured" | Env vars read at module level | Moved inside handler function |
| Wrong Supabase anon key format | Used sb_publishable_ instead of eyJ... | Got correct key from Settings → API |
| .env.local not created | Edited .env.local.example instead | cp .env.local.example .env.local |
| Success redirect to about:blank | window.location.origin not used | Fixed in Razorpay handler |
| Stripe not available in India | Invite-only for Indian individuals | Switched fully to Razorpay |
| "Failed to fetch" on signup | ISP blocks direct browser→Supabase | Server-side auth via /api/auth |
| Email confirmation links broken | ISP blocks supabase.co DNS | Custom OTP system via Resend |
| Supabase project paused | Free tier auto-pauses after inactivity | Restored project + fixed keys |
| "Multiple GoTrueClient" warning | Multiple createClient() calls | Singleton in lib/supabase.ts |
| OTP "Invalid code" on password step | OTP verified twice (consumed) | Separate verify + create actions |
| Duplicate Vercel deployment | Two projects connected to same repo | Deleted duplicate project |
| Build fail: Stripe type error | Old stripe-webhook file left in project | Deleted stripe-webhook folder |

---

## 📋 IMMEDIATE ACTION CHECKLIST

**Do TODAY:**
- [ ] Post on Reddit r/SideProject (copy template above)
- [ ] Post on Twitter/X with #buildinpublic
- [ ] Buy domain on namecheap.com — commentpull.in (~₹500)

**This week:**
- [ ] Connect domain to Vercel
- [ ] Update 4 places with new domain (Vercel, Supabase, Razorpay, Resend)
- [ ] Ask Claude: generate Privacy Policy + Terms pages
- [ ] Ask Claude: generate Blog pages (3 articles)

**Next week:**
- [ ] Apply for Google AdSense
- [ ] Add AdSense verification code to layout.tsx
- [ ] Prepare ProductHunt launch assets

**This month:**
- [ ] Razorpay live mode (after approval)
- [ ] ProductHunt launch (Tuesday)
- [ ] Target: 10 premium users = ₹2,990/month

---

Built with ❤️ in India by Crestlabs