const Website = require('../models/Website');

async function importMany(req, res) {
  const items = Array.isArray(req.body && req.body.websites) ? req.body.websites : null;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Body must be { websites: [{ url, ... }, ...] }' });
  }

  const ops = [];
  for (const raw of items) {
    if (!raw || typeof raw.url !== 'string' || !/^https?:\/\//i.test(raw.url)) continue;
    const url = raw.url.trim();
    ops.push({
      updateOne: {
        filter: { url },
        update: {
          $set: {
            url,
            type: raw.type || null,
            name: raw.name || null,
            state: raw.state || null,
            region: raw.region || null,
            source: raw.source || null,
          },
        },
        upsert: true,
      },
    });
  }

  if (ops.length === 0) return res.status(400).json({ error: 'No valid rows to import' });

  const result = await Website.bulkWrite(ops, { ordered: false });
  res.json({
    received: items.length,
    imported: ops.length,
    inserted: result.upsertedCount,
    updated: result.modifiedCount,
    matched: result.matchedCount,
  });
}

async function list(req, res) {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 500);
  const skip = parseInt(req.query.skip || '0', 10);
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.state) filter.state = req.query.state;

  const [items, total] = await Promise.all([
    Website.find(filter).sort({ type: 1, name: 1 }).skip(skip).limit(limit).lean(),
    Website.countDocuments(filter),
  ]);

  res.json({ total, limit, skip, items });
}

module.exports = { importMany, list };
