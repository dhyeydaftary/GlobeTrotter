// Generates 5 activities per city (one per category) so budget charts show
// meaningful segmentation, per 09_DEMO_STRATEGY.md's seed data notes.
// Costs scale with each city's costIndex (1-5) so cheap/expensive
// destinations feel distinct in the budget breakdown.

const TEMPLATES = {
  sightseeing: (city) => ({
    name: `${city.name} Landmarks Walking Tour`,
    description: `Guided walking tour covering ${city.name}'s must-see sights and photo spots.`,
    baseCost: 15,
    durationMinutes: 180,
  }),
  food: (city) => ({
    name: `${city.name} Food Trail`,
    description: `Sample local specialties and street food across ${city.name}'s best-loved eateries.`,
    baseCost: 20,
    durationMinutes: 150,
  }),
  adventure: (city) => ({
    name: `${city.name} Adventure Experience`,
    description: `An adrenaline-friendly outdoor activity showcasing what makes ${city.name} exciting.`,
    baseCost: 45,
    durationMinutes: 240,
  }),
  culture: (city) => ({
    name: `${city.name} Heritage & Culture Visit`,
    description: `Explore the history, architecture, and traditions that define ${city.name}.`,
    baseCost: 12,
    durationMinutes: 120,
  }),
  relaxation: (city) => ({
    name: `${city.name} Relaxation & Wellness`,
    description: `Unwind with a spa, beach, or scenic downtime experience in ${city.name}.`,
    baseCost: 35,
    durationMinutes: 100,
  }),
};

function generateActivitiesForCity(city) {
  const multiplier = city.costIndex / 3; // costIndex 3 = baseline
  return Object.entries(TEMPLATES).map(([category, tplFn]) => {
    const t = tplFn(city);
    return {
      name: t.name,
      category,
      description: t.description,
      cost: Math.round(t.baseCost * multiplier * 100) / 100,
      durationMinutes: t.durationMinutes,
    };
  });
}

module.exports = { generateActivitiesForCity };
