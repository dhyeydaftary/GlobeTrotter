const { v4: uuidv4 } = require('uuid');
const { Trip, TripStop, City, ScheduledActivity, Activity, User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { computeBudget } = require('../services/budgetService');

async function loadOwnedTrip(tripId, userId) {
  const trip = await Trip.findByPk(tripId);
  if (!trip) throw new ApiError(404, 'NOT_FOUND', 'Trip not found');
  if (trip.userId !== userId) throw new ApiError(403, 'FORBIDDEN', 'You do not own this trip');
  return trip;
}

async function createTrip(req, res, next) {
  try {
    const { name, startDate, endDate, description, coverPhotoUrl } = req.body;
    if (!name || !startDate || !endDate) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'name, startDate, and endDate are required');
    }
    if (endDate < startDate) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'end_date must be after start_date', 'endDate');
    }
    const trip = await Trip.create({
      userId: req.userId,
      name,
      startDate,
      endDate,
      description,
      coverPhotoUrl,
    });
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
}

async function listTrips(req, res, next) {
  try {
    const trips = await Trip.findAll({
      where: { userId: req.userId },
      include: [{ model: TripStop, as: 'stops', attributes: ['id'] }],
      order: [['createdAt', 'DESC']],
    });
    const shaped = trips.map((t) => ({
      id: t.id,
      name: t.name,
      startDate: t.startDate,
      endDate: t.endDate,
      stopCount: t.stops.length,
    }));
    res.status(200).json(shaped);
  } catch (err) {
    next(err);
  }
}

async function getTrip(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: TripStop,
          as: 'stops',
          include: [
            { model: City, as: 'city' },
            {
              model: ScheduledActivity,
              as: 'scheduledActivities',
              include: [{ model: Activity, as: 'activity' }],
            },
          ],
        },
      ],
      order: [
        [{ model: TripStop, as: 'stops' }, 'orderIndex', 'ASC'],
      ],
    });
    if (!trip) throw new ApiError(404, 'NOT_FOUND', 'Trip not found');
    // Owner can always view; non-owner only if public
    if (trip.userId !== req.userId && !trip.isPublic) {
      throw new ApiError(403, 'FORBIDDEN', 'This trip is private');
    }
    res.status(200).json(trip);
  } catch (err) {
    next(err);
  }
}

async function updateTrip(req, res, next) {
  try {
    const trip = await loadOwnedTrip(req.params.id, req.userId);
    const { name, startDate, endDate, description, coverPhotoUrl, isPublic } = req.body;

    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    if (trip.endDate < trip.startDate) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'end_date must be after start_date', 'endDate');
    }
    if (name !== undefined) trip.name = name;
    if (description !== undefined) trip.description = description;
    if (coverPhotoUrl !== undefined) trip.coverPhotoUrl = coverPhotoUrl;
    if (isPublic !== undefined) {
      trip.isPublic = isPublic;
      if (isPublic && !trip.publicSlug) {
        trip.publicSlug = uuidv4().split('-')[0] + '-' + uuidv4().split('-')[0];
      }
    }
    await trip.save();
    res.status(200).json(trip);
  } catch (err) {
    next(err);
  }
}

async function deleteTrip(req, res, next) {
  try {
    const trip = await loadOwnedTrip(req.params.id, req.userId);
    await trip.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getBudget(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) throw new ApiError(404, 'NOT_FOUND', 'Trip not found');
    if (trip.userId !== req.userId && !trip.isPublic) {
      throw new ApiError(403, 'FORBIDDEN', 'This trip is private');
    }
    const budget = await computeBudget(trip.id);
    res.status(200).json(budget);
  } catch (err) {
    next(err);
  }
}

async function getPublicTrip(req, res, next) {
  try {
    const trip = await Trip.findOne({
      where: { publicSlug: req.params.slug, isPublic: true },
      include: [
        { model: User, attributes: ['name'] },
        {
          model: TripStop,
          as: 'stops',
          include: [
            { model: City, as: 'city' },
            {
              model: ScheduledActivity,
              as: 'scheduledActivities',
              include: [{ model: Activity, as: 'activity' }],
            },
          ],
        },
      ],
      order: [[{ model: TripStop, as: 'stops' }, 'orderIndex', 'ASC']],
    });
    if (!trip) throw new ApiError(404, 'NOT_FOUND', 'Public trip not found');
    const budget = await computeBudget(trip.id);
    res.status(200).json({
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      description: trip.description,
      coverPhotoUrl: trip.coverPhotoUrl,
      ownerName: trip.User ? trip.User.name : null,
      stops: trip.stops,
      budget,
    });
  } catch (err) {
    next(err);
  }
}

async function copyTrip(req, res, next) {
  try {
    const source = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: TripStop,
          as: 'stops',
          include: [{ model: ScheduledActivity, as: 'scheduledActivities' }],
        },
      ],
    });
    if (!source) throw new ApiError(404, 'NOT_FOUND', 'Trip not found');
    if (!source.isPublic && source.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'This trip cannot be copied');
    }

    const newTrip = await Trip.create({
      userId: req.userId,
      name: `${source.name} (copy)`,
      startDate: source.startDate,
      endDate: source.endDate,
      description: source.description,
      coverPhotoUrl: source.coverPhotoUrl,
      isPublic: false,
    });

    for (const stop of source.stops) {
      const newStop = await TripStop.create({
        tripId: newTrip.id,
        cityId: stop.cityId,
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate,
        orderIndex: stop.orderIndex,
        transportCost: stop.transportCost,
        stayCost: stop.stayCost,
      });
      for (const sa of stop.scheduledActivities) {
        await ScheduledActivity.create({
          tripStopId: newStop.id,
          activityId: sa.activityId,
          scheduledDate: sa.scheduledDate,
          scheduledTime: sa.scheduledTime,
          orderIndex: sa.orderIndex,
          costOverride: sa.costOverride,
        });
      }
    }

    res.status(201).json(newTrip);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTrip,
  listTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  getBudget,
  getPublicTrip,
  copyTrip,
  loadOwnedTrip,
};
