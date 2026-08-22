const { User, SavedDestination, City } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

async function getProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    res.status(200).json({ id: user.id, email: user.email, name: user.name, photoUrl: user.photoUrl });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    const { name, photoUrl, email } = req.body;
    if (name !== undefined) user.name = name;
    if (photoUrl !== undefined) user.photoUrl = photoUrl;
    if (email !== undefined) user.email = email;
    await user.save();
    res.status(200).json({ id: user.id, email: user.email, name: user.name, photoUrl: user.photoUrl });
  } catch (err) {
    next(err);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    await user.destroy(); // cascades trips, saved destinations
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function listSavedDestinations(req, res, next) {
  try {
    const saved = await SavedDestination.findAll({
      where: { userId: req.userId },
      include: [{ model: City, as: 'city' }],
    });
    res.status(200).json(saved.map((s) => ({ id: s.id, city: s.city })));
  } catch (err) {
    next(err);
  }
}

async function saveDestination(req, res, next) {
  try {
    const { cityId } = req.body;
    if (!cityId) throw new ApiError(400, 'VALIDATION_ERROR', 'cityId is required');
    const city = await City.findByPk(cityId);
    if (!city) throw new ApiError(400, 'VALIDATION_ERROR', 'Unknown cityId', 'cityId');
    const [saved] = await SavedDestination.findOrCreate({
      where: { userId: req.userId, cityId },
    });
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

async function removeSavedDestination(req, res, next) {
  try {
    await SavedDestination.destroy({ where: { userId: req.userId, cityId: req.params.cityId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  listSavedDestinations,
  saveDestination,
  removeSavedDestination,
};
