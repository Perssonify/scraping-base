const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true, index: true },
    type: String,
    name: String,
    state: String,
    region: String,
    source: String,
  },
  { collection: 'websites', timestamps: true }
);

module.exports = mongoose.model('Website', websiteSchema);
