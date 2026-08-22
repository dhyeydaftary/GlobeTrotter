# 04 — System Architecture

## High-Level Diagram

```mermaid
flowchart TB
    FE["Frontend (React SPA)"]
    BE["Backend API (Node/Express)"]
    DB[("PostgreSQL")]
    AI["AI/ML Service (Python, FastAPI + sentence-transformers)"]
    EXT["Seeded Dataset (world cities) — loaded once into DB, no live external calls at runtime"]

    FE -->|REST/JSON + JWT| BE
    BE -->|Prisma/SQL| DB
    BE <-->|internal HTTP| AI
    EXT -.->|one-time seed script| DB
```

## Component Responsibilities

- **Frontend (React SPA)**: renders all 12–13 screens, owns UI state, calls backend REST API, never talks to the AI service or DB directly.
- **Backend API**: single source of truth for business logic — auth, ownership checks, budget computation, trip-copy logic, sharing logic. Talks to Postgres via Prisma and to the AI service over HTTP.
- **PostgreSQL**: stores all persistent relational data — users, trips, stops, cities, activities, scheduled activities, saved destinations.
- **AI/ML Service**: stateless recommendation service. Given text (interests, existing trip content), returns ranked city/activity IDs by embedding similarity. Called only by the backend, never directly by the frontend.
- **Seeded Dataset**: a static cities (and activities) reference dataset loaded into Postgres once at setup time — not fetched live during the demo, to remove external-API risk.

## Data Flow — Trip Creation

```mermaid
sequenceDiagram
    participant U as User (Frontend)
    participant B as Backend API
    participant D as Postgres

    U->>B: POST /trips {name, startDate, endDate, description}
    B->>B: validate dates, auth check
    B->>D: INSERT INTO trips
    D-->>B: trip row
    B-->>U: 201 Created {trip}
```

## Data Flow — Authentication

```mermaid
sequenceDiagram
    participant U as User
    participant B as Backend API
    participant D as Postgres

    U->>B: POST /auth/login {email, password}
    B->>D: SELECT user WHERE email
    D-->>B: user row (hashed password)
    B->>B: bcrypt.compare(password, hash)
    B-->>U: 200 {token, user}
```

## Data Flow — Itinerary Build (Stop + Activity)

```mermaid
sequenceDiagram
    participant U as User
    participant B as Backend API
    participant D as Postgres

    U->>B: POST /trips/:id/stops {cityId, arrival, departure}
    B->>D: INSERT trip_stops
    U->>B: POST /stops/:id/activities {activityId, date, time}
    B->>D: INSERT scheduled_activities
    B->>D: SELECT SUM(cost) grouped by category for trip
    D-->>B: aggregated budget
    B-->>U: 200 {stop, scheduledActivity, updatedBudget}
```

## Data Flow — AI Recommendation

```mermaid
sequenceDiagram
    participant U as User
    participant B as Backend API
    participant A as AI Service
    participant D as Postgres

    U->>B: GET /recommendations?tripId=123
    B->>D: fetch trip's existing cities/activities text
    B->>A: POST /recommend {queryText, candidatePool}
    A->>A: embed query + candidates, cosine similarity rank
    A-->>B: ranked candidate IDs + scores
    B->>D: hydrate full city/activity rows
    B-->>U: 200 {recommendations[]}
```

## Data Flow — Sharing

```mermaid
sequenceDiagram
    participant U as Owner
    participant V as Visitor (no auth)
    participant B as Backend API
    participant D as Postgres

    U->>B: PATCH /trips/:id {isPublic: true}
    B->>D: UPDATE trips SET is_public, public_slug
    V->>B: GET /public/trips/:slug
    B->>D: SELECT trip WHERE public_slug AND is_public
    B-->>V: 200 read-only DTO
```

## Notes
- The AI service is intentionally the *only* extra runtime component — everything else is a standard 3-tier web app, which minimizes integration risk given the deadline.
- If the AI service is down or slow, the backend recommendation endpoint falls back to a deterministic query (e.g., "top cities by seeded popularity score not already in the trip") — see `07_AI_ML_SPECIFICATION.md`.
