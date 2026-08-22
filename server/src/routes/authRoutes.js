const express = require('express');
const { signup, login, me, logout } = require('../controllers/authController');
const { authGuard } = require('../middleware/authGuard');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authGuard, logout);
router.get('/me', authGuard, me);

module.exports = router;
