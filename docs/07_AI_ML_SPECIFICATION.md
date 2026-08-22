# 07 — AI/ML Specification

## Comparison of Candidate AI/ML Features

| AI/ML Feature | User Value | Demo Impact | Difficulty | Time to Implement | Dataset Available | Pretrained Model Available | Recommendation |
|---|---|---|---|---|---|---|---|
| Personalized destination/activity recommendation (semantic similarity) | High — directly matches PDF's "recommended destinations" on Dashboard | High — visible, explainable, fast | Low | ~1–2 hrs | Yes (seeded city/activity text) | Yes (sentence-transformers) | **SELECTED** |
| Natural-language trip planning ("plan me a 5-day Goa trip") | High | Very high (wow factor) | High (needs an LLM + generation pipeline + parsing into structured stops/activities) | 4+ hrs, high integration risk | N/A | Yes (LLM API) | Not selected — too risky before 5 PM |
| Budget/cost prediction (regression on trip features) | Medium | Low–Medium (numbers alone don't demo well) | Medium (needs a real historical cost dataset, likely doesn't exist for this domain) | 3+ hrs | No good dataset available | Would need training | Not selected |
| Similar-trip recommendation ("travelers like you also visited...") | Medium | Medium | Medium (needs enough seeded trips/interactions to be meaningful) | 2–3 hrs | Weak (no real user history yet) | Yes but low signal | Not selected for v1 |
| Semantic search for activities/cities (as opposed to keyword search) | Medium-High | Medium | Low | ~1 hr, shares infra with #1 | Yes | Yes | Bundled into #1 as the same embedding infra |

**Decision: One feature, two surfaces.** Build a single embedding-based **content recommendation engine** using a pretrained sentence-embedding model, applied to (a) Dashboard "recommended destinations" and (b) an "AI suggests" panel inside City/Activity Search and the Itinerary Builder. This satisfies FR-24, reuses one small model, and needs no fine-tuning, no GPU, and no external API key.

## Selected Feature: Content-Based Recommendation via Sentence Embeddings

### Problem Definition
Given a user's current trip context (cities already added + activity categories already chosen, or free-text interests typed by the user), rank the catalog of cities/activities by semantic relevance so the most fitting, not-yet-added items surface first.

### Input
A short text query built server-side, e.g.:
`"traveler interested in: beach, nightlife, food; already visiting: Goa, Mumbai"`
or free text the user types (e.g., "I like quiet mountain towns and hiking").

Candidate pool: the `description` (+ `category`/`region`) text of all seeded `City` or `Activity` rows not already in the trip.

### Output
Ranked list: `[{ id, name, score (cosine similarity 0–1), reason: matched category/description snippet }]`, top-N (e.g., 5).

### Pretrained Model
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Official source / model card**: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- **License**: Apache 2.0 — free for commercial and hackathon use, no restrictions.
- **Model size**: ~90MB, 384-dimensional output embeddings.
- **Runtime requirements**: CPU-only is sufficient; no GPU needed.
- **Expected latency**: encoding a handful of short strings + comparing against a small candidate pool (tens to low hundreds of cities/activities) is well under 200ms on a laptop CPU once the model is loaded in memory.
- **Library**: `pip install sentence-transformers` (wraps HuggingFace `transformers` + PyTorch under the hood).

### Dataset
- **Cities reference data**: `countries-states-cities-database` (dr5hn) — free, open (Open Database License), available as CSV/JSON/SQL.
  - Repo: https://github.com/dr5hn/countries-states-cities-database
  - Docs/preview: https://dr5hn.github.io/countries-states-cities-database/
  - Contains country, region/state, city, lat/long — more than enough to seed a `City` table with name/country/region/lat/long. `cost_index` and `popularity_score` and a short marketing-style `description` are **not** in this dataset and should be authored/synthesized by the team for a curated subset (recommend seeding ~40–60 well-known cities by hand or light script, not all 150k+ rows — a hackathon demo does not need the full planet).
  - License: Open Database License (ODbL) — attribution required, free to use/modify.
- **Activities**: no suitable public dataset fits the exact schema (name/category/cost/duration/description tied to a specific seeded city) — **hand-author** ~5–8 activities per seeded city (~40–60 cities × 5–8 = 200–480 activities) as static seed data. This is realistic to write/generate quickly (e.g., via a script or LLM-assisted content generation done once, offline, well before 5 PM) and avoids any live scraping/API dependency.

### Integration Flow
```
User opens Dashboard or Itinerary Builder
    ↓
Frontend calls GET /trips/:id/recommendations?type=city|activity
    ↓
Backend (Node) builds a query string from trip context
    ↓
Backend POSTs { queryText, candidates: [{id, text}] } to AI microservice (Python/FastAPI)
    ↓
AI service: embed query once, embed candidates (or use precomputed candidate embeddings cached at startup), cosine similarity, sort, return top-N ids+scores
    ↓
Backend hydrates full City/Activity rows for those ids
    ↓
Backend returns { source: "ai", recommendations: [...] } to frontend
    ↓
Frontend renders a "Recommended for you" row on Dashboard / a suggestion panel in Search
```

**Performance optimization**: precompute and cache candidate embeddings once at AI-service startup (they rarely change during a hackathon demo), so each request only needs to embed the short query text — keeps latency minimal.

### Fallback (if AI service fails or isn't finished in time)
Deterministic, zero-ML fallback baked into the same backend endpoint from the start (not an afterthought): `SELECT * FROM city WHERE id NOT IN (trip's cities) ORDER BY popularity_score DESC LIMIT 5`. The `/recommendations` endpoint always tries the AI service first with a short timeout (~1.5s), and transparently falls back — the frontend never needs to know which path served the response, aside from an optional `"source"` field used for demo narration ("this row is AI-ranked, here's the fallback if we turn the AI off").

## Fastest Option
The selected feature itself — a single pretrained embedding model with no training, no fine-tuning, no external API key, callable from a ~30-line FastAPI service.

## Best Demo Option
Same feature, framed well: type free-text interests into a box on the Dashboard ("I love hiking and street food") and watch ranked city cards appear with a similarity-based "why recommended" tag. High visual payoff for very low implementation risk.

## Safest Fallback
The deterministic popularity-ranked query described above — ships in the same endpoint, requires no ML infrastructure at all, and guarantees the Dashboard/Search "recommended" sections are never empty even if Tanish's service isn't wired up in time.
