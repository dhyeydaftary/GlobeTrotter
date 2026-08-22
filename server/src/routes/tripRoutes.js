const express = require('express');
const {
  createTrip, listTrips, getTrip, updateTrip, deleteTrip, getBudget, copyTrip,
} = require('../controllers/tripController');
const { authGuard, optionalAuth } = require('../middleware/authGuard');
const stopRoutes = require('./stopRoutes');

const router = express.Router();

router.post('/', authGuard, createTrip);
router.get('/', authGuard, listTrips);
router.get('/:id', optionalAuth, getTrip); // owner or public
router.patch('/:id', authGuard, updateTrip);
router.delete('/:id', authGuard, deleteTrip);
router.get('/:id/budget', optionalAuth, getBudget); // owner or public
router.post('/:id/copy', authGuard, copyTrip);

// Nested stop routes: POST /trips/:tripId/stops, PATCH /trips/:tripId/stops/reorder
router.use('/:tripId/stops', stopRoutes);

module.exports = router;
