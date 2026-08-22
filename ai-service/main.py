"""
GlobeTrotter — AI Recommendation Service
Ranks candidate destinations by semantic similarity to a query string.
Model: sentence-transformers/all-MiniLM-L6-v2 (Apache 2.0, CPU-only)
"""

from contextlib import asynccontextmanager
from typing import List

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------------------
# Model — loaded once at startup, reused for every request
# ---------------------------------------------------------------------------

_model: SentenceTransformer | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model
    print("Loading sentence-transformers model …")
    _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    print("Model ready.")
    yield
    # nothing to clean up for an in-process model


# ---------------------------------------------------------------------------
# App + middleware
# ---------------------------------------------------------------------------

app = FastAPI(
    title="GlobeTrotter AI Recommendation Service",
    description="Semantic similarity ranking for travel destination candidates.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # internal service — hackathon speed over strictness
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class Candidate(BaseModel):
    id: str
    text: str


class RecommendRequest(BaseModel):
    queryText: str
    candidates: List[Candidate]


class RankedItem(BaseModel):
    id: str
    score: float


class RecommendResponse(BaseModel):
    ranked: List[RankedItem]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two 1-D vectors, returns a value in [0, 1]."""
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    raw = float(np.dot(a, b) / denom)
    # all-MiniLM-L6-v2 produces normalised embeddings so raw is already in
    # [-1, 1]; map to [0, 1] for a cleaner consumer-facing score.
    return round((raw + 1.0) / 2.0, 4)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health", summary="Liveness check")
def health():
    """Returns {"status": "ok"} — used by the backend to verify the service is up."""
    return {"status": "ok"}


@app.post("/recommend", response_model=RecommendResponse, summary="Rank candidates by semantic similarity")
def recommend(req: RecommendRequest):
    """
    Embeds queryText and all candidate texts in a single batched encode() call,
    computes cosine similarity for each candidate, and returns them sorted
    descending by score.  Scores are in [0, 1].

    The full ranked list is returned — the caller decides how many to use.
    The service is intentionally stateless: candidates are not cached between
    requests because the backend sends its current pool on every call.
    """
    if not req.candidates:
        return RecommendResponse(ranked=[])

    # Batch: query first, then all candidates — one encode() call
    texts = [req.queryText] + [c.text for c in req.candidates]
    embeddings: np.ndarray = _model.encode(texts, convert_to_numpy=True)

    query_emb = embeddings[0]
    candidate_embs = embeddings[1:]

    ranked = [
        RankedItem(
            id=candidate.id,
            score=_cosine_similarity(query_emb, candidate_embs[i]),
        )
        for i, candidate in enumerate(req.candidates)
    ]

    ranked.sort(key=lambda item: item.score, reverse=True)
    return RecommendResponse(ranked=ranked)
