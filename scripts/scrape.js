#!/usr/bin/env node
const fs = require('node:fs');

const baseUrl = process.env.SCRAPER_URL || 'http://localhost:3000';
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: npm run scrape -- <file>');
  process.exit(1);
}

const urls = fs
  .readFileSync(filePath, 'utf8')
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => /^https?:\/\//i.test(l));

if (urls.length === 0) {
  console.error(`No URLs found in ${filePath}`);
  process.exit(1);
}

console.log(`scraping ${urls.length} URLs from ${filePath}...`);

(async () => {
  const res = await fetch(`${baseUrl}/api/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`HTTP ${res.status}:`, data);
    process.exit(1);
  }
  console.log(`succeeded=${data.succeeded}/${data.count}  failed=${data.failed}  totalMs=${data.totalMs}`);
  for (const r of data.results) {
    const tag = r.error ? 'FAIL' : 'OK  ';
    console.log(`  ${tag}  ${r.status ?? '---'}  ${r.durationMs}ms  ${r.url}  ${r.title ?? r.error ?? ''}`);
  }
})().catch((err) => {
  console.error('error:', err.message);
  process.exit(1);
});
