const Page = require('../models/Page');

async function list(req, res) {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const skip = parseInt(req.query.skip || '0', 10);
  const filter = req.query.url ? { url: req.query.url } : {};

  const [items, total] = await Promise.all([
    Page.find(filter)
      .select('url title scrapedAt')
      .sort({ scrapedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Page.countDocuments(filter),
  ]);

  res.json({ total, limit, skip, items });
}

async function getOne(req, res) {
  const page = await Page.findById(req.params.id).lean();
  if (!page) return res.status(404).json({ error: 'Not found' });
  res.json(page);
}

module.exports = { list, getOne };
