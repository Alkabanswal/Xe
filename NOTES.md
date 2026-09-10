# Rate Alerts — notes

**Track:** Frontend (build the alert UI against the stub, plus one small backend change).

**Time spent:** ~2.5 hours.

## What I built

- Alert management UI: create (pair / direction / threshold), list, delete.
- Triggered alerts are surfaced three ways: a solid Xe-blue summary banner
  (`2 alerts triggered — USD/CAD, EUR/USD`), a blue accent bar + `TRIGGERED`
  badge on each affected row, and triggered rows sorted to the top of the list.
- Each row shows the rate the backend evaluated against (`now 1.3650`), so the
  trigger decision is legible instead of mysterious.
- A typed API client and a Pinia store as the single source of truth.
- Tests around the store, the API client, and the two components (23 tests).
- A GitHub Actions workflow that builds both halves and runs the frontend tests.

## Design decisions and trade-offs

**Pinia store, not prop drilling.** Pinia was already a dependency and wired up
in `main.ts` but unused — the old code kept an untyped `reactive({})` blob in
`state.ts`. I made the store real and deleted `state.ts`. Components call
`useAlertsStore()` directly; for an app this size that is less ceremony than
passing alerts + handlers through props/emits, and it keeps `triggered`
derivation (`triggeredCount`, `triggeredAlerts`) in one place.

**Rates and alerts refresh together but fail independently.** The backend
recomputes `triggered` on every read, so a stale rate board would mean stale
trigger state — hence one `refresh()`. But the original `Promise.all` meant a
rates-API failure (the README warns it happens) also blanked the alerts list.
`refresh()` now uses `Promise.allSettled` and applies each result on its own.

**Components talk to the store, and own their local UI state.** `AlertForm`
holds its own draft + submit-in-flight + error state; `AlertList` owns its
delete error. Nothing that is purely view state lives in the store.

**In-memory everywhere.** The stub keeps alerts in a static list; I did not add
persistence because the task is frontend and the stub is explicitly disposable.
If this were real, alerts would be per-user rows in a database (see "next").

## Look and feel

The brief says CSS isn't judged, but a rate-alerts screen for Xe should look
like Xe, so I themed it against the real site rather than inventing a style:

- **Design tokens lifted from xe.com's live stylesheet** — the blue scale
  (`--color-blue-*`, primary `#0533ff`), neutrals, `Zalando Sans` (loaded from
  Google Fonts, with a full system fallback), pill buttons, card radii. Kept as
  CSS custom properties in `App.vue`.
- **Header** — the Xe wordmark SVG traced from xe.com's own header, white on the
  blue gradient bar.
- **Layout** — a blue hero with the content floating up over it on shadowed
  white panels, the same treatment as xe.com's converter card.
- **Currency flags** — circular flag SVGs (public-domain `circle-flags` set,
  inlined so there's no runtime asset dependency) in `FlagIcon.vue`.
- **Favicon** — matched to xe.com's (navy `#08126d` wordmark on white).

The one external dependency this adds is the Google Fonts request for Zalando
Sans; everything else is inlined and the page renders fine if it's blocked.
This is a visual match, not a port of Xe's actual design system.

## The backend change

Added `CurrentRate` to the `/api/alerts` list and create responses in
`AlertsStubController.cs`. The stub evaluates `triggered` against hardcoded
rates (1.3650 / 1.2710 / 1.0830) that diverge from the live board — worse still,
the sandbox API key returns a flat `1.2345` for every pair, so the board looks
broken and the alert triggers look arbitrary. Returning the rate the backend
actually judged against lets the UI show it on each row and removes the
guesswork. It is a one-field change and does not touch the evaluation logic.

## Rough edges

**Fixed**
- Three copy-pasted `getUsdCad/getGbpUsd/getEurUsd` functions in `App.vue` →
  one `display(pair)` helper + `v-for`.
- `state.rates: any[]` → typed `Rate[]` in the store.
- No fetch error handling — rates could hang on `…` with no feedback. Added an
  error banner and a loading/disabled state on Refresh.
- The existing `App.test.ts` asserted on internals of the deleted `state.ts`;
  rewritten.

**Left deliberately**
- `RatesController` is rough: a `new HttpClient()` per call, blocking `.Result`,
  the same block copy-pasted three times, no error handling. It works and the
  brief says backend architecture is not being judged on this track, so I left
  it and noted it here. The fix: one injected `HttpClient`, `async`/`await`,
  `Task.WhenAll` over a pair list.
- No polling — alerts re-evaluate on mount, on Refresh, and after create/delete.
  A `setInterval` poll (or SSE) would make "triggered" feel live.
- The sandbox API key returning canned data is upstream; not something to fix
  here.

## AI collaboration

Used Claude Code (Sonnet) throughout. It drafted the store, components, and
test scaffolding from a plan I reviewed step by step, one commit at a time, and
did the xe.com theming (pulling tokens and the logo from the live site, then
iterating on the visuals against screenshots). Kept: the overall structure, the
`Promise.allSettled` resilience fix, most of the test cases, the token-based
theme. Adjusted / pushed back on: keeping the change set small (it initially
folded several steps into one commit), the choice of backend change (I wanted
the smallest useful one, not a rewrite of the evaluation), and several rounds on
the triggered-state styling until the banner and the rows read as distinct.

## What I'd do next

1. **Real evaluation.** Replace the stub: evaluate alerts against the same fresh
   rates the board uses, on a timer, and expose `lastEvaluatedAt`.
2. **Persistence + data model.** `alerts(id, user_id, pair, direction,
   threshold, created_at, triggered_at)`. `triggered_at` (nullable) instead of a
   recomputed boolean gives you "first triggered at" and lets the UI distinguish
   "currently triggered" from "has ever triggered".
3. **Any currency pair.** The stub hardcodes three; let the form take any pair
   the API supports, validate server-side.
4. **Live updates.** SSE or WebSocket so a trigger appears without a refresh.
5. **Polish.** Confirm-on-delete, form-level validation messages, keyboard
   handling, empty/error illustrations.
