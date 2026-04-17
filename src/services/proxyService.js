const { HttpsProxyAgent } = require('https-proxy-agent');
const config = require('../config/env');

function normalizeProxy(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const parts = trimmed.split(':');
  if (parts.length === 4) {
    const [host, port, user, pass] = parts;
    return `http://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
  }
  if (parts.length === 2) {
    const [host, port] = parts;
    return `http://${host}:${port}`;
  }
  throw new Error(`Unrecognized PROXY format: ${raw}`);
}

let cached;
function getProxy() {
  if (cached) return cached;
  const url = normalizeProxy(config.proxy);
  if (!url) throw new Error('PROXY is required — refusing to scrape without a proxy');
  cached = { url, agent: new HttpsProxyAgent(url) };
  return cached;
}

module.exports = { getProxy };
