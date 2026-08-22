const sequelize = require('../config/database');
const User = require('./User');
const City = require('./City');
const Activity = require('./Activity');
const Trip = require('./Trip');
const TripStop = require('./TripStop');
const ScheduledActivity = require('./ScheduledActivity');
const SavedDestination = require('./SavedDestination');

// User -> Trip (cascade: deleting a user deletes their trips)
User.hasMany(Trip, { foreignKey: 'userId', onDelete: 'CASCADE' });
Trip.belongsTo(User, { foreignKey: 'userId' });

// Trip -> TripStop (cascade)
Trip.hasMany(TripStop, { foreignKey: 'tripId', onDelete: 'CASCADE', as: 'stops' });
TripStop.belongsTo(Trip, { foreignKey: 'tripId' });

// City -> TripStop (restrict: cities are seeded reference data)
City.hasMany(TripStop, { foreignKey: 'cityId', onDelete: 'RESTRICT' });
TripStop.belongsTo(City, { foreignKey: 'cityId', as: 'city' });

// City -> Activity (restrict)
City.hasMany(Activity, { foreignKey: 'cityId', onDelete: 'RESTRICT' });
Activity.belongsTo(City, { foreignKey: 'cityId', as: 'city' });

// TripStop -> ScheduledActivity (cascade)
TripStop.hasMany(ScheduledActivity, { foreignKey: 'tripStopId', onDelete: 'CASCADE', as: 'scheduledActivities' });
ScheduledActivity.belongsTo(TripStop, { foreignKey: 'tripStopId' });

// Activity -> ScheduledActivity (restrict)
Activity.hasMany(ScheduledActivity, { foreignKey: 'activityId', onDelete: 'RESTRICT' });
ScheduledActivity.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' });

// User -> SavedDestination (cascade)
User.hasMany(SavedDestination, { foreignKey: 'userId', onDelete: 'CASCADE' });
SavedDestination.belongsTo(User, { foreignKey: 'userId' });

// City -> SavedDestination (restrict)
City.hasMany(SavedDestination, { foreignKey: 'cityId', onDelete: 'RESTRICT' });
SavedDestination.belongsTo(City, { foreignKey: 'cityId', as: 'city' });

module.exports = {
  sequelize,
  User,
  City,
  Activity,
  Trip,
  TripStop,
  ScheduledActivity,
  SavedDestination,
};
