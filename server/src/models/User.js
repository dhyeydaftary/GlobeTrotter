const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash',
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name',
  },
  // Kept for backward compatibility with existing `.name` reads across the
  // codebase (public-trip owner display, recommendation reasons, profile).
  // Auto-derived from firstName/lastName at creation unless set explicitly
  // (seed.js still passes friendly display names for demo users directly).
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'photo_url',
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
    defaultValue: 'user',
  },
  passwordResetOtp: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'password_reset_otp',
  },
  passwordResetOtpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'password_reset_otp_expires_at',
  },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeValidate(user) {
      if (!user.name && (user.firstName || user.lastName)) {
        user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      }
    },
  },
});

module.exports = User;
