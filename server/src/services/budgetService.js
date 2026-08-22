const { TripStop, ScheduledActivity, Activity } = require('../models');

// Computes the live budget breakdown for a trip. Nothing here is cached/stored —
// it's always derived fresh from TripStop + ScheduledActivity/Activity rows,
// per the "Budget Computation (derived, not stored)" section of 05_DATABASE_DESIGN.md.
async function computeBudget(tripId) {
  const stops = await TripStop.findAll({
    where: { tripId },
    include: [
      {
        model: ScheduledActivity,
        as: 'scheduledActivities',
        include: [{ model: Activity, as: 'activity' }],
      },
    ],
  });

  let transport = 0;
  let stay = 0;
  let activities = 0;
  let meals = 0;
  const byDayMap = {}; // date -> total
  const overBudgetDays = []; // no per-day threshold field yet (FR-17 default = none) — kept as an empty hook

  for (const stop of stops) {
    transport += Number(stop.transportCost || 0);
    stay += Number(stop.stayCost || 0);

    for (const sa of stop.scheduledActivities) {
      const cost = sa.costOverride !== null && sa.costOverride !== undefined
        ? Number(sa.costOverride)
        : Number(sa.activity.cost || 0);

      if (sa.activity.category === 'food') {
        meals += cost;
      } else {
        activities += cost;
      }

      const dateKey = sa.scheduledDate;
      byDayMap[dateKey] = (byDayMap[dateKey] || 0) + cost;
    }
  }

  const total = transport + stay + activities + meals;
  const byDay = Object.entries(byDayMap)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, dayTotal]) => ({ date, total: Number(dayTotal.toFixed(2)) }));

  return {
    total: Number(total.toFixed(2)),
    byCategory: {
      transport: Number(transport.toFixed(2)),
      stay: Number(stay.toFixed(2)),
      activities: Number(activities.toFixed(2)),
      meals: Number(meals.toFixed(2)),
    },
    byDay,
    overBudgetDays,
  };
}

module.exports = { computeBudget };
