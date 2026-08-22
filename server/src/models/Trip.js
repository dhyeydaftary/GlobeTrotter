const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  name: { type: DataTypes.STRING, allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'start_date' },
  endDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'end_date' },
  description: { type: DataTypes.TEXT, allowNull: true },
  coverPhotoUrl: { type: DataTypes.STRING, allowNull: true, field: 'cover_photo_url' },
  isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_public' },
  publicSlug: { type: DataTypes.STRING, allowNull: true, unique: true, field: 'public_slug' },
}, {
  tableName: 'trips',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  validate: {
    endAfterStart() {
      if (this.endDate < this.startDate) {
        throw new Error('end_date must be after start_date');
      }
    },
  },
  indexes: [{ fields: ['user_id'] }, { unique: true, fields: ['public_slug'] }],
});

module.exports = Trip;
