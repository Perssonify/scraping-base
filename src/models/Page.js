const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, index: true },
    referenceUrl: { type: [String], default: [] },
    domain: { type: String, index: true },
    title: String,
    html: String,
    text: String,
    scrapedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, collection: 'pages' }
);

module.exports = mongoose.model('Page', pageSchema);
