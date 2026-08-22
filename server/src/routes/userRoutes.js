const express = require('express');
const {
  getProfile, updateProfile, deleteAccount, listSavedDestinations, saveDestination, removeSavedDestination,
} = require('../controllers/userController');
const { authGuard } = require('../middleware/authGuard');

const router = express.Router();

router.get('/me/profile', authGuard, getProfile);
router.patch('/me/profile', authGuard, updateProfile);
router.delete('/me', authGuard, deleteAccount);
router.get('/me/saved-destinations', authGuard, listSavedDestinations);
router.post('/me/saved-destinations', authGuard, saveDestination);
router.delete('/me/saved-destinations/:cityId', authGuard, removeSavedDestination);

module.exports = router;
