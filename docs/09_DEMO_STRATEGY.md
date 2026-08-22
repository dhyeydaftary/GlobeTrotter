# 09 — Demo Strategy & Risk Register

## Demo Flow (the story)

```
1. Login as a pre-seeded demo user (skip live signup typing — faster, no typo risk)
2. Dashboard — show recommended destinations row (AI-ranked), "Plan New Trip"
3. Create Trip — "Goa & Mumbai Getaway", set dates
4. Itinerary Builder — Add Stop: search "Goa" → add city with dates
                        Add Stop: search "Mumbai" → add city with dates
5. Activity Search inside Goa stop → add 2–3 activities with cost/time
6. Switch to Itinerary View — show day-wise structured plan
7. Budget screen — pie/bar chart updates live reflecting the activities just added
8. Toggle trip to Public → open the generated public link in a new tab (read-only)
9. (From a second/incognito session) Copy Trip → show it now appears in that account's My Trips
```

This single flow touches: auth, trip CRUD, stop CRUD, city search, activity search, scheduling, budget aggregation, itinerary rendering, sharing, and copy — essentially the entire schema and every MUST HAVE feature, in under 3 minutes.

## Demo Script (talking points)
- Open on the Dashboard: "GlobeTrotter's home screen surfaces AI-recommended destinations based on what you've planned so far — that's a real embedding model ranking real seeded city data, not a static list."
- While building the itinerary: "Every stop and activity is a real row in a normalized Postgres schema — trips, stops, activities, and scheduled activities are all properly foreign-keyed."
- On the Budget screen: "This number isn't cached — it's computed live from the itinerary you just built."
- On the public share page: "This is a genuinely public, unauthenticated page — no login needed to view or copy someone's trip."

## Best Features to Showcase
1. The live budget update as activities are added (visually proves the relational aggregation).
2. The AI recommendation panel (differentiator vs. plain-CRUD competing teams).
3. The public share → copy trip loop (shows the "collaborative/inspire" angle from the vision statement).

## What to Avoid Demonstrating
- Do not attempt live signup with a fresh email during the demo — use a pre-seeded account to avoid live bugs/typos costing time.
- Do not demo the Admin dashboard unless it's fully polished (it's optional — a half-built admin screen hurts more than an absent one).
- Do not manually type a long AI query live if latency or model loading is even slightly inconsistent — have a known-good query ready, typed once, rehearsed.
- Do not show raw API/Postman calls as "proof" — the UI should carry the whole demo.

## Sample Trip Data to Prepare (seed in advance)
- 1 demo user account, pre-logged-in state ready.
- 1 pre-built "inspiration" trip already marked public (for the Copy Trip step), owned by a second seeded user.
- ~40–60 real, recognizable cities (so judges see names they know: Goa, Mumbai, Paris, Bali, Tokyo, etc.) with short descriptions written for good embedding signal (e.g., "Goa — beaches, nightlife, seafood, Portuguese heritage").
- 5–8 activities per seeded city with varied categories/costs so budget charts look meaningfully segmented, not flat.

## Making the Product Feel Complete
- Consistent empty states with a clear call-to-action (never a blank white page).
- Consistent currency formatting and date formatting everywhere.
- A polished landing/Dashboard even if Calendar view or Admin never gets built — judges see the surface, not the backlog.
- Keep unfinished features simply absent from navigation rather than visible-but-broken.

## Hackathon Risk Register

| Risk | Probability | Impact | Mitigation | Fallback |
|---|---|---|---|---|
| AI model/service not ready in time | Medium | Medium | Build deterministic fallback into the same endpoint from hour 1, not as an afterthought | Recommendation panel silently uses popularity-ranked fallback; demo narration doesn't need to mention it unless asked |
| Dataset seeding takes longer than expected | Medium | Medium | Trim to ~40–60 hand-picked cities instead of the full 150k-row dataset; write activities by hand/script early | Reduce further to ~15–20 cities if truly pressed for time — still enough for a convincing demo |
| Backend/frontend integration mismatches | Medium | High | Freeze `06_API_SPECIFICATION.md` in the first hour; both sides build against it; Namra uses mock JSON matching the spec until endpoints are live | Quick contract-alignment sync every ~1 hr |
| Auth bugs (token expiry, CORS) | Low-Medium | High | Use a long-lived JWT for the hackathon (not production-safe, acceptable today); configure CORS permissively for localhost | Pre-seeded, pre-logged-in demo session as backup so a live auth bug doesn't block the demo |
| Merge conflicts | Low | Medium | Directory-based ownership boundaries (`/server`, `/client`, `/ai-service`); frequent small merges | Resolve via whoever owns that directory; avoid parallel edits to `06_API_SPECIFICATION.md` without a quick sync |
| Deployment/hosting issues near deadline | Medium | Medium | Localhost-first demo plan; deployment attempted only after MVP is stable, treated as pure polish | Demo entirely from localhost if hosting fails — judges care about the working product, not the URL |
| Database migration issues late in the day | Low | High | Freeze schema early (first 45 min); avoid destructive migrations after seed data exists | Keep a schema.sql / Prisma migration backup; if a migration breaks things, roll back to last good migration rather than debugging live |
| Running out of time for Calendar/Admin (stretch features) | High | Low | These are explicitly NICE TO HAVE / DO NOT BUILD TODAY — expected and acceptable to skip | Demo doesn't route through them at all |
| External API failure (none used at runtime) | N/A | N/A | Deliberately designed to avoid any live external API calls during the demo (all reference data pre-seeded) | N/A — risk engineered away |
