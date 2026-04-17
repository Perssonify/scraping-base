const express = require('express');
const scrapeRoutes = require('./routes/scrapeRoutes');
const pageRoutes = require('./routes/pageRoutes');
const logRoutes = require('./routes/logRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function buildApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  app.use('/api/scrape', scrapeRoutes);
  app.use('/api/pages', pageRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api/websites', websiteRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = buildApp;
