# CommentPull

> Download YouTube comments as CSV — then let AI analyze your audience instantly.

![Status](https://img.shields.io/badge/Status-Live-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay-blue)
![AI](https://img.shields.io/badge/AI-Llama%203.3%2070B-purple)

**Live:** https://comment-pull-rfot.vercel.app

---

## What It Does

CommentPull lets you paste any YouTube URL and:

1. **Export all comments as CSV** in seconds — author, text, likes, date, replies
2. **Run AI analysis** — get sentiment score, top themes, audience questions, and next video ideas powered by Llama 3.3 70B via Groq

No API key needed. No setup required. Works for any public YouTube video.

- **Free plan** — 5 downloads/day · 100 comments/video
- **Premium plan** — Unlimited downloads · 10,000 comments/video · AI Analysis · API access · ₹149/month

---

## ✨ AI Comment Analysis (Premium)

After fetching comments, Premium users get a full audience intelligence report:

| Feature               | What it tells you                                        |
| --------------------- | -------------------------------------------------------- |
| 🎯 Sentiment Score    | How positive/neutral/negative your audience is (0–10)    |
| 💬 Top Themes         | What topics come up most in comments                     |
| ❓ Audience Questions | Real questions your viewers are asking                   |
| 💡 Video Ideas        | Next video suggestions based on what your audience wants |
| 🔥 Top Comment        | The most impactful comment on the video                  |

Powered by **Llama 3.3 70B via Groq** — analyzes up to 300 comments per video in under 10 seconds.

---

## Features

- 🚀 **Instant export** — fetch and download comments in under 5 seconds
- ✨ **AI Analysis** — full sentiment + themes + questions + video ideas
- 📊 **Rich CSV** — author, comment text, likes, publish date, reply count, comment type
- 🔁 **Include replies** — optionally fetch replies to top-level comments
- 🔐 **Google OAuth + Email OTP** — flexible authentication via Supabase
- 💳 **Razorpay payments** — UPI, cards, netbanking, wallets all supported
- 📈 **Dashboard** — full download history and usage tracking
- 🔌 **REST API** — Premium users get programmatic API access
- 📱 **Fully responsive** — works on mobile, tablet, and desktop

---

## Tech Stack

| Layer       | Technology                                        |
| ----------- | ------------------------------------------------- |
| Frontend    | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend     | Next.js API Routes (serverless)                   |
| Database    | Supabase (PostgreSQL)                             |
| Auth        | Supabase Auth + Google OAuth + Email OTP          |
| Payments    | Razorpay (subscriptions + webhooks)               |
| Hosting     | Vercel                                            |
| Data Source | YouTube Data API v3                               |
| Analytics   | Vercel Analytics                                  |

---

## Project Structure

```
app/
├── page.tsx                          # Homepage — URL input, comment preview, download
├── login/page.tsx                    # Auth — Google OAuth + Email OTP flow
├── dashboard/page.tsx                # User dashboard — history, usage, subscription
├── success/page.tsx                  # Post-payment premium activation page
├── docs/page.tsx                     # REST API documentation
├── privacy/page.tsx                  # Privacy policy
├── terms/page.tsx                    # Terms of service
├── blog/                             # SEO blog articles
│   ├── page.tsx
│   ├── how-to-download-youtube-comments/
│   ├── youtube-comment-analysis-guide/
│   └── best-tools-youtube-creators/
├── auth/callback/page.tsx            # Google OAuth callback handler
└── api/
    ├── comments/                     # Fetch YouTube comments via YT Data API v3
    ├── auth/                         # Email + password sign in
    ├── send-otp/                     # Send 6-digit OTP via email
    ├── verify-otp/                   # Verify OTP + create account
    ├── google-auth/                  # Generate Google OAuth URL (server-side)
    ├── auth-callback/                # Handle Google OAuth token exchange
    ├── save-download/                # Log downloads + enforce daily limits
    ├── dashboard/                    # Fetch user download history
    ├── razorpay-order/               # Create Razorpay subscription
    ├── razorpay-webhook/             # Handle payment webhooks → activate premium
    ├── activate-premium/             # Manually activate premium after payment
    ├── subscription/                 # Get / cancel subscription status
    ├── api-keys/                     # Generate + manage API keys
    └── v1/comments/                  # Public REST API for premium users
```

---

## Local Development

### Prerequisites

- Node.js 18+
- Supabase account
- YouTube Data API v3 key
- Razorpay account
- Google Cloud project (for OAuth)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/commentpull.git
cd commentpull
npm install
```

### 2. Environment variables

Create `.env.local` in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# YouTube
YOUTUBE_API_KEY=your_youtube_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_PLAN_ID=plan_your_plan_id
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase tables

Run in your Supabase SQL editor:

```sql
-- Downloads table
CREATE TABLE public.downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Premium users table
CREATE TABLE public.premium_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  razorpay_subscription_id TEXT,
  is_active BOOLEAN DEFAULT false,
  plan TEXT DEFAULT 'premium',
  renewal_date TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email OTPs table
CREATE TABLE public.email_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys table
CREATE TABLE public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  key TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "downloads_select_own" ON public.downloads
  FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "downloads_insert_own" ON public.downloads
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "api_keys_select_own" ON public.api_keys
  FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "premium_users_select_own" ON public.premium_users
  FOR SELECT USING (user_id::text = auth.uid()::text);
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Then in Vercel dashboard → **Settings → Environment Variables** → add all variables from `.env.local`.

### Post-deployment checklist

- [ ] Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
- [ ] Add Vercel URL to Google Cloud authorized redirect URIs
- [ ] Update Razorpay webhook URL to your Vercel domain
- [ ] Redeploy after updating env vars

---

## Payment Flow

```
User clicks Upgrade
      ↓
POST /api/razorpay-order  →  creates Razorpay subscription
      ↓
Razorpay checkout opens  →  user pays via UPI / card / netbanking
      ↓
Redirect to /success page  →  POST /api/activate-premium
      ↓
Razorpay webhook fires  →  POST /api/razorpay-webhook
      ↓
premium_users table updated  →  is_active = true
      ↓
User gets unlimited access
```

---

## REST API (Premium)

### Get Comments

```http
GET /api/v1/comments?videoId={videoId}&limit={limit}
Authorization: Bearer your_api_key
```

**Response:**

```json
{
  "comments": [
    {
      "author": "Jane Doe",
      "text": "This is amazing!",
      "likes": 42,
      "publishedAt": "2024-01-15T10:30:00Z",
      "replyCount": 3,
      "isReply": false
    }
  ],
  "total": 150,
  "hasMore": true
}
```

---

## Plans

| Feature            | Free | Premium    |
| ------------------ | ---- | ---------- |
| Downloads per day  | 5    | Unlimited  |
| Comments per video | 100  | 10,000     |
| CSV export         | ✅   | ✅         |
| Include replies    | ✅   | ✅         |
| Download history   | ✅   | ✅         |
| REST API access    | ❌   | ✅         |
| Price              | Free | ₹149/month |

---

## Environment Variables

| Variable                        | Description                             |
| ------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key           |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server only) |
| `YOUTUBE_API_KEY`               | YouTube Data API v3 key                 |
| `GOOGLE_CLIENT_ID`              | Google OAuth 2.0 client ID              |
| `GOOGLE_CLIENT_SECRET`          | Google OAuth 2.0 client secret          |
| `RAZORPAY_KEY_ID`               | Razorpay key ID (`rzp_live_...`)        |
| `RAZORPAY_KEY_SECRET`           | Razorpay key secret                     |
| `RAZORPAY_PLAN_ID`              | Razorpay subscription plan ID           |
| `RAZORPAY_WEBHOOK_SECRET`       | Webhook signature verification secret   |
| `NEXT_PUBLIC_APP_URL`           | Public URL of the deployed app          |

---

## Built By

**Crestlabs** · [hello@crestlabs.in](mailto:hello@crestlabs.in)

---

## License

Private — All rights reserved. Not open source.
