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

## Screens still showing demo/static content
- [ ] **Cycle → Insights tab** — hardcoded stats (regularity, avg length, error). Wire to real cycle history.
- [ ] **Cycle → Estimated Hormones bars** — demo curve from the mock 35-day array; replace with model-based estimates.
- [ ] **Biomes → Score History bars** — hardcoded; wire to biome_scores history.
- [ ] **AI Engine → layer accuracy numbers are hardcoded** — L1–L3 show fixed 72/79/88% even with zero user data (credibility risk). Fix: relabel L1–L3 as "up to X%" (ceilings, like L4 already does), and drive the *active* layer's number from the real computed `prediction.accuracyPct`. Keep the lock states ("Activates after Cycle 2 / first test kit / connect wearable") — they're accurate and drive upsell.
- [ ] **AI Engine → Confidence Signals / roadmap / Flo comparison** — partly static copy.
- [ ] **Microbe Report** — only the vaginal biome uses live data; gut/skin/oral are demo.

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
