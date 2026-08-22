const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TripStop = sequelize.define('TripStop', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tripId: { type: DataTypes.UUID, allowNull: false, field: 'trip_id' },
  cityId: { type: DataTypes.UUID, allowNull: false, field: 'city_id' },
  arrivalDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'arrival_date' },
  departureDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'departure_date' },
  orderIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'order_index' },
  transportCost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: 'transport_cost' },
  stayCost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: 'stay_cost' },
}, {
  tableName: 'trip_stops',
  underscored: true,
  timestamps: false,
  indexes: [{ fields: ['trip_id'] }, { fields: ['trip_id', 'order_index'] }],
});

module.exports = TripStop;
