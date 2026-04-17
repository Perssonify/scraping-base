const RequestLog = require('../models/RequestLog');

async function list(req, res) {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 500);
  const skip = parseInt(req.query.skip || '0', 10);

  const filter = {};
  if (req.query.url) filter.url = req.query.url;
  if (req.query.status) filter.status = parseInt(req.query.status, 10);
  if (req.query.failed === 'true') filter.error = { $ne: null };

  const [items, total] = await Promise.all([
    RequestLog.find(filter).sort({ at: -1 }).skip(skip).limit(limit).lean(),
    RequestLog.countDocuments(filter),
  ]);

  res.json({ total, limit, skip, items });
}

module.exports = { list };
