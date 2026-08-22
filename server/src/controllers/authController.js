const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { sendOtpEmail } = require('../services/emailService');

const OTP_EXPIRY_MINUTES = 10;
const GENERIC_FORGOT_PASSWORD_MESSAGE = 'If an account exists for this email, a code has been sent.';

function signToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function toPublicUser(user) {
  return {
    id: user.id, email: user.email, name: user.name, firstName: user.firstName, lastName: user.lastName, photoUrl: user.photoUrl,
  };
}

function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

async function signup(req, res, next) {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName?.trim() || !lastName?.trim()) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'email, password, firstName, and lastName are required');
    }
    if (password.length < 6) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Password must be at least 6 characters', 'password');
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Email already in use', 'email');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email, passwordHash, firstName: firstName.trim(), lastName: lastName.trim(),
    });
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

// Always responds with the same generic message whether or not the email is
// registered, and even if the email send itself fails — never leak account
// existence through response shape or timing-visible branching.
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'email is required');
    }

    const user = await User.findOne({ where: { email } });
    if (user) {
      const otp = generateOtp();
      user.passwordResetOtp = otp;
      user.passwordResetOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      await user.save();
      await sendOtpEmail(user.email, otp, user.firstName);
    }

    res.status(200).json({ message: GENERIC_FORGOT_PASSWORD_MESSAGE });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'email, otp, and newPassword are required');
    }
    if (newPassword.length < 6) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Password must be at least 6 characters', 'newPassword');
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.passwordResetOtp) {
      throw new ApiError(400, 'INVALID_OTP', 'Invalid or expired code');
    }
    if (user.passwordResetOtp !== otp) {
      throw new ApiError(400, 'INVALID_OTP', 'Invalid or expired code');
    }
    if (!user.passwordResetOtpExpiresAt || new Date() > user.passwordResetOtpExpiresAt) {
      throw new ApiError(400, 'OTP_EXPIRED', 'This code has expired. Please request a new one.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetOtp = null;
    user.passwordResetOtpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup, login, me, logout, forgotPassword, resetPassword,
};
