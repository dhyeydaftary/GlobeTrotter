#!/usr/bin/env python3
"""
test_recommend.py — Sanity-check the /recommend endpoint.

Usage (service must already be running):
    python test_recommend.py

Expected behaviour:
    Beach/nightlife cities (Goa, Ibiza) should rank highest for the query
    "beach and nightlife".  Mountain/culture cities should rank lower.
    If the ranking looks sensible, the embedding pipeline is working correctly.
"""

import json
import sys
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000"

HEALTH_URL = f"{BASE_URL}/health"
RECOMMEND_URL = f"{BASE_URL}/recommend"

PAYLOAD = {
    "queryText": "beach and nightlife",
    "candidates": [
        {
            "id": "goa",
            "text": "Goa — tropical beaches, beach parties, nightlife, seafood, water sports, vibrant bar scene",
        },
        {
            "id": "manali",
            "text": "Manali — snow-capped mountains, trekking, adventure sports, rivers, Himalayan culture",
        },
        {
            "id": "jaipur",
            "text": "Jaipur — forts, palaces, desert culture, camel rides, Rajasthani street food, pink city",
        },
        {
            "id": "ibiza",
            "text": "Ibiza — world-famous nightclubs, white sandy beaches, Mediterranean sea, summer parties",
        },
        {
            "id": "rishikesh",
            "text": "Rishikesh — yoga retreats, meditation, river rafting, spiritual temples, ashrams",
        },
    ],
}


def _json_post(url: str, data: dict) -> dict:
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _json_get(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    # 1. Health check
    print("=" * 60)
    print("GlobeTrotter AI Service — Sanity Test")
    print("=" * 60)

    print("\n[1] GET /health …")
    try:
        health = _json_get(HEALTH_URL)
        print(f"    Response: {health}")
        assert health.get("status") == "ok", "Unexpected health response"
        print("    ✓ Health check passed")
    except urllib.error.URLError as exc:
        print(f"\n  ERROR: Could not reach {HEALTH_URL}")
        print(f"  → {exc}")
        print("\n  Make sure the service is running:")
        print("    cd ai-service && uvicorn main:app --reload --port 8000")
        sys.exit(1)

    # 2. Recommend
    print(f'\n[2] POST /recommend — query: "{PAYLOAD["queryText"]}"')
    print(f"    Candidates: {[c['id'] for c in PAYLOAD['candidates']]}")

    result = _json_post(RECOMMEND_URL, PAYLOAD)
    ranked = result.get("ranked", [])

    print("\n    Ranked results (highest → lowest similarity):")
    print(f"    {'Rank':<6} {'ID':<12} {'Score'}")
    print(f"    {'-'*6} {'-'*12} {'-'*6}")
    for i, item in enumerate(ranked, 1):
        bar = "█" * int(item["score"] * 20)
        print(f"    #{i:<5} {item['id']:<12} {item['score']:.4f}  {bar}")

    # 3. Sanity assertion
    print()
    top_ids = [item["id"] for item in ranked[:2]]
    beach_ids = {"goa", "ibiza"}
    overlap = beach_ids & set(top_ids)
    if overlap:
        print(f"  ✓ Sanity check passed — beach/nightlife city in top 2: {overlap}")
    else:
        print(f"  ✗ Sanity check FAILED — expected Goa or Ibiza in top 2, got {top_ids}")
        print("    This may indicate an issue with the model or embedding pipeline.")
        sys.exit(1)

    print("\nAll checks passed. Service is working correctly.\n")


if __name__ == "__main__":
    main()
