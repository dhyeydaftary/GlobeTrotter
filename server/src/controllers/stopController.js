const { TripStop, Trip, City, ScheduledActivity, Activity } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { loadOwnedTrip } = require('./tripController');

async function loadOwnedStop(stopId, userId) {
  const stop = await TripStop.findByPk(stopId, { include: [{ model: Trip }] });
  if (!stop) throw new ApiError(404, 'NOT_FOUND', 'Stop not found');
  if (stop.Trip.userId !== userId) throw new ApiError(403, 'FORBIDDEN', 'You do not own this trip');
  return stop;
}

async function addStop(req, res, next) {
  try {
    const trip = await loadOwnedTrip(req.params.tripId, req.userId);
    const { cityId, arrivalDate, departureDate } = req.body;
    if (!cityId || !arrivalDate || !departureDate) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'cityId, arrivalDate, and departureDate are required');
    }
    if (departureDate < arrivalDate) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'departureDate must be after arrivalDate', 'departureDate');
    }
    const city = await City.findByPk(cityId);
    if (!city) throw new ApiError(400, 'VALIDATION_ERROR', 'Unknown cityId', 'cityId');

    const count = await TripStop.count({ where: { tripId: trip.id } });
    const stop = await TripStop.create({
      tripId: trip.id,
      cityId,
      arrivalDate,
      departureDate,
      orderIndex: count,
    });
    res.status(201).json(stop);
  } catch (err) {
    next(err);
  }
}

async function updateStop(req, res, next) {
  try {
    const stop = await loadOwnedStop(req.params.id, req.userId);
    const { arrivalDate, departureDate, transportCost, stayCost } = req.body;
    if (arrivalDate !== undefined) stop.arrivalDate = arrivalDate;
    if (departureDate !== undefined) stop.departureDate = departureDate;
    if (stop.departureDate < stop.arrivalDate) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'departureDate must be after arrivalDate', 'departureDate');
    }
    if (transportCost !== undefined) stop.transportCost = transportCost;
    if (stayCost !== undefined) stop.stayCost = stayCost;
    await stop.save();
    res.status(200).json(stop);
  } catch (err) {
    next(err);
  }
}

async function deleteStop(req, res, next) {
  try {
    const stop = await loadOwnedStop(req.params.id, req.userId);
    await stop.destroy(); // cascades scheduled activities
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function reorderStops(req, res, next) {
  try {
    const trip = await loadOwnedTrip(req.params.tripId, req.userId);
    const { orderedStopIds } = req.body;
    if (!Array.isArray(orderedStopIds)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'orderedStopIds must be an array');
    }
    await Promise.all(
      orderedStopIds.map((stopId, index) =>
        TripStop.update({ orderIndex: index }, { where: { id: stopId, tripId: trip.id } })
      )
    );
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

// --- Scheduled activities within a stop ---

async function addScheduledActivity(req, res, next) {
  try {
    const stop = await loadOwnedStop(req.params.stopId, req.userId);
    const { activityId, scheduledDate, scheduledTime, costOverride } = req.body;
    if (!activityId || !scheduledDate) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'activityId and scheduledDate are required');
    }
    if (scheduledDate < stop.arrivalDate || scheduledDate > stop.departureDate) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'scheduledDate must fall within the stop\'s date range', 'scheduledDate');
    }
    const activity = await Activity.findByPk(activityId);
    if (!activity) throw new ApiError(400, 'VALIDATION_ERROR', 'Unknown activityId', 'activityId');

    const count = await ScheduledActivity.count({ where: { tripStopId: stop.id } });
    const scheduled = await ScheduledActivity.create({
      tripStopId: stop.id,
      activityId,
      scheduledDate,
      scheduledTime,
      costOverride,
      orderIndex: count,
    });
    res.status(201).json(scheduled);
  } catch (err) {
    next(err);
  }
}

async function loadOwnedScheduledActivity(id, userId) {
  const sa = await ScheduledActivity.findByPk(id, {
    include: [{ model: TripStop, include: [{ model: Trip }] }],
  });
  if (!sa) throw new ApiError(404, 'NOT_FOUND', 'Scheduled activity not found');
  if (sa.TripStop.Trip.userId !== userId) throw new ApiError(403, 'FORBIDDEN', 'You do not own this trip');
  return sa;
}

async function updateScheduledActivity(req, res, next) {
  try {
    const sa = await loadOwnedScheduledActivity(req.params.id, req.userId);
    const { scheduledDate, scheduledTime, costOverride, orderIndex } = req.body;
    if (scheduledDate !== undefined) sa.scheduledDate = scheduledDate;
    if (scheduledTime !== undefined) sa.scheduledTime = scheduledTime;
    if (costOverride !== undefined) sa.costOverride = costOverride;
    if (orderIndex !== undefined) sa.orderIndex = orderIndex;
    await sa.save();
    res.status(200).json(sa);
  } catch (err) {
    next(err);
  }
}

async function deleteScheduledActivity(req, res, next) {
  try {
    const sa = await loadOwnedScheduledActivity(req.params.id, req.userId);
    await sa.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function reorderScheduledActivities(req, res, next) {
  try {
    const stop = await loadOwnedStop(req.params.stopId, req.userId);
    const { orderedScheduledActivityIds } = req.body;
    if (!Array.isArray(orderedScheduledActivityIds)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'orderedScheduledActivityIds must be an array');
    }
    await Promise.all(
      orderedScheduledActivityIds.map((id, index) =>
        ScheduledActivity.update({ orderIndex: index }, { where: { id, tripStopId: stop.id } })
      )
    );
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addStop,
  updateStop,
  deleteStop,
  reorderStops,
  addScheduledActivity,
  updateScheduledActivity,
  deleteScheduledActivity,
  reorderScheduledActivities,
};
