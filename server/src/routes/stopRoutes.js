const express = require('express');
const {
  addStop, updateStop, deleteStop, reorderStops, addScheduledActivity, reorderScheduledActivities,
} = require('../controllers/stopController');
const { authGuard } = require('../middleware/authGuard');

const router = express.Router({ mergeParams: true });

// mounted at /trips/:tripId/stops
router.post('/', authGuard, addStop);
router.patch('/reorder', authGuard, reorderStops);

module.exports = router;

// Separate top-level routers for /stops/:id and /stops/:stopId/activities
// are exported below and wired directly in app.js, since those two don't
// carry the :tripId param the way the above does.
module.exports.standaloneStopRouter = () => {
  const r = express.Router();
  r.patch('/:id', authGuard, updateStop);
  r.delete('/:id', authGuard, deleteStop);
  r.post('/:stopId/activities', authGuard, addScheduledActivity);
  r.patch('/:stopId/activities/reorder', authGuard, reorderScheduledActivities);
  return r;
};
