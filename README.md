# VYBI — Vaginal · And · Body Intelligence

Femtech app: cycle prediction, vaginal/gut/skin/oral biome tracking, preventive
risk scores, and an AI assistant. Next.js 14 (App Router) + Neon Postgres +
Auth.js v5 + Stripe + Anthropic.

## Stack

| Concern | Tech |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript, Tailwind |
| Database | Neon Postgres via Drizzle ORM (`@neondatabase/serverless`) |
| Auth | Auth.js v5 — email/password, magic link, Google OAuth, anonymous guest mode |
| Payments | Stripe subscriptions (Free / Core £9.99 / Premium £24.99) |
| AI chat | Anthropic (`claude-sonnet-4-20250514`) |
| Deploy | Netlify (`@netlify/plugin-nextjs`) |

## Project layout

```
app/                 Pages + API routes
  api/               predictions, symptoms, biome, cycles, health, prevention,
                     signup, chat, stripe/*, auth/[...nextauth]
  login, signup, forgot-password
components/           Screens (verbatim from prototype) + auth UI + hooks
lib/
  db/                Drizzle schema + client
  prediction/        5-layer engine, prevention scoring, service layer
  client-api.ts      Browser fetch helpers
  auth-helpers.ts    requireUser() for API routes
  stripe.ts
auth.ts, auth.config.ts, middleware.ts
types/               Inferred DB types + next-auth augmentation
```

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL + AUTH_SECRET (others optional)
npm run db:push              # create tables in Neon
npm run dev
```

Generate an `AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Environment variables

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon pooled connection string |
| `AUTH_SECRET` | ✅ | Auth.js JWT signing |
| `NEXTAUTH_URL` | ✅ (prod) | Site URL |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional | Google sign-in |
| `AUTH_RESEND_KEY` / `EMAIL_FROM` | optional | Magic link + password recovery |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | optional | Payments |
| `STRIPE_PRICE_CORE` / `STRIPE_PRICE_PREMIUM` | optional | Tier price IDs |
| `ANTHROPIC_API_KEY` | optional | Vybi chat |

Every optional integration is **env-gated**: the app runs without it and lights
up automatically once the key is set.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Push Drizzle schema to Neon |
| `npm run db:studio` | Drizzle Studio |

## The 5-layer prediction engine

`lib/prediction/engine.ts` — pure, unit-testable:

1. **Kalman Filter** — recency-weighted cycle length, variance → confidence
2. **Symptom Pattern Engine** — symptom→phase signatures (+6%)
3. **Biome-Hormonal Inference** — vaginal biome → hormonal phase (+10%)
4. **Wearable Fusion** — BBT / HR / HRV (+9%)
5. **Population adjustment** — placeholder for future ML

`POST /api/predictions/calculate` runs all layers over the user's stored signals
and persists the result; symptom/biome/cycle writes trigger recalculation.

## Deploy (Netlify)

1. Push to Git, "Add new site" → import the repo.
2. Build settings come from `netlify.toml` (no changes needed).
3. Add all env vars under Site settings → Environment.
4. Set `NEXTAUTH_URL` + `NEXT_PUBLIC_SITE_URL` to the Netlify URL.
5. Stripe webhook endpoint: `https://<site>/api/stripe/webhook`.

## Security notes

- Neon is plain Postgres, so ownership is enforced **server-side** — every API
  route filters by the authenticated `user.id` (`requireUser`). There is no
  Supabase-style DB RLS; consider adding Postgres RLS as defense-in-depth.
- `.env.local` is gitignored. Never commit secrets.
