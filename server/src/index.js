require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    // sync() creates tables from models if they don't exist yet — fine for a
    // hackathon build. { alter: false } keeps it non-destructive on restarts.
    await sequelize.sync();
    console.log('Models synced.');

    app.listen(PORT, () => {
      console.log(`GlobeTrotter API listening on http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
