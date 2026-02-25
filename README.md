# 🎯 CommentPull — YouTube Comments Downloader
### Complete Build → Deploy → Earn Guide

---

## 🛠️ BEST FREE AI IDE RECOMMENDATION

### ✅ Use: **Cursor** (cursor.com) — FREE Tier
> Cursor is VS Code + AI built-in. Best free AI coding tool for this project.

**Why Cursor over others:**
| Tool | AI Model | Free Tier | Best For |
|------|----------|-----------|----------|
| **Cursor** ⭐ | Claude + GPT-4 | 2,000 completions/mo | Full project development |
| GitHub Copilot | GPT-4 | 2,000 completions/mo | Autocomplete only |
| Windsurf | Claude | Limited | Good alternative |
| VS Code + Cline | Claude API | Pay per use | If you have API credits |

**Setup Cursor:**
1. Download from cursor.com (free)
2. Sign in with GitHub
3. Open your project folder
4. Press `Ctrl+L` to open AI chat
5. Paste prompts from this guide directly into Cursor!

---

## 📁 PROJECT STRUCTURE

```
comment-pull/
├── app/
│   ├── page.tsx              ← Homepage UI (DONE ✅)
│   ├── layout.tsx            ← Root layout + SEO (DONE ✅)
│   ├── globals.css           ← Tailwind styles (DONE ✅)
│   └── api/
│       └── comments/
│           └── route.ts      ← YouTube API backend (DONE ✅)
├── supabase-setup.sql        ← Run in Supabase SQL editor (DONE ✅)
├── .env.local.example        ← Copy to .env.local, fill keys (DONE ✅)
├── package.json              ← Dependencies (DONE ✅)
└── README.md                 ← This file
```

---

## 🚀 DAY 1: SETUP (2-3 hours)

### Step 1: Install Tools
```bash
# Install Node.js from nodejs.org (LTS version)
node --version   # should show v18+
npm --version    # should show v9+

# Install Git from git-scm.com
git --version

# Download and install Cursor from cursor.com
```

### Step 2: Get Your API Keys

#### A) YouTube Data API v3 Key (FREE — 10,000 requests/day)
1. Go to https://console.cloud.google.com
2. Create new project → name it "CommentPull"
3. Left menu → "APIs & Services" → "Library"
4. Search "YouTube Data API v3" → Enable it
5. Left menu → "Credentials" → "Create Credentials" → "API Key"
6. Copy the key → add to `.env.local` as `YOUTUBE_API_KEY=...`

#### B) Supabase (FREE — 500MB DB, unlimited auth)
1. Go to https://supabase.com → Sign up with GitHub
2. "New Project" → name "commentpull" → set password → Region: Singapore (closest to India) 
Pass - 1lYkvBXQtbXiXfeb
3. Wait 2 min for setup
4. Left menu → "Settings" → "API"
5. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL=...`
6. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
7. Go to "SQL Editor" → paste contents of `supabase-setup.sql` → Run

#### C) GitHub (FREE)
1. Go to github.com → Sign up
2. New Repository → name "comment-pull" → Public → Create
3. Copy the repo URL

### Step 3: Setup Project Locally
```bash
# Clone or create project
git clone https://github.com/YOUR_USERNAME/comment-pull.git
cd comment-pull

# Copy all files from this package into the folder

# Copy environment file
cp .env.local.example .env.local
# Open .env.local in Cursor and fill in your API keys

# Install dependencies
npm install

# Run locally
npm run dev
# Open http://localhost:3000
```

### Step 4: Test It!
- Open http://localhost:3000
- Paste: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Click "Fetch Comments"
- You should see 100 comments appear
- Click "Download CSV" — file downloads!

---

## 🚀 DAY 2: DEPLOY (1-2 hours)

### Step 5: Push to GitHub
```bash
git add .
git commit -m "Initial commit: YouTube comments downloader"
git push origin main
```

### Step 6: Deploy to Vercel (FREE)
1. Go to https://vercel.com → Sign in with GitHub
2. "New Project" → Import your `comment-pull` repo
3. Framework: Next.js (auto-detected)
4. **Environment Variables** — Add these:
   - `YOUTUBE_API_KEY` → your YT key
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase key
5. Click "Deploy"
6. Wait 2 minutes → Your site is LIVE! 🎉

**Your URL:** `https://comment-pull.vercel.app`

### Step 7: Custom Domain (Optional — ₹500-800/year)
- Buy domain on GoDaddy/Namecheap: `ytcommentpull.com`
- Vercel → Settings → Domains → Add your domain
- Point DNS to Vercel (they give you instructions)

---

## 💰 MONETIZATION SETUP

### A) Google AdSense (Passive Income — ₹2,000-15,000/month)
1. Apply at https://adsense.google.com
2. Add your Vercel URL
3. Wait for approval (1-2 weeks, need 20+ pages ideally)
4. Once approved, replace the AdSense placeholder in `layout.tsx`:
```tsx
// In app/layout.tsx <head> section, uncomment:
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID" crossOrigin="anonymous" />
```
5. Add ad units to the AdSense placeholder div in page.tsx

**Realistic earnings:** ₹0.50-2 per 1000 views (RPM). Need ~10,000 visitors/month for ₹500-2,000/month.

### B) Stripe Premium Payments (₹299/month subscriptions)
1. Go to https://stripe.com → Create account
2. Products → Create product "CommentPull Premium" → ₹299/month
3. Copy Price ID → add to .env as `STRIPE_PREMIUM_PRICE_ID=price_xxx`
4. Ask Cursor: *"Add Stripe checkout to my Next.js app. Create /api/create-checkout-session route that creates a Stripe checkout for price ID from env var. Redirect to success URL after payment."*

**Target:** 50 premium users = ₹14,950/month recurring!

### C) Traffic Strategy (Get your first users FREE)
Post these places:
- **Reddit:** r/datascience, r/youtube, r/entrepreneur, r/SideProject
- **IndieHackers:** Share your launch story
- **ProductHunt:** Launch on a Tuesday at 12:01am PST
- **Twitter/X:** Tweet with #buildinpublic, #sideproject
- **YouTube:** Make a 2-min demo video

---

## 🤖 CURSOR AI PROMPTS TO USE

Copy-paste these directly into Cursor's AI chat (`Ctrl+L`):

### Add User Authentication:
```
Add Supabase email auth to my Next.js app. Create a modal with sign-up/sign-in 
form using email+password. Show user email in navbar when logged in. 
Add sign-out button. Use the existing dark theme styling.
```

### Add Download History Dashboard:
```
Create a /dashboard page that shows the logged-in user's download history 
from Supabase downloads table. Show video ID, comment count, date. 
Use the same dark theme as the homepage. Protect route if not logged in.
```

### Add Stripe Premium:
```
Add Stripe checkout to my Next.js app. Create API route /api/checkout that 
creates a Stripe checkout session for monthly subscription. 
Add an "Upgrade to Premium" button that calls this route. 
Show success message after payment.
```

### SEO Improvements:
```
Add structured data (JSON-LD) for a SaaS tool to my Next.js layout.tsx. 
Add sitemap.xml and robots.txt. Add meta tags for Twitter cards. 
Keep the existing metadata.
```

---

## 📊 EXPECTED EARNINGS TIMELINE

| Month | Visitors | AdSense | Premium Users | Total |
|-------|----------|---------|---------------|-------|
| 1 | 500 | ₹50 | 2 | ₹648 |
| 2 | 2,000 | ₹200 | 8 | ₹2,592 |
| 3 | 8,000 | ₹800 | 25 | ₹8,275 |
| 6 | 30,000 | ₹3,000 | 80 | ₹26,920 |

---

## 🆘 COMMON ISSUES & FIXES

**"YouTube API quota exceeded"**
→ You've hit 10,000 requests/day. Add request caching in your API route.

**"Comments disabled for this video"**
→ Creator disabled comments. Show friendly message (already handled in code).

**"Supabase connection refused"**  
→ Check your .env.local keys are correct. Restart dev server.

**Build fails on Vercel**
→ Check all env vars are added in Vercel project settings (not just .env.local)

---

## 🔧 TECH STACK SUMMARY

| Layer | Tool | Cost |
|-------|------|------|
| Frontend | Next.js 14 + Tailwind | Free |
| UI Components | Lucide Icons + Custom | Free |
| Backend | Next.js API Routes | Free |
| Database | Supabase PostgreSQL | Free (500MB) |
| Auth | Supabase Auth | Free |
| Hosting | Vercel | Free (100GB/mo) |
| YouTube Data | YouTube API v3 | Free (10k/day) |
| Payments | Stripe | 2.9% + ₹2/transaction |
| Ads | Google AdSense | Revenue share |
| IDE | Cursor | Free (2k completions/mo) |
| **TOTAL** | | **₹0/month** |

---

Built with ❤️ in India. From idea to income in 2 days.
