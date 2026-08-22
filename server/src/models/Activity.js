const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cityId: { type: DataTypes.UUID, allowNull: false, field: 'city_id' },
  name: { type: DataTypes.STRING, allowNull: false },
  category: {
    type: DataTypes.ENUM('sightseeing', 'food', 'adventure', 'culture', 'relaxation'),
    allowNull: false,
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: true, field: 'duration_minutes' },
  imageUrl: { type: DataTypes.STRING, allowNull: true, field: 'image_url' },
}, {
  tableName: 'activities',
  underscored: true,
  timestamps: false,
  indexes: [{ fields: ['city_id'] }, { fields: ['category'] }],
});

module.exports = Activity;
