# Roasties

AI landing-page roast after a verified 1 USDT TRC20 payment.

## Flow

1. Customer sends 1 USDT on TRC20 / Tron to:
   `TBBR3P7L6F9Ta8miznGpEnF9emX9xqDLLr`
2. Customer submits email, landing page URL, and Tron transaction hash.
3. Backend verifies:
   - token contract is USDT TRC20
   - receiver is the Roasties wallet
   - amount is at least 1 USDT
   - transaction hash was not already used
4. Backend fetches the landing page, asks OpenAI for one concise roast, and emails the result.

## Environment variables

Do not commit real secrets. Add these in Vercel Project Settings → Environment Variables.

Required:

- `OPENAI_API_KEY`
- `RESEND_API_KEY`

Recommended:

- `OPENAI_MODEL` — use `gpt-5.5` only if your OpenAI account has access; otherwise `gpt-4.1-mini` works.
- `FROM_EMAIL` — default is `Roasties <onboarding@resend.dev>`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `TRONGRID_API_KEY`

## Local dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Tests

```bash
npm test
```

## Deploy

Import this repo into Vercel as a Next.js project. Add the env vars above before going live.

## Honest limits

- Payment verification is on-demand after the user submits a transaction hash.
- Without Vercel KV / Upstash Redis, duplicate tx protection uses in-memory fallback and is not reliable in serverless production.
- TRC20 only. Wrong-network payments can be lost.
