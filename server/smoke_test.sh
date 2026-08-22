#!/bin/bash
set -e
BASE="http://localhost:4000/api"
uuid() { node -e "console.log(require('crypto').randomUUID())"; }

echo "== 1. Signup =="
SIGNUP=$(curl -s -X POST $BASE/auth/signup -H "Content-Type: application/json" \
  -d '{"email":"dhyey2@test.com","password":"secret123","name":"Dhyey"}')
echo "$SIGNUP"
TOKEN=$(echo "$SIGNUP" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")

echo -e "\n== 4. Seed a city directly via raw SQL for testing =="
CITY_ID=$(uuid)
su - postgres -c "psql -q -d globetrotter -c \"INSERT INTO cities (id, name, country, region, description, cost_index, popularity_score) VALUES ('$CITY_ID', 'Goa', 'India', 'West India', 'Goa beaches nightlife seafood', 2, 90);\"" > /dev/null
echo "CITY_ID: $CITY_ID"

echo -e "\n== 5. Search cities =="
curl -s "$BASE/cities?search=Goa"

echo -e "\n\n== 6. Create a trip =="
TRIP=$(curl -s -X POST $BASE/trips -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Goa Getaway","startDate":"2026-06-01","endDate":"2026-06-05","description":"Test trip"}')
echo "$TRIP"
TRIP_ID=$(echo "$TRIP" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).id")

echo -e "\n== 7. Add a stop (city) to the trip =="
STOP=$(curl -s -X POST $BASE/trips/$TRIP_ID/stops -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"cityId\":\"$CITY_ID\",\"arrivalDate\":\"2026-06-01\",\"departureDate\":\"2026-06-05\",\"transportCost\":100,\"stayCost\":200}")
echo "$STOP"
STOP_ID=$(echo "$STOP" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).id")
echo "STOP_ID: $STOP_ID"

echo -e "\n== 8. Seed an activity for that city =="
ACTIVITY_ID=$(uuid)
su - postgres -c "psql -q -d globetrotter -c \"INSERT INTO activities (id, city_id, name, category, description, cost, duration_minutes) VALUES ('$ACTIVITY_ID', '$CITY_ID', 'Beach Sunset Cruise', 'adventure', 'Evening boat cruise', 40, 120);\"" > /dev/null
echo "ACTIVITY_ID: $ACTIVITY_ID"

echo -e "\n== 9. Schedule the activity onto the stop =="
SA=$(curl -s -X POST $BASE/stops/$STOP_ID/activities -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"activityId\":\"$ACTIVITY_ID\",\"scheduledDate\":\"2026-06-02\",\"scheduledTime\":\"18:00\"}")
echo "$SA"

echo -e "\n== 10. Get budget breakdown (should reflect 100 transport + 200 stay + 40 activity = 340 total) =="
curl -s $BASE/trips/$TRIP_ID/budget -H "Authorization: Bearer $TOKEN"

echo -e "\n\n== 11. Get full trip (nested stops/activities) =="
curl -s $BASE/trips/$TRIP_ID -H "Authorization: Bearer $TOKEN"

echo -e "\n\n== 12. Make trip public =="
PUB=$(curl -s -X PATCH $BASE/trips/$TRIP_ID -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"isPublic":true}')
echo "$PUB"
SLUG=$(echo "$PUB" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).publicSlug")

echo -e "\n== 13. View public trip with NO auth =="
curl -s $BASE/public/trips/$SLUG

echo -e "\n\n== 14. Recommendations endpoint (AI service not running -> should fall back) =="
curl -s "$BASE/trips/$TRIP_ID/recommendations?type=city" -H "Authorization: Bearer $TOKEN"

echo -e "\n\n== 15. Signup a second user and copy the public trip =="
SIGNUP2=$(curl -s -X POST $BASE/auth/signup -H "Content-Type: application/json" \
  -d '{"email":"namra2@test.com","password":"secret123","name":"Namra"}')
TOKEN2=$(echo "$SIGNUP2" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
curl -s -X POST $BASE/trips/$TRIP_ID/copy -H "Authorization: Bearer $TOKEN2"

echo -e "\n\n== 16. Reorder stops (single stop, sanity check it doesn't error) =="
curl -s -X PATCH $BASE/trips/$TRIP_ID/stops/reorder -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"orderedStopIds\":[\"$STOP_ID\"]}"

echo -e "\n\n== 17. Delete the stop (should cascade the scheduled activity) =="
curl -s -o /dev/null -w "DELETE status: %{http_code}\n" -X DELETE $BASE/stops/$STOP_ID -H "Authorization: Bearer $TOKEN"

echo -e "\n== ALL TESTS COMPLETED =="
