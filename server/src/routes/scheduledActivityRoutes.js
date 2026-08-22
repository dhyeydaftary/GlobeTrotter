const express = require('express');
const { updateScheduledActivity, deleteScheduledActivity } = require('../controllers/stopController');
const { authGuard } = require('../middleware/authGuard');

const router = express.Router();

router.patch('/:id', authGuard, updateScheduledActivity);
router.delete('/:id', authGuard, deleteScheduledActivity);

module.exports = router;
