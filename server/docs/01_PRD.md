# 01 — Product Requirements Document (PRD)

## Product Overview
GlobeTrotter is a personalized, relational-database-backed multi-city travel planning platform. Users build trips stop-by-stop, attach activities to specific days, watch a live budget breakdown, visualize the plan on a calendar/timeline, and share it publicly for others to view or copy.

## Problem Being Solved
Planning a multi-city trip today is scattered across notes apps, spreadsheets, and multiple booking sites. There is no single place to sequence stops, assign day-by-day activities, and see running cost impact in real time. GlobeTrotter consolidates itinerary building, discovery, and budgeting into one flow.

## Target Users
- Independent travelers planning multi-city / multi-day trips.
- Budget-conscious travelers who want a live cost breakdown, not a post-hoc estimate.
- Travelers who want inspiration from others' public itineraries.

## User Personas
- **The Planner** — plans trips 2–3 months out, wants structure: dates, cities, day-by-day activities, budget certainty.
- **The Browser** — not yet committed, wants to explore cities/activities and get inspired by others' shared trips.
- **The Sharer** — has finished planning and wants a clean public link to send to friends or use as a following-along page.

## Product Vision
A single, intelligent, collaborative surface where dreaming, structuring, budgeting, and sharing a trip happen in one continuous flow — not five disconnected tools.

## Goals (for this hackathon build)
- Deliver one complete, working end-to-end flow: signup → create trip → build itinerary → view budget → view calendar → share publicly.
- Demonstrate a normalized relational schema doing real work (live aggregation for budget, join-heavy itinerary rendering).
- Ship one genuinely useful AI-assisted recommendation, not a gimmick.

## Non-Goals (explicitly out of scope today)
- Real payments / bookings.
- Real-time multi-user collaborative editing of the same trip.
- Full internationalization / multi-currency.
- Native mobile apps (responsive web only).
- Production-grade admin analytics (only if time remains).

## Core User Journeys
1. **Plan a trip end-to-end**: Signup → Dashboard → Create Trip → Add Stops (cities) → Add Activities to stops/dates → Review Itinerary → Check Budget → Share.
2. **Get inspired**: Browse public shared trips → Copy Trip into own account → Edit.
3. **Manage existing trips**: Dashboard/My Trips → open a trip → edit stops/activities → re-check budget.

## Functional Requirements (summary — see `02_SRS.md` for IDs)
- Auth (signup/login/logout).
- Trip CRUD.
- Stop CRUD + reorder within a trip.
- City search/browse with filters.
- Activity search/browse with filters, scoped to a stop's city.
- Scheduling activities onto specific stop-days with time.
- Auto-computed budget breakdown by category (transport/stay/activities/meals).
- Calendar/timeline and list views of the itinerary.
- Public sharing toggle + read-only public page + copy-trip action.
- Profile edit + saved destinations list.
- (Enhancement) AI-assisted destination/activity recommendations.

## MVP Scope
See `08_TEAM_EXECUTION_PLAN.md` §MUST HAVE. In one line: **auth, trip CRUD, itinerary builder with city+activity search, budget breakdown, list-style itinerary view, public share/copy.**

## Advanced / Stretch Features
Calendar drag-to-reorder, admin analytics dashboard, AI recommendations surfaced on Dashboard/Search, social share buttons, saved destinations.

## Success Criteria
- A judge can, live, create a trip with 2+ cities, attach activities, watch the budget number update, and open the public share link — with zero errors.
- Database has ≥7 normalized related tables actually exercised by the UI (not decorative).
- At least one AI/ML feature is live and returns a result in <2s.

## Demo Scenario
See `09_DEMO_STRATEGY.md`.
