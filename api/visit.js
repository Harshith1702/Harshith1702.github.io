// Vercel Serverless Function adapter for /api/visit
const { handleVisitRequest } = require('../server.js');

module.exports = (req, res) => {
  return handleVisitRequest(req, res);
};
