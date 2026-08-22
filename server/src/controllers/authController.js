const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

function signToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function toPublicUser(user) {
  return { id: user.id, email: user.email, name: user.name, photoUrl: user.photoUrl };
}

async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'email, password, and name are required');
    }
    if (password.length < 6) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Password must be at least 6 characters', 'password');
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Email already in use', 'email');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });
    const token = signToken(user);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'email and password are required');
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }
    const token = signToken(user);
    res.status(200).json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    res.status(200).json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  // Stateless JWT — nothing to invalidate server-side for the hackathon build.
  res.status(200).json({ success: true });
}

module.exports = { signup, login, me, logout };
