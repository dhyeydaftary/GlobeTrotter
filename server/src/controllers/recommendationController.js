const { Op } = require('sequelize');
const { Trip, TripStop, City, Activity } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_TIMEOUT_MS = 1500;

// Deterministic, zero-ML fallback: top cities by seeded popularity, excluding
// ones already in the trip. This ships from day one so the endpoint never
// returns empty/broken, whether or not Tanish's AI service is up yet.
async function fallbackCityRecommendations(excludeCityIds) {
  const cities = await City.findAll({
    where: excludeCityIds.length ? { id: { [Op.notIn]: excludeCityIds } } : undefined,
    order: [['popularityScore', 'DESC']],
    limit: 5,
  });
  return cities.map((c) => ({
    id: c.id,
    name: c.name,
    score: null,
    reason: 'Popular destination',
  }));
}

async function fallbackActivityRecommendations(cityIds) {
  const activities = await Activity.findAll({
    where: cityIds.length ? { cityId: { [Op.in]: cityIds } } : undefined,
    order: [['name', 'ASC']],
    limit: 5,
  });
  return activities.map((a) => ({
    id: a.id,
    name: a.name,
    score: null,
    reason: `${a.category} activity`,
  }));
}

async function getRecommendations(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.tripId, {
      include: [{ model: TripStop, as: 'stops', include: [{ model: City, as: 'city' }] }],
    });
    if (!trip) throw new ApiError(404, 'NOT_FOUND', 'Trip not found');
    if (trip.userId !== req.userId) throw new ApiError(403, 'FORBIDDEN', 'You do not own this trip');

    const type = req.query.type === 'activity' ? 'activity' : 'city';
    const existingCityIds = trip.stops.map((s) => s.cityId);
    const existingCityNames = trip.stops.map((s) => s.city.name);

    // Try the AI service first with a short timeout; fall back silently on any failure.
    try {
      const candidates = type === 'city'
        ? (await City.findAll({ where: existingCityIds.length ? { id: { [Op.notIn]: existingCityIds } } : undefined }))
            .map((c) => ({ id: c.id, text: `${c.name} — ${c.description || c.country}` }))
        : (await Activity.findAll({ where: existingCityIds.length ? { cityId: { [Op.in]: existingCityIds } } : undefined }))
            .map((a) => ({ id: a.id, text: `${a.name} — ${a.description || a.category}` }));

      const queryText = req.query.q
        || `traveler already visiting: ${existingCityNames.join(', ') || 'nowhere yet'}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
      const aiRes = await fetch(`${AI_SERVICE_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText, candidates }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!aiRes.ok) throw new Error(`AI service returned ${aiRes.status}`);
      const { ranked } = await aiRes.json();

      const topIds = ranked.slice(0, 5).map((r) => r.id);
      const scoreById = Object.fromEntries(ranked.map((r) => [r.id, r.score]));

      const hydrated = type === 'city'
        ? await City.findAll({ where: { id: { [Op.in]: topIds } } })
        : await Activity.findAll({ where: { id: { [Op.in]: topIds } } });

      const recommendations = topIds
        .map((id) => hydrated.find((h) => h.id === id))
        .filter(Boolean)
        .map((h) => ({ id: h.id, name: h.name, score: scoreById[h.id], reason: 'AI-matched to your trip' }));

      return res.status(200).json({ source: 'ai', recommendations });
    } catch (aiErr) {
      // AI service down/slow/not built yet — use the deterministic fallback.
      const recommendations = type === 'city'
        ? await fallbackCityRecommendations(existingCityIds)
        : await fallbackActivityRecommendations(existingCityIds);
      return res.status(200).json({ source: 'fallback', recommendations });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { getRecommendations };
