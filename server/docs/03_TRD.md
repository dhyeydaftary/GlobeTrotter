# 03 — Technical Requirements Document (TRD)

## Stack Selection Rationale

**Stack note**: the team specified "MERN + Python + PostgreSQL + Bklit (for graphs)." MERN's "M" is MongoDB, which conflicts with the explicit PostgreSQL requirement and with the PDF's mandate to demonstrate a relational database — so this blueprint treats the stack as **PERN** (PostgreSQL + Express + React + Node), i.e. Mongo is dropped in favor of Postgres, everything else kept. The schema in `05_DATABASE_DESIGN.md` was already written for a relational DB, so this costs nothing. **"Bklit" could not be verified as an established charting library** — no adoption/documentation found under that name. Charting below is left as **Chart.js** (via `react-chartjs-2`) as a safe, well-documented placeholder; swap in the intended library the moment it's confirmed — the budget-chart component is small and isolated, so the swap is low-risk.

Given: 3-person team, single-day deadline, one backend generalist (Dhyey), one frontend generalist (Namra), one AI/ML generalist (Tanish) who also needs to hand off a simple integration point to backend.

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **React (Vite) + Tailwind CSS** | Fast scaffolding, huge ecosystem for charts/calendar, Namra likely already fluent, no SSR complexity needed for a hackathon SPA. |
| Charts | **Chart.js (`react-chartjs-2`)** — *placeholder pending "Bklit" confirmation* | Well-documented, simple pie/bar charts for budget breakdown, minimal setup; swap for the intended library once identified without touching any other layer. |
| Calendar/Timeline | Hand-rolled day-grouped list first; **react-big-calendar** only if time remains for FR-18 stretch | Avoid overengineering a full drag-drop calendar under time pressure. |
| Backend | **Node.js + Express** | Fast to scaffold REST APIs; JSON-native; easy to call the Python AI microservice over HTTP; tightest integration with a JS frontend and shared JSON conventions. |
| AI/ML runtime | **Python (FastAPI) microservice** | Isolates `sentence-transformers` inference from the main API — matches the team's explicit "+ Python" requirement and keeps Tanish's work fully decoupled (see `07_AI_ML_SPECIFICATION.md`). |
| Database | **PostgreSQL** (not MongoDB) | Real relational DB with proper FK constraints — satisfies both the team's explicit PostgreSQL choice and the PDF's mandatory relational-DB requirement. |
| ORM | **Prisma** | Fast schema iteration, auto-generated types, quick seeding scripts — critical for hackathon speed with Node + Postgres. |
| Auth | **JWT (email+password, bcrypt hash)** | Simple, stateless, no third-party OAuth setup needed under time pressure. |
| AI/ML | **Python microservice using `sentence-transformers` (pretrained, CPU-only) exposed via a tiny FastAPI/Flask HTTP endpoint**, called by the Node backend over HTTP | Keeps AI/ML fully decoupled — Tanish can build/test independently and hand off one HTTP contract; no GPU needed; Apache-2.0 licensed model. |
| Image/File handling | Optional cover photo → store as a URL string (use a placeholder/stock image service or direct file-to-base64 for demo) rather than building real object storage today | Removes an entire infra dependency (S3 etc.) from the critical path. |
| Search | Simple SQL `ILIKE`/`WHERE` filtering for city/activity search (Postgres) | Full-text search engines (Elastic) are unnecessary at this data scale. |
| Sharing | Public trip via a `slug` (UUID or short random string) column + a public, unauthenticated GET route | No extra infra required. |
| Deployment | **Localhost demo primary**; optional one-click deploy (Render/Railway for backend+DB, Vercel/Netlify for frontend) only after MVP is stable | Never let deployment block the demo — local-first, deploy only as polish if time remains. |

## Frontend Architecture
- React SPA, React Router for pages, a small global auth context (JWT in memory + localStorage), fetch/Axios wrapper with a base URL and auth header injection.
- Component split: `pages/` (one per screen) + `components/` (TripCard, StopEditor, ActivityCard, BudgetChart, CalendarView, ItineraryDay).

## Backend Architecture
- Layered: `routes → controllers → services → prisma (data access)`.
- Services own business logic (budget calculation, ownership checks, trip-copy logic).
- Middleware: `authGuard`, centralized `errorHandler` returning the standard error shape.

## Database
PostgreSQL, see `05_DATABASE_DESIGN.md` for full schema.

## Authentication
JWT issued on login/signup, sent as `Authorization: Bearer <token>`, verified by middleware on protected routes. Public trip routes bypass the guard entirely.

## API Communication
REST + JSON over HTTPS(local HTTP for dev). See `06_API_SPECIFICATION.md`.

## File/Image Handling
Cover photo: accept a URL or a small base64 upload capped at a small size; store as text column. No dedicated object storage today.

## Charts
Chart.js `Pie` (category breakdown) + `Bar` (cost per day) via `react-chartjs-2` — placeholder pending confirmation of "Bklit"; the `BudgetChart` component is isolated enough to swap libraries in minutes without touching the API or data shape.

## Calendar/Timeline
Phase 1: grouped list by date (`Day 1 — City`, activities beneath). Phase 2 (stretch): `react-big-calendar` month/week view fed from the same scheduled-activities data.

## Search
Server-side filtering via Prisma `where` clauses on City/Activity tables; debounce on the frontend input.

## Sharing
`Trip.isPublic boolean` + `Trip.publicSlug string unique`. Public GET endpoint returns a read-only DTO (no user PII beyond display name).

## AI/ML Integration
Node backend calls the Python AI microservice over internal HTTP (`POST /recommend`). See `07_AI_ML_SPECIFICATION.md` for full contract and fallback.

## Why This Is Not Overengineered
No microservices beyond the one unavoidable AI service; no message queues, no Kubernetes, no GraphQL, no multi-tenant complexity, no real payment/booking integration, no native apps. Every added moving part (Prisma, Recharts, one Python service) has a specific, load-bearing job in the required feature set.
