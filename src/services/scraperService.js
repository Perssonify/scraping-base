const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const Page = require('../models/Page');
const RequestLog = require('../models/RequestLog');
const { getProxy } = require('./proxyService');

async function scrapeUrl(url, { depth = 1 } = {}) {
  const proxy = getProxy();
  const startedAt = Date.now();
  const proxyUsed = Boolean(proxy);

  try {
    const response = await axios.get(url, {
      httpsAgent: proxy.agent,
      httpAgent: proxy.agent,
      proxy: false,
      timeout: 20000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
    });

    const domain = new URL(url).hostname.replace(/^www\./, '');
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');

    const $ = cheerio.load(response.data);
    const title = $('title').first().text().trim();
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    const page = await Page.findOneAndUpdate(
      { url: cleanUrl },
      { $set: { domain, title, html: response.data, text } },
      { upsert: true, new: true, setDefaultsOnInsert: true, timestamps: true }
    );

    const durationMs = Date.now() - startedAt;
    await RequestLog.create({ url: cleanUrl, proxy: proxyUsed, status: response.status, durationMs });
    logger.info('request:success', { url: cleanUrl, proxy: proxyUsed, status: response.status, durationMs, depth });

    let childCount = 0;
    if (depth > 0) {
      const childUrls = await extractUrls(response.data, domain);
      for (const childUrl of childUrls) {
        if (childUrl === cleanUrl) continue;
        const childDomain = childUrl.split('/')[0];
        await Page.updateOne(
          { url: childUrl },
          {
            $addToSet: { referenceUrl: cleanUrl },
            $setOnInsert: { domain: childDomain },
          },
          { upsert: true, timestamps: true }
        );
        childCount++;
      }
    }

    return { url: cleanUrl, status: response.status, title, pageId: page.id, durationMs, childCount };
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const status = err.response ? err.response.status : null;
    await RequestLog.create({ url, proxy: proxyUsed, status, durationMs, error: err.message });
    logger.error('request:failed', { url, proxy: proxyUsed, status, durationMs, error: err.message });
    return { url, status, error: err.message, durationMs };
  }
}

async function scrapeMany(urls, { depth = 1 } = {}) {
  const results = [];
  for (const url of urls) {
    results.push(await scrapeUrl(url, { depth }));
  }
  return results;
}

async function extractUrls(html, domain) {
  try {
    const $ = cheerio.load(html);
    const baseDomain = domain.replace(/^www\./, '');

    const urls = $('a').map((i, el) => {
      const href = $(el).attr('href');
      let fullUrl;
      if (href?.startsWith('http')) {
        fullUrl = href;
      } else if (href?.startsWith('/')) {
        fullUrl = `https://${domain}${href}`;
      } else {
        return null;
      }

      try {
        const linkDomain = new URL(fullUrl).hostname.replace(/^www\./, '');
        if (linkDomain !== baseDomain) return null;
      } catch {
        return null;
      }
      return fullUrl;
    }).get()
    .filter(Boolean);

    let cleanUrls = [...new Set(urls)];
    cleanUrls = cleanUrls.map((url) => url.replace(/^https?:\/\//, '').replace(/^www\./, ''));

    console.log('cleanUrls 2', cleanUrls);

    return cleanUrls;
  } catch (err) {
    console.error('Error extracting URLs:', err);
    return [];
  }
}

module.exports = { scrapeMany };
