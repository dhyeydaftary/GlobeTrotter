const express = require('express');
const { searchCities, getCity } = require('../controllers/cityController');
const { searchActivities, activitiesByCity } = require('../controllers/activityController');

const cityRouter = express.Router();
cityRouter.get('/', searchCities);
cityRouter.get('/:id', getCity);
cityRouter.get('/:cityId/activities', activitiesByCity);

const activityRouter = express.Router();
activityRouter.get('/', searchActivities);

module.exports = { cityRouter, activityRouter };
