require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sequelize, User, City, Activity, Trip, TripStop, ScheduledActivity } = require('./models');
const citiesData = require('./seedData/cities');
const { generateActivitiesForCity } = require('./seedData/activityGenerator');

async function seed() {
  await sequelize.sync();

  const existingCityCount = await City.count();
  if (existingCityCount > 0) {
    console.log(`Database already has ${existingCityCount} cities seeded. Skipping seed to avoid duplicates.`);
    console.log('To re-seed from scratch, drop the database or truncate cities/activities/users/trips first.');
    process.exit(0);
  }

  console.log('Seeding cities...');
  const cities = await City.bulkCreate(citiesData);
  console.log(`Seeded ${cities.length} cities.`);

  console.log('Seeding activities (5 per city)...');
  let activityCount = 0;
  for (const city of cities) {
    const activities = generateActivitiesForCity(city).map((a) => ({ ...a, cityId: city.id }));
    await Activity.bulkCreate(activities);
    activityCount += activities.length;
  }
  console.log(`Seeded ${activityCount} activities.`);

  console.log('Seeding demo users...');
  const demoPasswordHash = await bcrypt.hash('demo1234', 10);
  const demoUser = await User.create({
    email: 'demo@globetrotter.app',
    passwordHash: demoPasswordHash,
    firstName: 'Demo',
    lastName: 'Traveler',
    name: 'Demo Traveler',
  });
  const inspirationUser = await User.create({
    email: 'inspiration@globetrotter.app',
    passwordHash: demoPasswordHash,
    firstName: 'Priya',
    lastName: 'Inspiration',
    name: 'Priya (Inspiration Account)',
  });
  console.log('Demo users: demo@globetrotter.app / demo1234 (main demo account)');
  console.log('            inspiration@globetrotter.app / demo1234 (owns the public "copy trip" demo)');

  console.log('Seeding a pre-built PUBLIC trip for the Copy Trip demo beat...');
  const goa = cities.find((c) => c.name === 'Goa');
  const mumbai = cities.find((c) => c.name === 'Mumbai');
  const goaActivities = await Activity.findAll({ where: { cityId: goa.id } });
  const mumbaiActivities = await Activity.findAll({ where: { cityId: mumbai.id } });

  const inspirationTrip = await Trip.create({
    userId: inspirationUser.id,
    name: 'Goa & Mumbai Getaway',
    startDate: '2026-06-01',
    endDate: '2026-06-08',
    description: 'A relaxed beach-and-city combo trip — sample itinerary to get inspired from.',
    isPublic: true,
    publicSlug: 'goa-mumbai-getaway-demo',
  });

  const goaStop = await TripStop.create({
    tripId: inspirationTrip.id,
    cityId: goa.id,
    arrivalDate: '2026-06-01',
    departureDate: '2026-06-04',
    orderIndex: 0,
    transportCost: 150,
    stayCost: 300,
  });
  const mumbaiStop = await TripStop.create({
    tripId: inspirationTrip.id,
    cityId: mumbai.id,
    arrivalDate: '2026-06-04',
    departureDate: '2026-06-08',
    orderIndex: 1,
    transportCost: 80,
    stayCost: 400,
  });

  await ScheduledActivity.create({
    tripStopId: goaStop.id,
    activityId: goaActivities[0].id,
    scheduledDate: '2026-06-02',
    scheduledTime: '10:00',
    orderIndex: 0,
  });
  await ScheduledActivity.create({
    tripStopId: goaStop.id,
    activityId: goaActivities[1].id,
    scheduledDate: '2026-06-02',
    scheduledTime: '19:00',
    orderIndex: 1,
  });
  await ScheduledActivity.create({
    tripStopId: goaStop.id,
    activityId: goaActivities[2].id,
    scheduledDate: '2026-06-03',
    scheduledTime: '09:00',
    orderIndex: 2,
  });
  await ScheduledActivity.create({
    tripStopId: mumbaiStop.id,
    activityId: mumbaiActivities[0].id,
    scheduledDate: '2026-06-05',
    scheduledTime: '11:00',
    orderIndex: 0,
  });
  await ScheduledActivity.create({
    tripStopId: mumbaiStop.id,
    activityId: mumbaiActivities[1].id,
    scheduledDate: '2026-06-05',
    scheduledTime: '20:00',
    orderIndex: 1,
  });

  console.log(`Public demo trip ready at slug: ${inspirationTrip.publicSlug}`);
  console.log(`  -> GET /api/public/trips/${inspirationTrip.publicSlug}`);
  console.log('\nSeed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
