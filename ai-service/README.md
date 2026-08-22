# GlobeTrotter — AI Recommendation Service

Semantic similarity microservice for ranking travel destination candidates.
Part of the GlobeTrotter hackathon project — owned by **Tanish** (AI/ML layer).

---

## Overview

A lightweight FastAPI service that:
1. Accepts a free-text query (e.g. *"traveler already visiting: Goa, Mumbai"*) and a list of candidate destinations.
2. Embeds query + candidates together using **`sentence-transformers/all-MiniLM-L6-v2`** (Apache 2.0, CPU-only).
3. Returns every candidate ranked by descending cosine similarity score.

The model is loaded **once at startup** and reused for every request.
The service is **stateless** — the backend sends its current candidate pool on every call, so no candidate embeddings are cached across requests.

---

## Prerequisites

- **Python 3.9+**
- No GPU required — all inference runs on CPU.

---

## Setup

```bash
# From the repo root
cd ai-service

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

The first run will download `all-MiniLM-L6-v2` (~90 MB) into the Hugging Face cache (`~/.cache/huggingface`). Subsequent runs use the local cache.

---

## Running the Service

```bash
uvicorn main:app --reload --port 8000
```

- Swagger UI: <http://localhost:8000/docs>
- ReDoc:       <http://localhost:8000/redoc>

---

## API Reference

### `GET /health`

Liveness check used by the backend before sending recommendation requests.

**Response**
```json
{ "status": "ok" }
```

---

### `POST /recommend`

Ranks candidate destinations by semantic similarity to the query.

**Request body**
```json
{
  "queryText": "traveler already visiting: Goa, Mumbai",
  "candidates": [
    { "id": "uuid-1", "text": "Jaipur — forts, palaces, desert culture, street food" },
    { "id": "uuid-2", "text": "Manali — mountains, hiking, adventure sports, cool climate" }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `queryText` | string | Free-text description of traveler context / preferences |
| `candidates` | array | Destinations to rank; each has a stable `id` and a descriptive `text` |

**Response body**
```json
{
  "ranked": [
    { "id": "uuid-2", "score": 0.71 },
    { "id": "uuid-1", "score": 0.44 }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `ranked` | array | All candidates sorted by `score` descending |
| `score` | float | Cosine similarity mapped to [0, 1] — higher = more relevant |

> **The full list is always returned.** The caller decides how many results to use — no server-side truncation.

---

## Sanity Test

With the service running, in a second terminal:

```bash
python test_recommend.py
```

Sends a *"beach and nightlife"* query against 5 city descriptions (Goa, Manali, Jaipur, Ibiza, Rishikesh) and prints a ranked table. Goa or Ibiza should rank in the top 2 — if they do, the embedding pipeline is working correctly.

---

## Integration with the Main Backend

The Node.js backend (`/server`, owned by Dhyey) calls this service at:

```
AI_SERVICE_URL=http://localhost:8000   (default)
```

**Important — failure handling:** the backend sets a **1.5 s timeout** on every call and falls back to a deterministic popularity-ranked query if this service is unreachable, slow, or returns an error. This means:

- The app never breaks because of this service.
- You can restart, redeploy, or iterate here freely without coordinating with the backend.
- Slow cold-starts on first request (model already loaded at startup, but worth knowing) are fine.

---

## Project Ownership

| Directory | Owner |
|-----------|-------|
| `/ai-service` | Tanish |
| `/server` | Dhyey |
| `/client` | Namra |
