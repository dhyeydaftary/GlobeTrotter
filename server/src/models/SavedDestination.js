const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavedDestination = sequelize.define('SavedDestination', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  cityId: { type: DataTypes.UUID, allowNull: false, field: 'city_id' },
}, {
  tableName: 'saved_destinations',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ unique: true, fields: ['user_id', 'city_id'] }],
});

module.exports = SavedDestination;
