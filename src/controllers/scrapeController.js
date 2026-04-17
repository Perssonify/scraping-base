const { scrapeMany } = require('../services/scraperService');
const config = require('../config/env');

async function trigger(req, res) {
  // const bodyUrls = Array.isArray(req.body && req.body.urls) ? req.body.urls : null;
  // const urls = bodyUrls && bodyUrls.length > 0 ? bodyUrls : config.defaultTargetUrls;

  try {
    const { urls, depth } = req.body;

    console.log('urls', urls, 'depth', depth);

    if (!urls || urls.length === 0) {
      return res.status(400).json({
        error: 'No URLs to scrape. Provide { "urls": [...] } or set TARGET_URLS in env.',
      });
    }

    const parsedDepth = Number.isInteger(depth) && depth >= 0 ? depth : 1;

    const startedAt = Date.now();
    const results = await scrapeMany(urls, { depth: parsedDepth });
    const totalMs = Date.now() - startedAt;

    console.log('results', results);

    const succeeded = results.filter((r) => !r.error).length;
    console.log('succeeded', succeeded);
    res.json({
      totalMs,
      count: results.length,
      succeeded,
      failed: results.length - succeeded,
      results,
    });
  } catch (err) {
    console.error('scrape trigger failed', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

module.exports = { trigger };
