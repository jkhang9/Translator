# Translate

AI-powered workplace communication rewriter. Looks like a Google Doc. Works like magic.

## Setup

```bash
npm install
npm run dev
```

The API key lives server-side only — never in the browser.

## Deploy to Vercel

1. Push to GitHub
2. Import repo at vercel.com
3. Add environment variable:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
4. Deploy

The `/api/rewrite` serverless function proxies all Claude requests.
Your API key is never exposed to the client.

## How it works

- Browser → `POST /api/rewrite` (no API key needed client-side)
- Vercel Edge Function → Anthropic API (key injected server-side)
- Streaming response piped back to browser

## Stack

- React + Vite
- Vercel Edge Functions (serverless proxy)
- Claude Sonnet 4 with streaming
- CSS Modules, no UI library
