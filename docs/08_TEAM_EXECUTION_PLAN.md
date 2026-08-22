# 08 — Team Execution Plan

## MVP Prioritization

### MUST HAVE
- Auth (signup/login).
- Create/list/view trip.
- Add/remove/reorder stops (cities) on a trip.
- City search (from seeded data).
- Activity search scoped to a city.
- Schedule an activity onto a stop/date.
- Budget totals + category breakdown (numbers + at least one chart).
- Itinerary view as a day-wise list.
- Public share toggle + public read-only page.

### SHOULD HAVE
- Copy Trip from a public trip.
- Reorder stops/activities (drag or up/down buttons).
- Basic AI recommendation panel on Dashboard (with deterministic fallback live from the start).
- Profile edit (name/photo).
- Saved destinations list.

### NICE TO HAVE
- Calendar/month view of itinerary (react-big-calendar).
- Per-day overbudget alert banner.
- Social share button on public page.
- Filter UI polish (multi-select filters on Activity Search).

### DO NOT BUILD TODAY
- Admin/Analytics dashboard (explicitly optional in the PDF).
- Real payments/bookings.
- Multi-currency.
- Real-time collaborative multi-user editing.
- Password-reset email delivery (stub the link only).
- Native mobile apps.

## Ownership Matrix

| Feature | Dhyey | Namra | Tanish | Dependency | Priority |
|---|---|---|---|---|---|
| DB schema + migrations | ● | | | none | MUST |
| Auth API + JWT | ● | | | schema | MUST |
| Trip/Stop/Activity CRUD API | ● | | | schema | MUST |
| Budget aggregation endpoint | ● | | | CRUD API | MUST |
| Sharing/copy endpoints | ● | | | CRUD API | SHOULD |
| Seed script (cities + activities) | ● | | (content input) | schema | MUST |
| Auth pages (login/signup) | | ● | | Auth API | MUST |
| Dashboard | | ● | | Trip API, Recs API | MUST |
| Create Trip / My Trips | | ● | | Trip API | MUST |
| Itinerary Builder | | ● | | Stop/Activity API | MUST |
| Itinerary View (list) | | ● | | Scheduled Activity API | MUST |
| Budget screen + charts | | ● | | Budget API | MUST |
| Calendar view | | ● | | Itinerary View | NICE |
| Public/Shared page | | ● | | Sharing API | SHOULD |
| Profile/Settings | | ● | | User API | SHOULD |
| AI microservice (embeddings) | | | ● | seeded text data | SHOULD |
| Recommendation API contract | ● | | ● | AI service | SHOULD |
| Recommendation UI panel | | ● | | Recs API | SHOULD |

## Dhyey — Backend Tasks (implementation order)
1. Init repo, Postgres + Prisma setup, `.env` conventions.
2. Define full schema (`05_DATABASE_DESIGN.md`) as Prisma models, run first migration.
3. Auth: signup/login/me endpoints, JWT middleware, bcrypt hashing.
4. Seed script: load ~40–60 cities (from dr5hn dataset, trimmed) + hand-authored activities.
5. Trip CRUD + ownership middleware.
6. Stop CRUD + reorder.
7. Activity search endpoints (city-scoped, filtered).
8. ScheduledActivity CRUD + reorder.
9. Budget aggregation endpoint (derived calculation per `05_DATABASE_DESIGN.md`).
10. Sharing endpoints (`isPublic` toggle, public slug route, copy-trip).
11. Recommendations endpoint: contract + deterministic fallback FIRST (ships value even with zero AI), then wire to Tanish's AI service once ready.
12. Profile/saved-destinations endpoints.
- **Definition of done for each**: endpoint documented behavior matches `06_API_SPECIFICATION.md`, manually tested with Postman/curl, ownership/validation errors return correct codes.

## Namra — Frontend Tasks (implementation order)
1. Scaffold React (Vite) + Tailwind, router, API client wrapper, auth context.
2. Login/Signup pages (can build against Dhyey's endpoints as soon as #3 above lands; use mocked JSON before that).
3. Dashboard shell (static layout first, wire data once Trip API exists).
4. Create Trip + My Trips list.
5. Itinerary Builder: add stop (city search + date pickers), add activity (activity search + date/time assignment).
6. Itinerary View: day-wise grouped list rendering.
7. Budget screen: Chart.js pie (by category) + bar (by day) — swap to "Bklit" once confirmed (see `03_TRD.md` note).
8. Public/Shared trip page (no-auth route) + Copy Trip button.
9. Profile/Settings page.
10. Recommendation panel component (Dashboard + Search) — build against the fallback response shape first, works identically once AI is live.
11. (Stretch) Calendar view.
- **Definition of done**: every page has loading/empty/error states per NFR-06, responsive down to mobile width, wired to real API (no leftover mock data) before demo.

## Tanish — AI/ML Tasks (implementation order)
1. Confirm `sentence-transformers` installs cleanly (`pip install sentence-transformers`), download `all-MiniLM-L6-v2` once, verify offline reuse.
2. Get the ~40–60 seeded city descriptions + activity descriptions from Dhyey's seed script (coordinate early — this is the one hard dependency Tanish has on Dhyey).
3. Build a small FastAPI service: `POST /recommend { queryText, candidates: [{id, text}] } → { ranked: [{id, score}] }`.
4. Precompute + cache candidate embeddings at service startup for speed.
5. Test latency and quality manually with a handful of query strings ("beach and nightlife" → should rank Goa-like cities highly).
6. Hand the exact request/response JSON contract to Dhyey for backend integration (matches `06_API_SPECIFICATION.md` AI/ML section).
7. (Stretch) Add a simple "reason" string (top matching keyword/category) to each result for UI display.
8. Write a short model/dataset note for `07_AI_ML_SPECIFICATION.md` if anything deviates from plan (e.g., model swapped for latency reasons).
- **Definition of done**: service runs locally, returns <2s responses, Dhyey has successfully called it end-to-end at least once before demo prep starts.

## Critical Path
```
Schema (Dhyey) → Seed data (Dhyey, content assist from Tanish's needs) → Auth (Dhyey) → Trip/Stop/Activity CRUD (Dhyey)
        → Frontend pages can start wiring as soon as each endpoint lands (Namra works in parallel from step 1 on scaffolding/UI shells)
        → Budget endpoint → Budget UI
        → Sharing endpoint → Public page UI
        → AI service (Tanish, parallel from minute 1) → Recommendation endpoint wiring (Dhyey) → Recommendation UI (Namra)
```
The true bottleneck is **schema finalization** — Dhyey should freeze the schema in the first 30–45 minutes so Namra can build against the documented `06_API_SPECIFICATION.md` shapes immediately using mock data, without waiting for live endpoints.

## Git & Collaboration Strategy
- `main` branch only, protected by convention (no force-push after teammates pull).
- Feature branches: `dhyey/<feature>`, `namra/<feature>`, `tanish/<feature>` — short-lived, merge to `main` frequently (every 30–60 min) to avoid large conflicts.
- Commit convention: `feat:`, `fix:`, `chore:`, `docs:` prefixes — keep messages short, this is a one-day project, not a style exercise.
- Ownership boundaries prevent most conflicts: Dhyey owns `/server`, Namra owns `/client`, Tanish owns `/ai-service` — three separate directories/repos-in-one minimizes merge collision surface entirely.
- Merge strategy: fast-forward/simple merges, no rebase gymnastics under time pressure.
- Everyone pulls `main` right after each merge to stay in sync — no long-lived divergent branches.

## Frontend–Backend Integration Contract
- Base API URL: `http://localhost:4000/api` (env-configurable for both sides).
- Auth: `Authorization: Bearer <JWT>`.
- Response format: raw JSON object or array as documented per-endpoint in `06_API_SPECIFICATION.md` (no unnecessary `{data: ...}` wrapper).
- Error format: `{ "error": { "code", "message", "field"? } }` on every non-2xx response.
- Loading/empty states: frontend owns these; backend never needs to model "loading."
- IDs: UUID strings everywhere.
- Dates: ISO 8601 `YYYY-MM-DD`; times: `HH:mm` 24-hour.
- Currency: plain decimal numbers, single implied currency for the hackathon (state it in the UI, e.g., "₹" or "$" prefix client-side only).
- Search/pagination: simple query params (`?search=`, `?country=`), no cursor pagination needed at this data scale — return full filtered arrays.
