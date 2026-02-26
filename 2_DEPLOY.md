# Deploy Steps

## Step 1 — Run SQL
Paste `1_SUPABASE_SQL.sql` in Supabase → SQL Editor → Run

## Step 2 — Add these files to your project

NEW files (create these folders + files):
  app/api/api-keys/route.ts         ← API key CRUD (generate/list/revoke)
  app/api/v1/comments/route.ts      ← Public REST API endpoint
  app/docs/page.tsx                 ← Full API docs + key manager UI

REPLACE:
  app/dashboard/page.tsx            ← "View API Docs" now links to /docs

## Step 3 — Deploy
  git add .
  git commit -m "feat: API access for Premium users"
  git push

## Step 4 — Test
Visit: https://comment-pull-rfot.vercel.app/docs
Sign in as Premium → Go to "My API Keys" → Generate key → Test with curl:

  curl -H "Authorization: Bearer cp_live_YOUR_KEY" \
    "https://comment-pull-rfot.vercel.app/api/v1/comments?videoId=dQw4w9WgXcQ"
