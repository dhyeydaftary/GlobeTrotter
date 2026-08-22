# GlobeTrotter Backend — Setup

## Prerequisites
- Node.js 18+
- PostgreSQL running locally (or update `DATABASE_URL`)

## Setup
```bash
cd server
npm install
```

Create a database:
```sql
CREATE DATABASE globetrotter;
```

Copy `.env.example` to `.env` (or edit the existing `.env`) and set `DATABASE_URL` to match your local Postgres credentials.

## Run
```bash
node src/index.js
```
This connects to Postgres, auto-creates all tables from the Sequelize models (`sequelize.sync()`), and starts the API at `http://localhost:4000/api`.

## Seed reference data
```bash
node src/seed.js
```
Seeds 31 cities, 155 activities (5 per city), two demo users, and one pre-built **public** trip for the "Copy Trip" demo beat.

**Demo accounts:**
- `demo@globetrotter.app` / `demo1234` — main demo account
- `inspiration@globetrotter.app` / `demo1234` — owns the public "Goa & Mumbai Getaway" trip at `GET /api/public/trips/goa-mumbai-getaway-demo`

The seed script is idempotent-safe: if cities already exist, it skips re-seeding rather than creating duplicates. To start fresh:
```sql
TRUNCATE TABLE scheduled_activities, trip_stops, trips, activities, cities, saved_destinations, users RESTART IDENTITY CASCADE;
```

## Smoke test
```bash
bash smoke_test.sh
```
Exercises the full MVP flow: signup → login → create trip → add stop → add activity → budget → public share → copy trip → reorder → cascading delete. All 17 checks pass against a clean local Postgres.

## Project structure
```
src/
  config/database.js       Sequelize connection
  models/                  One file per entity + index.js wiring associations/cascades
  controllers/             Business logic per resource
  routes/                  Express route definitions
  middleware/               authGuard (JWT), errorHandler (standard error shape)
  services/budgetService.js Derived budget computation (not stored)
  seedData/                 City + activity generator data
  seed.js                   Seed script
  app.js                    Express app + route mounting
  index.js                  Entry point
```

## Note on ORM choice
The original TRD called for Prisma, but Prisma's engine binary couldn't be downloaded in the build/dev sandbox this was built in (network-restricted). Swapped to **Sequelize** — pure npm package, no external binary fetch, same PostgreSQL backend, same schema. If Prisma works fine on your actual machine and you'd prefer it, the schema in `05_DATABASE_DESIGN.md` translates directly — this is a drop-in-equivalent choice, not a functional compromise.

## AI service integration
The recommendations endpoint (`GET /api/trips/:tripId/recommendations`) calls `AI_SERVICE_URL` (default `http://localhost:8000`, set in `.env`) and **falls back automatically** to a deterministic popularity-ranked query if the AI service is unreachable or slow (1.5s timeout). This is already tested and working — Tanish's service just needs to expose `POST /recommend` matching the contract in `07_AI_ML_SPECIFICATION.md` / `PROMPT_FOR_TANISH.md`.

## Still to do (from 08_TEAM_EXECUTION_PLAN.md)
- Wire to Tanish's real AI service once it's up (fallback path already proven).
- Optional: profile photo upload handling beyond a plain URL field.
- Optional: expand seed set beyond 31 cities if time allows.
