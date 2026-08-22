# PDF Requirement Analysis — GlobeTrotter (Odoo × LDCE Hackathon)

## 1. Explicitly Required by the PDF (13 screens/flows)

| # | Screen | Core Purpose | Required Components |
|---|--------|--------------|----------------------|
| 1 | Login / Signup | Auth entry point | Email/password, login, signup link, forgot password, validation |
| 2 | Dashboard / Home | Hub for trips + inspiration | Welcome msg, recent trips, "Plan New Trip", recommended destinations, budget highlights |
| 3 | Create Trip | Start a trip | Name, start/end dates, description, optional cover photo, save |
| 4 | My Trips (list) | Manage trips | Trip cards: name, date range, destination count, edit/view/delete |
| 5 | Itinerary Builder | Build day-wise plan | Add Stop, select city + dates, assign activities, reorder cities |
| 6 | Itinerary View | Review full plan | Day-wise layout, city headers, activity blocks (time+cost), calendar/list toggle |
| 7 | City Search | Discover cities | Search bar, city list w/ meta (country, cost index, popularity), Add to Trip, filter |
| 8 | Activity Search | Discover activities | Filters (type, cost, duration), add/remove, description + image preview |
| 9 | Trip Budget & Cost Breakdown | Financial visibility | Breakdown by transport/stay/activities/meals, pie/bar charts, avg cost/day, overbudget alerts |
| 10 | Trip Calendar / Timeline | Visualize journey | Calendar component, expandable days, drag-to-reorder, quick edit |
| 11 | Shared/Public Itinerary View | External sharing | Public URL, summary, Copy Trip, social share, read-only |
| 12 | User Profile / Settings | Account control | Editable fields, language pref, delete account, saved destinations |
| 13 | Admin/Analytics Dashboard | Platform monitoring | Tables/charts of trips, top cities/activities, engagement stats, user mgmt |

The PDF also mandates: **"demonstrate proper use of relational databases"** to store users, itineraries, stops, activities, and estimated expenses, and a UI that **"adapt[s] to each user's trip flow."**

## 2. Optional According to the PDF

- **Admin / Analytics Dashboard** — explicitly labeled "(Optional)" in the PDF, with a mockup link provided (`https://link.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1`).
- **Cover photo upload** on Create Trip — labeled "(optional)."
- Social media sharing on the public itinerary page is listed as a component but not elaborated with technical requirements — treated as a soft/optional nicety (a copy-link share satisfies the spirit of it).

## 3. Our Proposed Enhancements (not in PDF, added by us)

- AI-assisted **activity/city recommendations** (semantic search over descriptions) — the PDF never mentions AI, but this project's constraint document requires an AI/ML feature. This is additive, not a hackathon requirement.
- Deterministic **budget alerts** logic (e.g., simple rule-based thresholds) beyond the PDF's vague "alerts for overbudget days."
- A lightweight **"Copy Trip" cloning** mechanism (PDF mentions the button; we define the actual copy semantics: duplicate trip + stops + scheduled activities into the current user's account).

## 4. Our Implementation Assumptions (PDF is silent, we are filling gaps)

- **City & activity data source**: PDF doesn't specify where city/activity data comes from. We assume a seeded reference dataset (public cities dataset) rather than a live third-party travel API, to avoid API-key/rate-limit risk before 5 PM.
- **Currency**: PDF doesn't specify currency handling. We assume a single default currency (e.g., INR or USD) for the hackathon, stored as a decimal with a currency code column for future multi-currency support.
- **"Popularity"** for cities is not defined in the PDF — we treat it as a static seeded integer score (or count of times added to a trip) rather than a live metric.
- **Cost index** for cities: not defined — we seed a simple relative index (1–5) per city, used only for sorting/filtering.
- **Admin role**: PDF implies an admin exists but never defines how a user becomes admin. We assume a `role` column on `User` (`user` / `admin`), manually seeded for the hackathon.
- **Password reset**: "Forgot Password" is listed as a component on the login screen but full email-based reset flow is out of scope for a same-day hackathon — we implement it as a stub/non-functional link or a simple token-based reset if time allows.

## 5. True Core User Flow (from PDF language)

```
Signup/Login → Dashboard → Create Trip → Itinerary Builder
   (Search Cities → Add Stops → Search Activities → Assign to Stops/Dates)
   → Itinerary View / Calendar → Budget & Cost Breakdown → Share Publicly
```

This is the single end-to-end flow that touches nearly every required screen and every core database entity. It is the backbone of both the MVP and the demo.

## 6. Feature Dependencies

- Itinerary Builder **depends on** City Search + Activity Search + Trip existing.
- Budget Breakdown **depends on** activities/stops having a cost value.
- Itinerary View / Calendar **depends on** Itinerary Builder data (scheduled activities with dates/times).
- Shared/Public View **depends on** a completed (or partially completed) trip and a visibility flag.
- Admin Dashboard **depends on** aggregate data existing across multiple users — least urgent, most decoupled.

## 7. MVP-Essential Screens

Login/Signup, Dashboard, Create Trip, My Trips, Itinerary Builder, Itinerary View, City Search, Activity Search, Budget Breakdown, Shared/Public View. (10 of 13)

## 8. Postponable Screens

Trip Calendar/Timeline (can piggyback on Itinerary View list mode first, calendar mode as polish), Admin/Analytics Dashboard (explicitly optional), full Profile/Settings beyond basic edit.

## 9. Highest Demo/Judging Impact

1. The single unbroken flow: create trip → build itinerary → see budget update live → share public link.
2. Visual itinerary (calendar/timeline) — high visual "wow."
3. Budget charts (pie/bar) — shows relational-DB aggregation working live.
4. AI-assisted recommendations — differentiator vs. other teams' CRUD apps, *if* it's fast and reliable.

## 10. Where AI/ML Meaningfully Fits

The PDF's Dashboard screen already asks for **"recommended destinations,"** and City/Activity Search screens ask users to discover things — both are natural, PDF-sanctioned surfaces for a recommendation feature. This is the cleanest, lowest-risk place to plug in AI/ML (see `07_AI_ML_SPECIFICATION.md`).

## 11. Technical Risks Identified

- Trying to build a live/real calendar drag-and-drop UI from scratch late in the day (time sink).
- Wiring a public sharing permission model incorrectly (data leakage between users) under time pressure.
- Treating the Admin Dashboard as required and burning hours on it — it is optional.
- Over-scoping the AI feature (e.g., trying to fine-tune a model) instead of using it as a thin pretrained-embedding layer.
