require('dotenv').config();

function required(name) {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`${name} is required`);
  return v.trim();
}

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: required('MONGO_URI'),
  proxy: required('PROXY'),
  defaultTargetUrls: (process.env.TARGET_URLS || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean),
};

module.exports = config;
