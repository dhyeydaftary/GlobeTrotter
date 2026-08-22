require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const stopRoutes = require('./routes/stopRoutes');
const scheduledActivityRoutes = require('./routes/scheduledActivityRoutes');
const userRoutes = require('./routes/userRoutes');
const { cityRouter, activityRouter } = require('./routes/catalogRoutes');
const { getPublicTrip } = require('./controllers/tripController');
const { getRecommendations } = require('./controllers/recommendationController');
const { authGuard } = require('./middleware/authGuard');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/stops', stopRoutes.standaloneStopRouter());
app.use('/api/scheduled-activities', scheduledActivityRoutes);
app.use('/api/cities', cityRouter);
app.use('/api/activities', activityRouter);
app.use('/api/users', userRoutes);
app.get('/api/public/trips/:slug', getPublicTrip);
app.get('/api/trips/:tripId/recommendations', authGuard, getRecommendations);

app.use(errorHandler);

module.exports = app;
