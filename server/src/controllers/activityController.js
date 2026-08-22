const { Op } = require('sequelize');
const { Activity } = require('../models');

async function searchActivities(req, res, next) {
  try {
    const { cityId, category, maxCost, maxDuration } = req.query;
    const where = {};
    if (cityId) where.cityId = cityId;
    if (category) where.category = category;
    if (maxCost) where.cost = { [Op.lte]: Number(maxCost) };
    if (maxDuration) where.durationMinutes = { [Op.lte]: Number(maxDuration) };

    const activities = await Activity.findAll({ where, order: [['name', 'ASC']] });
    res.status(200).json(activities);
  } catch (err) {
    next(err);
  }
}

async function activitiesByCity(req, res, next) {
  try {
    const activities = await Activity.findAll({ where: { cityId: req.params.cityId }, order: [['name', 'ASC']] });
    res.status(200).json(activities);
  } catch (err) {
    next(err);
  }
}

module.exports = { searchActivities, activitiesByCity };
