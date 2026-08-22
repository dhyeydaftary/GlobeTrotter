const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const City = sequelize.define('City', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false },
  region: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true }, // used for AI embedding text
  latitude: { type: DataTypes.FLOAT, allowNull: true },
  longitude: { type: DataTypes.FLOAT, allowNull: true },
  costIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3, field: 'cost_index' },
  popularityScore: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'popularity_score' },
  imageUrl: { type: DataTypes.STRING, allowNull: true, field: 'image_url' },
}, {
  tableName: 'cities',
  underscored: true,
  timestamps: false,
  indexes: [{ fields: ['name'] }, { fields: ['country'] }],
});

module.exports = City;
