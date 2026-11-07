const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { securityHeaders } = require('./security');
const ROOT = __dirname;
const DB_FILE = path.resolve(process.env.VISITORS_DB_PATH || path.join(ROOT, 'data', 'visitors.json'));
const visitorStore = { totalUnique: 0, visitors: {} };
let storeAvailable = !process.env.VERCEL;
function loadStore() {
  try {
    if (!fs.existsSync(DB_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!Number.isSafeInteger(parsed.totalUnique) || parsed.totalUnique < 0 ||
        !parsed.visitors || Array.isArray(parsed.visitors) || typeof parsed.visitors !== 'object' ||
        Object.keys(parsed.visitors).some(key => !/^[a-f0-9]{64}$/.test(key))) throw new Error('Invalid visitor store');
    Object.assign(visitorStore, parsed);
  } catch (err) {
    storeAvailable = false;
    console.error('[Visitors] Store unavailable:', err.message);
  }
}
function saveStore() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const temporary = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(visitorStore, null, 2), { mode: 0o600 });
  fs.renameSync(temporary, DB_FILE);
}
loadStore();
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
function parseCookies(req) {
  const cookies = Object.create(null);
  for (const item of (req.headers.cookie || '').split(';')) {
    const equals = item.indexOf('=');
    if (equals < 1) continue;
    try { cookies[item.slice(0, equals).trim()] = decodeURIComponent(item.slice(equals + 1).trim()); }
    catch { /* Ignore malformed cookies. */ }
  }
  return cookies;
}
const isValidToken = token => typeof token === 'string' &&
  (/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(token) || /^[0-9a-f]{16,64}$/i.test(token));
// Forwarded IPs require explicit trust in the operator's reverse proxy.
const rateLimits = new Map();
function rateLimited(req) {
  const address = process.env.TRUST_PROXY === '1'
    ? String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
    : req.socket?.remoteAddress || 'unknown';
  const key = crypto.createHash('sha256').update(address).digest('hex');
  const now = Date.now();
  for (const [id, record] of rateLimits) if (record.until <= now) rateLimits.delete(id);
  let record = rateLimits.get(key);
  if (!record) {
    if (rateLimits.size >= 10000) return true;
    record = { count: 0, until: now + 60000 };
    rateLimits.set(key, record);
  }
  return ++record.count > 30;
}
function handleVisitRequest(req, res) {
  for (const [name, value] of Object.entries(securityHeaders)) res.setHeader(name, value);
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { success: false, error: 'Method not allowed' });
  }
  // Serverless local files cannot provide an accurate shared count.
  if (!storeAvailable) return json(res, 503, { success: false, error: 'Visitor count unavailable' });
  if (req.method === 'GET') return json(res, 200, { success: true, count: visitorStore.totalUnique });
  if (req.headers['sec-fetch-site'] === 'cross-site') return json(res, 403, { success: false });
  if (req.headers.origin) {
    try {
      const origin = new URL(req.headers.origin);
      if (!['http:', 'https:'].includes(origin.protocol) || origin.host !== req.headers.host) throw new Error();
    } catch { return json(res, 403, { success: false }); }
  }
  if (rateLimited(req)) {
    res.setHeader('Retry-After', '60');
    return json(res, 429, { success: false, error: 'Too many requests' });
  }
  let token = parseCookies(req).anon_vid || req.headers['x-visitor-id'];
  if (!isValidToken(token)) token = crypto.randomUUID();
  const id = crypto.createHash('sha256').update(token).digest('hex');
  const isNew = !Object.hasOwn(visitorStore.visitors, id);
  if (isNew) {
    visitorStore.visitors[id] = { firstSeen: new Date().toISOString(), visits: 1 };
    visitorStore.totalUnique++;
    try { saveStore(); }
    catch (err) {
      delete visitorStore.visitors[id];
      visitorStore.totalUnique--;
      console.error('[Visitors] Could not save:', err.message);
      return json(res, 503, { success: false, error: 'Visitor count unavailable' });
    }
  }
  const secure = req.socket?.encrypted || process.env.NODE_ENV === 'production' || process.env.VERCEL;
  res.setHeader('Set-Cookie', `anon_vid=${token}; Path=/; Max-Age=63072000; SameSite=Lax; HttpOnly${secure ? '; Secure' : ''}`);
  return json(res, 200, { success: true, count: visitorStore.totalUnique, isNew });
}
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.ico': 'image/x-icon',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8' };
const PROJECT_IDS = ['grindlens', 'rocketchat', 'openchat', 'discord', 'midnight', 'deadpacket', 'nptel', 'socialgraph', 'tracker'];
const PUBLIC_FILES = new Set(['index.html', '404.html', 'privacy.html', 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'style.css', 'portfolio.css', 'reveal-fx.css', 'script.js', 'reveal-fx.js', 'theme.js', 'project-page.js', 'favicon.ico', 'llms.txt',
  'projects/index.html', 'experience/index.html', 'opensource/index.html',
  ...PROJECT_IDS.map(id => `projects/${id}.html`)]);
// Unknown, private, and malformed paths all show the same designed 404 page.
function notFound(req, res) {
  fs.readFile(path.join(ROOT, '404.html'), (error, body) => {
    if (error) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not found'); }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': body.length, 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : body);
  });
}
function requestHandler(req, res) {
  for (const [name, value] of Object.entries(securityHeaders)) res.setHeader(name, value);
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  if (pathname === '/api/visit' || pathname === '/api/visit/count') {
    if (pathname.endsWith('/count') && req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return json(res, 405, { success: false });
    }
    return handleVisitRequest(req, res);
  }
  if (pathname === '/api/health' && req.method === 'GET') return json(res, 200, { status: 'ok' });
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    res.writeHead(405); return res.end('Method not allowed');
  }
  let relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (['projects', 'projects/'].includes(relative)) {
    res.writeHead(302, { 'Location': '/#projects' });
    return res.end();
  }
  if (['experience', 'experience/'].includes(relative)) {
    res.writeHead(302, { 'Location': '/#experience' });
    return res.end();
  }
  if (['opensource', 'opensource/'].includes(relative)) {
    res.writeHead(302, { 'Location': '/#opensource' });
    return res.end();
  }
  if (PROJECT_IDS.some(id => relative === `projects/${id}`)) relative += '.html';
  const ext = path.extname(relative).toLowerCase();
  const allowed = PUBLIC_FILES.has(relative) ||
    (/^(img|fonts|cursor|video)\/[a-zA-Z0-9_./-]+$/.test(relative) && Boolean(MIME[ext]) &&
      !['.html', '.js', '.css'].includes(ext));
  const file = path.resolve(ROOT, relative);
  if (!allowed || relative.split(/[\\/]/).some(part => part.startsWith('.')) || !file.startsWith(ROOT + path.sep)) {
    return notFound(req, res);
  }
  fs.realpath(file, (error, real) => {
    if (error || !real.startsWith(ROOT + path.sep)) return notFound(req, res);
    fs.stat(real, (err, stat) => {
      if (err || !stat.isFile()) return notFound(req, res);
      res.writeHead(200, { 'Content-Type': MIME[ext], 'Content-Length': stat.size,
        'Cache-Control': ['.html', '.js', '.css'].includes(ext) ? 'no-cache' : 'public, max-age=86400' });
      if (req.method === 'HEAD') return res.end();
      const stream = fs.createReadStream(real);
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    });
  });
}
const server = http.createServer({ maxHeaderSize: 16384 }, requestHandler);
server.requestTimeout = 15000;
server.headersTimeout = 10000;
if (require.main === module) server.listen(process.env.PORT || 3000, () => console.log(`Archive: http://localhost:${process.env.PORT || 3000}`));
module.exports = { server, requestHandler, handleVisitRequest, visitorStore, loadStore, saveStore };
