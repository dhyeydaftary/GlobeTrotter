const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScheduledActivity = sequelize.define('ScheduledActivity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tripStopId: { type: DataTypes.UUID, allowNull: false, field: 'trip_stop_id' },
  activityId: { type: DataTypes.UUID, allowNull: false, field: 'activity_id' },
  scheduledDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'scheduled_date' },
  scheduledTime: { type: DataTypes.TIME, allowNull: true, field: 'scheduled_time' },
  orderIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'order_index' },
  costOverride: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'cost_override' },
}, {
  tableName: 'scheduled_activities',
  underscored: true,
  timestamps: false,
  indexes: [{ fields: ['trip_stop_id'] }, { fields: ['trip_stop_id', 'scheduled_date'] }],
});

module.exports = ScheduledActivity;
