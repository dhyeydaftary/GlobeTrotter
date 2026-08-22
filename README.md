# GlobeTrotter

**A relational, AI-assisted multi-city travel planning platform.**
Built for the **Odoo × LDCE Hackathon** by a 3-person team.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7?logo=sequelize&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)

GlobeTrotter lets a traveler build a multi-city trip stop by stop, schedule activities onto specific days, watch a budget breakdown recalculate live as the plan changes, get AI-ranked destination suggestions, and publish a finished trip as a public, copyable link. It's a working end-to-end app, not a mockup — every feature described below is implemented and runnable locally.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [AI Recommendation Service](#ai-recommendation-service)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [Known Limitations](#known-limitations)
- [Project Documentation](#project-documentation)
- [Team](#team)

---

## Problem Statement

Planning a multi-city trip today is scattered across notes apps, spreadsheets, and a dozen open browser tabs. There's no single place to sequence which cities you're visiting and when, attach specific activities to specific days, and see the real cost impact of those decisions as you make them — most tools either handle bookings (and ignore planning) or handle inspiration (and ignore structure). Budget tracking in particular tends to be a post-hoc guess rather than something that updates as the itinerary is built.

GlobeTrotter targets three kinds of traveler: **the planner**, who wants dates, cities, and day-by-day activities locked down with a live cost total; **the browser**, who hasn't committed yet and wants to explore destinations and get inspired by other people's trips; and **the sharer**, who's done planning and wants a clean link to send to friends.

## Solution

```mermaid
flowchart TD
    A[Sign up / log in] --> B[Create a trip<br/>name, date range]
    B --> C[Add stops — cities,<br/>each with arrival/departure dates]
    C --> D[Search city/activity catalog,<br/>schedule activities onto stop-days]
    D --> E[Budget breakdown updates live<br/>transport / stay / activities / meals]
    D --> F[AI-ranked destination suggestions<br/>from trip context or general interests]
    E --> G[Publish trip publicly,<br/>or copy someone else's public trip]
    F --> G
```

Every step in that flow is backed by a real API call and a normalized PostgreSQL schema — the budget number, for example, is never stored; it's recomputed from the itinerary on every request (see [Database Schema](#database-schema)).

## Features

**Authentication**
- Email/password signup (first name, last name, email, password) and login, with a "remember me" option.
- OTP-based password reset: a 6-digit code emailed via [Resend](https://resend.com), expiring after 10 minutes, verified before a new password is accepted. The forgot-password endpoint always returns the same generic response regardless of whether the email exists, so account existence can't be enumerated.
- JWT bearer auth (7-day expiry by default) guarding all non-public routes; ownership is checked on every mutating request (a user can only edit their own trips/stops/activities).

**Trip & Itinerary Management**
- Create, edit, delete trips (name, date range, description, cover photo URL).
- Add ordered stops (cities) to a trip, each with its own arrival/departure dates; reorder stops via drag-and-drop-ready reorder endpoints.
- Schedule activities onto a specific date/time within a stop, with per-scheduling cost overrides (so a user can tweak a cost for their trip without mutating the shared catalog price); reorder scheduled activities within a day.
- List and calendar views of the itinerary (`ItineraryView`, `ItineraryCalendar`).

**Search & Discovery**
- City search with filters (name, country, region) across a 61-city seeded catalog, ranked by popularity.
- Activity search scoped to a city, filterable by category, max cost, and max duration, across 305 seeded activities (5 per city, spanning sightseeing/food/adventure/culture/relaxation).
- A saved-destinations "wishlist" independent of any trip.

**Live Budget Breakdown**
- Total cost and a category breakdown (transport, stay, activities, meals) computed on every request from `TripStop` transport/stay costs plus `ScheduledActivity` costs (or their per-trip override) — never a separately stored total that can drift out of sync.
- A day-by-day cost breakdown for charting.

**AI-Powered Recommendations**
- Two entry points: recommendations scoped to an existing trip (ranked against the cities/activities already in it) and general recommendations for a user with no trip yet (ranked against their saved destinations, or a generic query if they have none).
- Powered by a semantic-similarity microservice (see [AI Recommendation Service](#ai-recommendation-service)); degrades to a deterministic popularity-ranked query if the AI service is slow, down, or errors, so the feature never breaks the app.

**Public Sharing**
- Toggle a trip public to generate a short shareable slug; the public page is a read-only view (itinerary + live budget) with no auth required and no other user's private data exposed.
- Copy any public trip into your own account as a new, independently editable trip (deep-copies stops and scheduled activities).

**Profile**
- Edit name/photo/email, view/manage saved destinations, delete account (cascades trips and saved destinations).

## Architecture

Three independent services:

| Service | Role |
|---|---|
| `client/` | React SPA. All app UI; talks to the backend exclusively over REST/JSON. |
| `server/` | Node/Express API. Owns auth, trips, itinerary data, the derived budget calculation, and orchestrates the AI recommendation call (with fallback). PostgreSQL via Sequelize. |
| `ai-service/` | Python/FastAPI microservice. Stateless semantic-similarity ranking over whatever candidate list the backend sends it. |

```mermaid
flowchart LR
    client["client\n(React SPA)"] -- "REST / JSON" --> server["server\n(Express)"]
    server -- "response" --> client
    server -- "POST /recommend\n(1.5s timeout)" --> ai["ai-service\n(FastAPI)"]
    ai -- "ranked candidates" --> server
    server -- "SQL" --> db[("PostgreSQL")]
```

The server is the only service that talks to Postgres or to the AI service — the client never calls the AI service directly. On every recommendation request, the server builds a query string and a candidate list, calls the AI service with a 1.5s timeout, and if that call fails or times out, transparently falls back to `SELECT ... ORDER BY popularity_score DESC` instead. The response always includes a `source: "ai" | "fallback"` field so the caller (and a demo narration) can tell which path served it, but the client's behavior doesn't depend on it.

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS | SPA, client-side routing via `react-router-dom`, charts via `chart.js`/`react-chartjs-2`, animation via `motion` (Framer Motion's successor), icons via `lucide-react`. |
| Backend | Node.js + Express 4 | Layered `routes → controllers → services → models`. |
| ORM / DB | Sequelize 6 + PostgreSQL | See [note below](#a-note-on-the-orm). |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` | Stateless bearer tokens; passwords hashed, never stored plaintext. |
| Email | Resend | Transactional email for OTP password-reset codes; if `RESEND_API_KEY` isn't set, the OTP is logged to the server console instead of failing the flow (dev-friendly, not a silent no-op). |
| AI service | Python 3.9+ + FastAPI + `sentence-transformers` | `all-MiniLM-L6-v2` model, CPU-only. |

#### A note on the ORM
The original technical plan specified **Prisma**. It was swapped for **Sequelize** during the build because Prisma's engine binary couldn't be downloaded in the dev sandbox (network-restricted). Same PostgreSQL backend, same relational schema — this was a tooling substitution, not a design change. Full explanation in [`server/README.md`](./server/README.md).

## Database Schema

Seven tables, PostgreSQL, managed via Sequelize models with explicit cascade/restrict rules. Budget is **derived**, not stored — see [Live Budget Breakdown](#features).

```mermaid
erDiagram
    USER ||--o{ TRIP : owns
    USER ||--o{ SAVED_DESTINATION : saves
    TRIP ||--o{ TRIP_STOP : contains
    CITY ||--o{ TRIP_STOP : "located in"
    CITY ||--o{ ACTIVITY : offers
    CITY ||--o{ SAVED_DESTINATION : "referenced by"
    TRIP_STOP ||--o{ SCHEDULED_ACTIVITY : schedules
    ACTIVITY ||--o{ SCHEDULED_ACTIVITY : "instance of"

    USER {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string name
        string photo_url
        enum role "user | admin"
        string password_reset_otp
        timestamp password_reset_otp_expires_at
        timestamp created_at
    }
    TRIP {
        uuid id PK
        uuid user_id FK
        string name
        date start_date
        date end_date
        text description
        string cover_photo_url
        boolean is_public
        string public_slug UK
        timestamp created_at
    }
    CITY {
        uuid id PK
        string name
        string country
        string region
        text description
        float latitude
        float longitude
        int cost_index "1-5"
        int popularity_score
        string image_url
    }
    TRIP_STOP {
        uuid id PK
        uuid trip_id FK
        uuid city_id FK
        date arrival_date
        date departure_date
        int order_index
        decimal transport_cost
        decimal stay_cost
    }
    ACTIVITY {
        uuid id PK
        uuid city_id FK
        string name
        enum category "sightseeing|food|adventure|culture|relaxation"
        text description
        decimal cost
        int duration_minutes
        string image_url
    }
    SCHEDULED_ACTIVITY {
        uuid id PK
        uuid trip_stop_id FK
        uuid activity_id FK
        date scheduled_date
        time scheduled_time
        int order_index
        decimal cost_override "nullable"
    }
    SAVED_DESTINATION {
        uuid id PK
        uuid user_id FK
        uuid city_id FK
        timestamp created_at
    }
```

**Cascade strategy:** deleting a `User` cascades to their `Trip`s and `SavedDestination`s; deleting a `Trip` cascades to its `TripStop`s; deleting a `TripStop` cascades to its `ScheduledActivity`s. `City → TripStop`, `City → Activity`, and `Activity → ScheduledActivity` are **restrict** — cities and activities are seeded reference data and aren't deletable while referenced.

**Budget computation** (in `server/src/services/budgetService.js`, computed fresh on every request):
```
total = Σ(TripStop.transport_cost + TripStop.stay_cost)
      + Σ(ScheduledActivity.cost_override ?? Activity.cost)

by_category = {
  transport:  Σ TripStop.transport_cost
  stay:       Σ TripStop.stay_cost
  meals:      Σ cost  WHERE Activity.category == 'food'
  activities: Σ cost  WHERE Activity.category != 'food'
}
```

## API Reference

Base URL: `http://localhost:4000/api`. All request/response bodies are JSON. Protected routes require `Authorization: Bearer <jwt>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Liveness check |
| POST | `/auth/signup` | — | Create account (email, password, firstName, lastName) |
| POST | `/auth/login` | — | Log in, returns JWT |
| POST | `/auth/logout` | ✅ | Stateless no-op (nothing to invalidate server-side) |
| GET | `/auth/me` | ✅ | Current user |
| POST | `/auth/forgot-password` | — | Sends a 6-digit OTP via email; always returns a generic success message |
| POST | `/auth/reset-password` | — | Verifies OTP (10-min expiry) and sets a new password |
| POST | `/trips` | ✅ | Create trip |
| GET | `/trips` | ✅ | List own trips (with stop counts) |
| GET | `/trips/:id` | optional | Get trip detail — owner always, others only if public |
| PATCH | `/trips/:id` | ✅ | Update trip fields / toggle public (generates a slug on first publish) |
| DELETE | `/trips/:id` | ✅ | Delete trip (cascades stops → scheduled activities) |
| GET | `/trips/:id/budget` | optional | Live budget breakdown — owner or public trip |
| POST | `/trips/:id/copy` | ✅ | Deep-copy a trip (own or public) into a new trip you own |
| GET | `/trips/:tripId/recommendations` | ✅ | AI-ranked cities/activities for this trip, with fallback |
| POST | `/trips/:tripId/stops` | ✅ | Add a stop (city + date range) to a trip |
| PATCH | `/trips/:tripId/stops/reorder` | ✅ | Reorder stops within a trip |
| PATCH | `/stops/:id` | ✅ | Update a stop (dates, transport/stay cost) |
| DELETE | `/stops/:id` | ✅ | Delete a stop (cascades scheduled activities) |
| POST | `/stops/:stopId/activities` | ✅ | Schedule an activity onto a stop-day |
| PATCH | `/stops/:stopId/activities/reorder` | ✅ | Reorder scheduled activities within a stop |
| PATCH | `/scheduled-activities/:id` | ✅ | Update a scheduled activity (date/time/cost override) |
| DELETE | `/scheduled-activities/:id` | ✅ | Remove a scheduled activity |
| GET | `/cities` | — | Search cities (`search`, `country`, `region`) |
| GET | `/cities/:id` | — | Get a single city |
| GET | `/cities/:cityId/activities` | — | Activities catalog for a city |
| GET | `/activities` | — | Search activities (`cityId`, `category`, `maxCost`, `maxDuration`) |
| GET | `/recommendations` | ✅ | General AI recommendations (no trip context — based on saved destinations) |
| GET | `/users/me/profile` | ✅ | Get profile |
| PATCH | `/users/me/profile` | ✅ | Update profile (name, photo, email) |
| DELETE | `/users/me` | ✅ | Delete account (cascades trips, saved destinations) |
| GET | `/users/me/saved-destinations` | ✅ | List saved destinations |
| POST | `/users/me/saved-destinations` | ✅ | Save a city |
| DELETE | `/users/me/saved-destinations/:cityId` | ✅ | Unsave a city |
| GET | `/public/trips/:slug` | — | Read-only public trip view (itinerary + budget, no auth) |

Errors follow a consistent shape: `{ "error": { "code": "...", "message": "...", "field": "..." } }`.

## AI Recommendation Service

A ~130-line FastAPI service (`ai-service/main.py`) doing one job: rank a list of candidate destinations against a free-text query by semantic similarity.

- **Model:** [`sentence-transformers/all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) — Apache 2.0, ~90MB, 384-dim embeddings, CPU-only. Loaded once at startup via a FastAPI `lifespan` handler and reused for every request.
- **Contract:** `POST /recommend` takes `{ queryText, candidates: [{ id, text }] }` and returns `{ ranked: [{ id, score }] }`, sorted by cosine similarity (mapped to `[0, 1]`), full list returned — the caller decides how many to use.
- **Stateless:** no candidate caching between requests; the backend sends its current pool (already excluding cities/activities already in the trip) on every call.
- **How the backend uses it:** for a trip-scoped request, the query text is built from the trip's existing stop cities (`"traveler already visiting: Goa, Mumbai"`); for a general request with no trip, it's built from the user's saved destinations, or a generic fallback query if they have none. Either way, the backend embeds the query with every unvisited city/activity in one batched `encode()` call, gets back a ranked list, hydrates the top 5 into full records, and returns them tagged `source: "ai"`.
- **Fallback:** a 1.5s timeout on the HTTP call. On timeout, non-200 response, or any network error, the backend instead runs `SELECT * FROM city WHERE id NOT IN (trip's cities) ORDER BY popularity_score DESC LIMIT 5` (or an equivalent activity query) and returns it tagged `source: "fallback"`. This fallback ships in the same request path, not as an afterthought — the recommendations endpoints are never empty and never fail because the AI service is down.
- **Sanity check:** `ai-service/test_recommend.py` sends a "beach and nightlife" query against 5 city descriptions and prints a ranked table.

## Project Structure

```
odoo-hackathon/
├── client/                  React SPA (Namra)
│   └── src/
│       ├── api/              API client (client.js) + local mocks
│       ├── components/       AppLayout, Navbar, TripCard, ItineraryCalendar, ...
│       ├── context/           AuthContext (JWT + remember-me)
│       ├── lib/                Shared motion/spring config
│       └── pages/              LandingPage, Dashboard, MyTrips, CreateTrip,
│                                ItineraryBuilder, ItineraryView, BudgetPage,
│                                PublicTripView, ProfilePage, Login/Signup/ForgotPassword
├── server/                  Node/Express API (Dhyey)
│   ├── docs/                  Full planning docs (PRD, SRS, TRD, architecture, DB, API, AI/ML, ...)
│   └── src/
│       ├── config/            Sequelize connection
│       ├── controllers/        Business logic per resource
│       ├── middleware/          authGuard / optionalAuth, errorHandler
│       ├── models/              One file per entity + index.js (associations/cascades)
│       ├── routes/              Express route definitions
│       ├── seedData/           City list + activity generator
│       ├── services/            budgetService (derived budget), emailService (Resend OTP)
│       ├── app.js               Express app + route mounting
│       ├── index.js             Entry point
│       └── seed.js              Seed script
└── ai-service/               Python/FastAPI recommendation service (Tanish)
    ├── main.py                  The service
    ├── test_recommend.py        Sanity test script
    └── requirements.txt
```

## Getting Started

Each service has its own detailed setup doc; this is the fastest path to all three running locally. Run each step in its own terminal.

**1. PostgreSQL**
```sql
CREATE DATABASE globetrotter;
```

**2. Backend** (`server/`) — full detail: [`server/README.md`](./server/README.md)
```bash
cd server
cp .env.example .env   # set DATABASE_URL if it differs from the default
npm install
node src/index.js      # starts the API on :4000, auto-creates tables via sequelize.sync()
node src/seed.js        # in a second terminal — seeds cities/activities/demo users
```

**3. AI service** (`ai-service/`) — full detail: [`ai-service/README.md`](./ai-service/README.md)
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate    # Windows — use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**4. Frontend** (`client/`) — there's no dedicated `client/README.md` yet; this is the whole setup:
```bash
cd client
cp .env.example .env
npm install
npm run dev             # starts Vite on :5173 by default
```

By default the client expects the API at `http://localhost:4000/api`, and the server expects the AI service at `http://localhost:8000` — both configurable via `.env`.

## Environment Variables

**`server/.env`**

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | API port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/globetrotter` | Postgres connection string |
| `JWT_SECRET` | — | Secret used to sign/verify auth tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `AI_SERVICE_URL` | `http://localhost:8000` | Base URL for the AI microservice |
| `RESEND_API_KEY` | — | Resend API key; if unset, OTPs are logged to the console instead of emailed |
| `EMAIL_FROM` | `onboarding@resend.dev` | From-address for OTP emails |

**`client/.env`**

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` | Backend base URL |

**`ai-service`** has no `.env` — it's a stateless, config-free service.

## Demo Credentials

Seeded by `server/src/seed.js`:

| Email | Password | Notes |
|---|---|---|
| `demo@globetrotter.app` | `demo1234` | Main demo account, no trips pre-created |
| `inspiration@globetrotter.app` | `demo1234` | Owns a pre-built public trip ("Goa & Mumbai Getaway") for demoing the copy-trip flow |

## Known Limitations

Kept here deliberately rather than glossed over:

- **No admin dashboard.** The `User` model has a `role` enum (`user`/`admin`), and the original SRS listed an admin role as an *optional* stretch goal — but no admin routes, admin middleware, or admin UI were built. The field exists; nothing reads it.
- **No per-day budget threshold alerts.** The database design and `computeBudget()` both leave a hook for flagging days that exceed a budget threshold (FR-17 in the SRS), but there's no threshold field on the schema yet and the flagged-days list is always empty.
- **No automated test suite.** Verification is a bash integration script (`server/smoke_test.sh`) that exercises the full MVP flow end-to-end against a real Postgres instance — there's no unit-test framework wired into either `package.json`.
- **No Docker or CI configuration.** The app is designed to run locally (three processes + local Postgres); there's no Dockerfile, docker-compose, or GitHub Actions workflow in the repo.
- **No `client/README.md` yet** — frontend setup is the two commands in [Getting Started](#getting-started).

## Project Documentation

Full planning documentation lives in [`server/docs/`](./server/docs/): PRD, SRS, TRD, system architecture, database design, API spec, AI/ML spec, team execution plan, and demo strategy. Those docs describe the original plan; where the build diverged from it — the auth overhaul (first/last name, remember-me, OTP reset), the two-surface AI recommendation flow, the Prisma→Sequelize swap, the full visual redesign — this README and the per-service READMEs describe what actually shipped.

## Team

| Name | Area |
|---|---|
| **Dhyey** | Backend (`server/`) |
| **Namra** | Frontend (`client/`) |
| **Tanish** | AI/ML (`ai-service/`) |
