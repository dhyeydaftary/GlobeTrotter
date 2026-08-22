# 02 — Software Requirements Specification (SRS)

## User Roles
- **Guest** — can view public shared itineraries only.
- **User** — full trip management for their own data.
- **Admin** *(optional)* — read access to aggregate platform stats.

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | User can sign up with email + password. |
| FR-02 | User can log in / log out. |
| FR-03 | System validates email format and password minimum length (≥6 chars) on signup. |
| FR-04 | User can create a trip with name, start date, end date, description, optional cover photo. |
| FR-05 | System rejects a trip where end date < start date. |
| FR-06 | User can view a list of their own trips with name, date range, stop count. |
| FR-07 | User can edit or delete their own trip. |
| FR-08 | User can add a stop (city + arrival/departure date) to a trip. |
| FR-09 | User can reorder stops within a trip. |
| FR-10 | User can remove a stop (cascades to its scheduled activities). |
| FR-11 | User can search cities by name/country with filters (region/country). |
| FR-12 | User can search activities by type/cost/duration, scoped to a city. |
| FR-13 | User can add an activity to a specific stop on a specific date/time. |
| FR-14 | User can remove or reorder scheduled activities within a day. |
| FR-15 | System computes total trip cost as the sum of all scheduled activity costs + stop-level transport/stay estimates. |
| FR-16 | System returns a cost breakdown grouped by category (transport, stay, activities, meals). |
| FR-17 | System flags days where spend exceeds a per-day budget threshold set by the user (optional field; default = none). |
| FR-18 | User can view the itinerary as a day-wise list and (stretch) as a calendar. |
| FR-19 | User can toggle a trip's visibility to public. |
| FR-20 | A public trip is viewable, read-only, by unauthenticated visitors via a stable URL/slug. |
| FR-21 | Any user can copy a public trip into their own account as a new editable trip. |
| FR-22 | User can edit profile fields (name, photo, email) and delete their account. |
| FR-23 | User can maintain a list of saved/favorited destinations. |
| FR-24 | (Enhancement) System can return AI-recommended cities/activities based on a user's existing trip content or stated interests. |

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | API responses for standard CRUD should return in <500ms on seeded/demo-scale data. |
| NFR-02 | AI recommendation endpoint should return in <2s (see `07_AI_ML_SPECIFICATION.md`). |
| NFR-03 | Frontend must be responsive down to a standard mobile viewport (~375px width). |
| NFR-04 | Passwords must be hashed (never stored plaintext); JWT or session tokens used for auth. |
| NFR-05 | Public itinerary pages must not expose any other user's private data (only the owning trip's public fields). |
| NFR-06 | All list/detail screens must have explicit loading, empty, and error states. |
| NFR-07 | Database foreign keys must enforce referential integrity; deletes must cascade or restrict deliberately (see `05_DATABASE_DESIGN.md`). |
| NFR-08 | System should degrade gracefully if the AI service is unavailable (deterministic fallback, FR-24 never blocks core flows). |

## Data Requirements
Users, Trips, Cities, TripStops, Activities, ScheduledActivities, Budgets/expense fields, SavedDestinations — see `05_DATABASE_DESIGN.md`.

## Validation Rules
- Email: standard email regex, unique per user.
- Trip dates: `end_date >= start_date`.
- Stop dates: must fall within parent trip's date range.
- Scheduled activity date: must fall within its stop's date range.
- Cost fields: numeric, ≥ 0.

## Error Handling Expectations
- All API errors return a consistent JSON shape (see `Frontend-Backend Integration Contract` in `03_TRD.md`).
- 4xx for validation/auth errors with a field-level message where applicable; 5xx only for unexpected failures, logged server-side.

## Responsive Requirements
Mobile-first layout for Dashboard, My Trips, Itinerary Builder (collapsible day sections), Budget screen (stacked charts on small screens).

## Performance Expectations
Optimized for hackathon demo scale (tens of seeded cities/activities, single-digit concurrent users) — not production load.

## Security Requirements
- Hashed passwords (bcrypt/argon2).
- Auth-guarded endpoints for all non-public trip data.
- Ownership checks on every mutating endpoint (a user can only edit their own trips/stops/activities).
- Public trip endpoints are explicitly whitelisted read-only fields.

## Sharing / Public Access Requirements
- Public trips accessible via a unique slug/ID with no auth.
- Copy-trip action requires auth (must be logged in to copy into "my trips").
