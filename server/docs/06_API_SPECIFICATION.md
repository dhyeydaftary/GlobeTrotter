# 06 — API Specification

Base URL (dev): `http://localhost:4000/api`
Auth: `Authorization: Bearer <JWT>` header on all routes marked **Auth required**.
Standard error shape (all endpoints):
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "end_date must be after start_date", "field": "end_date" } }
```

## Authentication

### POST /auth/signup — Auth: none
Request: `{ "email": "a@b.com", "password": "secret123", "firstName": "Dhyey", "lastName": "Daftary" }`
`confirmPassword` is frontend-only validation and is never sent to this endpoint.
Response 201: `{ "token": "...", "user": { "id": "...", "email": "...", "name": "...", "firstName": "...", "lastName": "...", "photoUrl": null } }`
Errors: 400 `VALIDATION_ERROR` — missing/empty `firstName`/`lastName`, password under 6 chars, or email already in use (`field: "email"`).

### POST /auth/login — Auth: none
Request: `{ "email": "a@b.com", "password": "secret123" }`
Response 200: `{ "token": "...", "user": {...} }`
Errors: 401 `INVALID_CREDENTIALS`

### POST /auth/logout — Auth required
Response 200: `{ "success": true }` (client discards token; stateless JWT)

### GET /auth/me — Auth required
Response 200: `{ "id": "...", "email": "...", "name": "...", "firstName": "...", "lastName": "...", "photoUrl": null }`

### POST /auth/forgot-password — Auth: none
Request: `{ "email": "a@b.com" }`
Response 200 (always, regardless of whether the email is registered): `{ "message": "If an account exists for this email, a code has been sent." }`
Behavior: if the email matches a user, generates a 6-digit numeric OTP, stores it with a 10-minute expiry, and emails it via Resend (`src/services/emailService.js`). Never reveals whether the email exists — same response and status code either way, and email-delivery failures are logged server-side but don't change the response or fail the request.

### POST /auth/reset-password — Auth: none
Request: `{ "email": "a@b.com", "otp": "482913", "newPassword": "newSecret123" }`
Response 200: `{ "message": "Password reset successfully." }`
Errors: 400 `VALIDATION_ERROR` (missing fields or password under 6 chars), 400 `INVALID_OTP` (wrong code or no code on file), 400 `OTP_EXPIRED` (code matched but the 10-minute window passed). On success, the OTP fields are cleared so the code can't be reused.

## Trips

### POST /trips — Auth required
Request: `{ "name": "Europe Summer", "startDate": "2026-06-01", "endDate": "2026-06-15", "description": "...", "coverPhotoUrl": null }`
Response 201: full trip object.
Errors: 400 `VALIDATION_ERROR` if `endDate < startDate`.

### GET /trips — Auth required
Response 200: `[{ id, name, startDate, endDate, stopCount }]`

### GET /trips/:id — Auth required (owner) or public if `isPublic`
Response 200: full trip with nested `stops[]`, each with `city` and `scheduledActivities[]`.

### PATCH /trips/:id — Auth required (owner)
Request: any subset of trip fields, including `{ "isPublic": true }` (server generates `publicSlug` if not present).
Response 200: updated trip.

### DELETE /trips/:id — Auth required (owner)
Response 204.

## Stops / Itinerary

### POST /trips/:tripId/stops — Auth required (owner)
Request: `{ "cityId": "...", "arrivalDate": "2026-06-01", "departureDate": "2026-06-04" }`
Response 201: stop object.

### PATCH /stops/:id — Auth required (owner)
Request: any subset of `{ arrivalDate, departureDate, transportCost, stayCost }`.
Response 200: updated stop.

### DELETE /stops/:id — Auth required (owner)
Response 204 (cascades scheduled activities).

### PATCH /trips/:tripId/stops/reorder — Auth required (owner)
Request: `{ "orderedStopIds": ["id1","id2","id3"] }`
Response 200: `{ "success": true }`

## Cities

### GET /cities?search=&country=&region= — Auth: none
Response 200: `[{ id, name, country, region, costIndex, popularityScore }]`

### GET /cities/:id — Auth: none
Response 200: full city object.

## Activities

### GET /activities?cityId=&category=&maxCost=&maxDuration= — Auth: none
Response 200: `[{ id, name, category, cost, durationMinutes, imageUrl }]`

### GET /cities/:cityId/activities — Auth: none
Response 200: same shape, scoped to city.

### POST /stops/:stopId/activities — Auth required (owner)
Request: `{ "activityId": "...", "scheduledDate": "2026-06-02", "scheduledTime": "10:00", "costOverride": null }`
Response 201: scheduled-activity object.

### PATCH /scheduled-activities/:id — Auth required (owner)
Request: any subset of `{ scheduledDate, scheduledTime, costOverride, orderIndex }`.
Response 200: updated object.

### DELETE /scheduled-activities/:id — Auth required (owner)
Response 204.

### PATCH /stops/:stopId/activities/reorder — Auth required (owner)
Request: `{ "orderedScheduledActivityIds": [...] }`
Response 200: `{ "success": true }`

## Budget

### GET /trips/:id/budget — Auth required (owner) or public
Response 200:
```json
{
  "total": 1240.50,
  "byCategory": { "transport": 300, "stay": 500, "activities": 340.5, "meals": 100 },
  "byDay": [{ "date": "2026-06-01", "total": 120 }],
  "overBudgetDays": ["2026-06-03"]
}
```

## Sharing

### GET /public/trips/:slug — Auth: none
Response 200: read-only DTO — trip name, dates, description, owner display name (no email), stops, scheduled activities, budget totals (no `id`s exposing internal structure needed beyond display).

### POST /trips/:id/copy — Auth required
Response 201: new trip owned by requesting user, duplicated from the source trip's stops/scheduled activities.
Errors: 403 if source trip is not public and not owned by requester.

## User

### GET /users/me/profile — Auth required
Response 200: `{ id, email, name, photoUrl }`

### PATCH /users/me/profile — Auth required
Request: subset of `{ name, photoUrl, email }`.
Response 200: updated profile.

### DELETE /users/me — Auth required
Response 204 (cascades all trips).

### GET /users/me/saved-destinations — Auth required
Response 200: `[{ id, city }]`

### POST /users/me/saved-destinations — Auth required
Request: `{ "cityId": "..." }`
Response 201.

### DELETE /users/me/saved-destinations/:cityId — Auth required
Response 204.

## AI/ML

### GET /trips/:tripId/recommendations?type=city|activity — Auth required (owner)
Response 200: `{ "source": "ai" | "fallback", "recommendations": [{ id, name, score, reason }] }`
Behavior: backend calls the AI microservice; on failure/timeout (>1.5s), falls back to a deterministic `ORDER BY popularity_score DESC` query and sets `"source": "fallback"`. This endpoint never returns a 5xx to the frontend for AI failures — it always returns *something* usable.
