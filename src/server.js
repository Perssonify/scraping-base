const config = require('./config/env');
const db = require('./db/connection');
const buildApp = require('./app');
const mongoose = require('mongoose');

async function main() {
  try {
    console.log('Connecting to MongoDB:', config.mongoUri);
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }

  const app = buildApp();
  const server = app.listen(config.port);

  const shutdown = () => {
    server.close(async () => {
      await db.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('fatal:', err.message);
  process.exit(1);
});
