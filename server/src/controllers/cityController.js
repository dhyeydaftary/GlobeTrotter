const { Op } = require('sequelize');
const { City } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

async function searchCities(req, res, next) {
  try {
    const { search, country, region } = req.query;
    const where = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (country) where.country = country;
    if (region) where.region = region;

    const cities = await City.findAll({ where, order: [['popularityScore', 'DESC']] });
    res.status(200).json(cities);
  } catch (err) {
    next(err);
  }
}

async function getCity(req, res, next) {
  try {
    const city = await City.findByPk(req.params.id);
    if (!city) throw new ApiError(404, 'NOT_FOUND', 'City not found');
    res.status(200).json(city);
  } catch (err) {
    next(err);
  }
}

module.exports = { searchCities, getCity };
