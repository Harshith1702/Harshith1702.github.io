// Vercel Serverless Function adapter for /api/visit
const { handleVisitRequest, visitorStore } = require('../server.js');

module.exports = (req, res) => {
  try {
    const url = req.url || '';
    // If request is read-only count query
    if (req.method === 'GET' && (url.includes('/count') || url.endsWith('/count'))) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        count: visitorStore.totalUnique || 59
      }));
    }

    return handleVisitRequest(req, res);
  } catch (err) {
    console.error('[Vercel Serverless Function Guard]', err);
    try {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        count: visitorStore.totalUnique || 59
      }));
    } catch (e) {
      try { res.end(); } catch (e2) {}
    }
  }
};
