# VYBI — Backlog / Future Development

Tracking known unfinished items so nothing gets lost. Updated as features land.

## Settings screen — not yet functional
These render in **Settings** but don't persist or do anything real yet:

- [ ] **Anonymous Mode toggle** — local-only; should persist to `users.anonymous_mode` and actually de-link identity.
- [ ] **Partner Sharing toggle** — local-only; needs a real partner-invite/sharing system.
- [ ] **Push Notifications toggle** — ✅ now wired to real web-push subscribe/unsubscribe (see Notifications below). Per-type preferences (period / fertile / pill) still TODO.
- [ ] **Biometric Lock toggle** — local-only; needs WebAuthn / device biometric integration.
- [ ] **Research Opt-in toggle** — local-only; needs a consent record + data pipeline.
- [x] **Export Health Data** — ✅ JSON download (`/api/export`) + printable doctor report (`/report`).
- [ ] **My Test Kits** — removed from Settings list; needs the biome test-kit upload UI (below).

## Missing data-entry UIs (APIs exist, screens don't)
- [ ] **Biome test-kit upload form** → `POST /api/biome/upload` (unlocks Layer 3 + full Microbe Report).
- [ ] **Health-metrics logger** (sleep/stress/hydration/exercise) → `POST /api/health/log` (feeds General Health + prevention).

## Demo-data gating — signed-in vs preview  ✅ (shipped)
Rule now enforced everywhere: **signed-in users (`session.user`) see only their
real data or honest empty states; demo numbers appear in guest/preview mode only.**
Gated via `isLive = !!session?.user` across Home, Cycle, Biomes, AI Engine,
Microbe Report, Chat (+ `BiomeRing` renders `—` for null score).
- [x] **Home** — real cycle day/phase; rings `—` with no kit; AI confidence/accuracy/score null-safe; demo "biome predicted this dip" card hidden when no biome.
- [x] **Cycle → Insights tab** — now computed from the user's real cycles (regularity SD, avg length, count) for signed-in users; demo numbers only in preview.
- [x] **Cycle → predictions** — "Log a period" / `—` instead of demo "Jun 2 · 82%"; PMS window computed from the real predicted period.
- [x] **Cycle → Estimated Hormones / Layer-3 biome card** — hidden for signed-in users until there's cycle/biome data (still a day-based estimate when shown; true model curve is future work).
- [x] **Biomes** — empty rings + "No data yet" badge, upload prompt; demo Score-History bars hidden for signed-in users.
- [x] **AI Engine** — real accuracy + active-layer count (`—` when none); confidence signals shown un-met; fabricated "Your Detected Symptom Patterns" hidden when signed in.
- [x] **Microbe Report** — per-biome "no test yet" empty state for signed-in users instead of demo sequencing.
- [x] **Chat** — clean greeting for signed-in users (no scripted fake conversation).

### Still needs real data sources (kept honest with empty states for now)
- [ ] **Biome Score-History over time** — `biome_scores` history series not stored/surfaced yet; bars hidden for signed-in users until it is.
- [ ] **AI Engine → L1–L3 ceiling labels** — the locked layers still show fixed 72/79/88%. Active layer is now real; relabel locked ones as "up to X%". Confidence Signals/roadmap/Flo comparison remain product/marketing copy (intentional).
- [ ] **Gut / skin / oral biomes** — no sequencing source exists; signed-in users see "not available". Vaginal biome is fully live.
- [ ] **Estimated Hormones** — replace the mock 35-day curve with a real model-based estimate.

## Theming — Lavender satin refresh  ✅ (shipped)
Default theme is now **Lavender** (satin finish): luminous radial-bloom background,
white→lilac gradient cards with a lit top edge + soft shadow (`--card-bg`,
`--card-shadow`, `--card-border`), deep indigo ink (`#2C2350`), and primary buttons on
the **logo violet→magenta gradient** with a gentle sheen (`--brand-grad` + `--brand-glow`).
Blush and Midnight inherit the same satin treatment. Tokens live in `globals.css`
(mirrored in `VybiApp` THEME_CSS).
- [ ] Ad-hoc nested panels still use translucent `--velvet-rgb` (flat) rather than the
      satin `--card-bg`; promote the important ones if they look weak on lavender.
- [ ] Active bottom-nav icon uses brand magenta; preview used violet `#9B30D4` — optional.

## Theming — light/white/pink backgrounds  ✅ (shipped)
Light (white) is now the **default** app theme, with **Blush (pink)** and **Midnight (dark)**
options selectable in **Settings → Appearance** (persisted per-device in `localStorage`).
Implemented as CSS custom properties in `components/theme.js` + `THEME_CSS` in `VybiApp`;
surface/text colours are exposed as rgb channels (`--ink-rgb`, `--surface-rgb`, `--lav-rgb`,
`--deep-rgb`, `--velvet-rgb`, `--text`, `--app-bg`, `--card-shadow`, `--card-border`) so the
existing inline `rgba()` alpha values re-skin automatically across every screen.
- [x] App background + cards + primary text + nav + inputs all theme-aware.
- [x] Cards gain a soft shadow on light themes (`--card-shadow`) so they lift off the page.
- [x] Settings → Appearance picker (White / Blush / Midnight) with live switch + persistence.
- [ ] **Accent-label contrast on light** — small uppercase eyebrow labels using pale accents
      (`C.mint`, `C.gold`, `C.lavender`, `C.aqua`) read as soft pastels on white; tune to
      deeper on-light variants if legibility feedback warrants.
- [ ] **Persist theme to the user account** (DB column) so it follows the user across devices;
      currently device-local. Login/signup (AuthShell) still use their own dark styling.

## Recently shipped — UX / branding / navigation
- [x] **New Vybi logo + icons** — three-petal mark on brand dark `#1a0a2e`; regenerated PWA icons (192/512), apple-touch, favicon-32, transparent `logo-mark`; master source at `brand/vybi-logo-source.png`.
- [x] **Persistent top bar** — clickable logo + white "VYBI" wordmark on every screen (→ Home), above the scroll area so it never overlaps screen titles.
- [x] **History-aware Back** — back chevron in the top bar walks the navigation stack; logo still jumps Home.
- [x] **Write-screen feedback** — Pregnancy / Birth Control / Partner / Community now show "Sign in to…" (guests) or "please try again" instead of silently failing. Data stays strictly account-only (no guest writes).
- [x] **Bottom-nav clearance** — every screen's scroll padding bumped so cards clear the phone nav bar.
- [x] **Login page** — tightened spacing (no scroll), content nudged up, white wordmark.
- [x] **Onboarding** — "Let's start your cycle" top-aligned + scrollable + safe-area padding so "I'll add this later" is reachable on tall Android screens.
- [ ] **Hardware/gesture Back** — map the Android back gesture to the in-app history stack (currently top-bar Back only).
- [ ] **Bottom-nav active state** on non-nav screens (Prevention, Pregnancy, etc.).

## Notifications (in progress / shipped)
- [x] Web push infrastructure (service worker, VAPID, subscribe/unsubscribe/test).
- [x] Reminder logic: pill (at pill_time), period (1–2 days out), fertile window opening.
- [x] Netlify scheduled function to send due reminders on a cron.
- [ ] Per-reminder-type user preferences + quiet hours.
- [ ] iOS web push requires the app be installed as a PWA — add an install prompt / PWA manifest polish.
- [ ] Timezone handling for pill reminders (currently uses server UTC day; store user timezone for precise local-time firing).

## Flo-parity roadmap (remaining, prioritized)
1. ~~Pregnancy mode~~ ✅
2. ~~Birth control tracking~~ ✅
3. ~~Notifications/reminders~~ ✅ (core)
4. ~~Richer symptom/mood taxonomy (40, grouped) + onboarding goals (track/conceive/avoid)~~ ✅
5. ~~Wearable BBT/HRV manual entry → activates Layer 4~~ ✅ (true Apple Health/Oura/Garmin auto-sync still needs a native app — manual entry works today)
6. ~~Content library (articles, daily insights)~~ ✅
7. ~~Partner sharing~~ ✅
8. ~~Data export / doctor report~~ ✅
9. ~~Community / secret chats~~ ✅ (anonymous rooms, posts/replies, report→auto-hide; full real-time + human moderation is a follow-up)

— All 10 Flo-parity list items complete. —

Goal-based tailoring (use users.goal to emphasize fertile window for "conceive",
contraception for "avoid") is still TODO — currently goal is captured + shown only.

## Infra / hardening
- [ ] Stripe live keys + webhook endpoint registration.
- [ ] Optional: Postgres RLS as defense-in-depth (currently ownership enforced in API layer).
- [ ] Connect GitHub repo to Netlify for auto-deploy (currently CLI deploys).
- [ ] Persist `users.onboarded` is set; confirm session refresh picks it up on next login.
