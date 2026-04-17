const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema(
  {
    url: String,
    proxy: Boolean,
    status: Number,
    durationMs: Number,
    error: String,
    at: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, collection: 'request_logs' }
);

module.exports = mongoose.model('RequestLog', requestLogSchema);
