// ============================================================
// NOCTURNAL ARCHIVE SERVER & UNIQUE VISITOR COUNTER API
// Zero external dependencies - uses Node.js standard modules only
// Production ready for Render, Railway, Vercel, and local Node.js
// ============================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');

// Configurable database path (supports test isolation and serverless environments)
function resolveDbPath() {
  if (process.env.VISITORS_DB_PATH) {
    return path.resolve(process.env.VISITORS_DB_PATH);
  }
  // If data dir cannot be created or is read-only (e.g. Vercel serverless), fallback to /tmp
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return path.join(DATA_DIR, 'visitors.json');
  } catch (err) {
    const tmpDir = process.env.TMPDIR || process.env.TEMP || '/tmp';
    return path.join(tmpDir, 'visitors.json');
  }
}

let DB_FILE = resolveDbPath();

// In-memory cache for fast O(1) lookups
let visitorStore = {
  totalUnique: 0,
  visitors: {}
};

// Load existing records from disk
function loadStore() {
  try {
    DB_FILE = resolveDbPath();
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.totalUnique === 'number' && typeof parsed.visitors === 'object') {
        visitorStore = parsed;
      }
    } else {
      saveStore();
    }
  } catch (err) {
    console.error('[Store] Error reading database, starting fresh:', err.message);
    saveStore();
  }
}

// Atomic write to disk to prevent corruption
function saveStore() {
  try {
    DB_FILE = resolveDbPath();
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(visitorStore, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    // If standard write fails (e.g. read-only filesystem), attempt /tmp fallback
    try {
      const tmpDir = process.env.TMPDIR || process.env.TEMP || '/tmp';
      const fallbackFile = path.join(tmpDir, 'visitors.json');
      fs.writeFileSync(fallbackFile, JSON.stringify(visitorStore, null, 2), 'utf8');
      DB_FILE = fallbackFile;
    } catch (fallbackErr) {
      console.error('[Store] Error saving database:', err.message);
    }
  }
}

loadStore();

// MIME Types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.ico': 'image/x-icon'
};

// Helper to parse cookies from request header
function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;

  rc.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift().trim();
    if (name) {
      const value = decodeURIComponent(parts.join('='));
      list[name] = value;
    }
  });

  return list;
}

// Validate anonymous visitor token format (UUID or 16-64 hex chars)
function isValidToken(token) {
  if (typeof token !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token) ||
         /^[0-9a-f]{16,64}$/i.test(token);
}

// Apply CORS headers for cross-origin or local dev requests
function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Visitor-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Handler for visitor API (can be invoked by HTTP server or Vercel serverless function)
function handleVisitRequest(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const cookies = parseCookies(req);
  let token = cookies['anon_vid'] || req.headers['x-visitor-id'];

  if (!isValidToken(token)) {
    token = crypto.randomUUID();
  }

  // Privacy-conscious SHA-256 hash of token (no raw IDs or personal info stored)
  const hashedId = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date().toISOString();

  let isNewVisitor = false;
  if (!visitorStore.visitors[hashedId]) {
    // First time seeing this visitor
    visitorStore.visitors[hashedId] = {
      firstSeen: now,
      lastSeen: now,
      visits: 1
    };
    visitorStore.totalUnique += 1;
    isNewVisitor = true;
    saveStore();
  } else {
    // Returning visitor: update last seen & visit counter, do NOT increment totalUnique
    visitorStore.visitors[hashedId].lastSeen = now;
    visitorStore.visitors[hashedId].visits = (visitorStore.visitors[hashedId].visits || 1) + 1;
    saveStore();
  }

  // Set 2-year persistent HttpOnly cookie
  res.setHeader(
    'Set-Cookie',
    `anon_vid=${encodeURIComponent(token)}; Path=/; Max-Age=63072000; SameSite=Lax; HttpOnly`
  );

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    count: visitorStore.totalUnique,
    isNew: isNewVisitor,
    visitorId: token
  }));
}

// General HTTP request handler
function requestHandler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;

  // -----------------------------------------------------------
  // API: Unique Visitor Registration & Counting
  // POST /api/visit or GET /api/visit
  // -----------------------------------------------------------
  if (pathname === '/api/visit' && (req.method === 'POST' || req.method === 'GET')) {
    return handleVisitRequest(req, res);
  }

  // -----------------------------------------------------------
  // API: Read-Only Total Unique Visitor Count
  // GET /api/visit/count
  // -----------------------------------------------------------
  if (pathname === '/api/visit/count' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: visitorStore.totalUnique
    }));
    return;
  }

  // -----------------------------------------------------------
  // API: Health Check
  // GET /api/health
  // -----------------------------------------------------------
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      totalUnique: visitorStore.totalUnique
    }));
    return;
  }

  // -----------------------------------------------------------
  // Favicon Handler (Prevent 404 on browser icon queries)
  // -----------------------------------------------------------
  if (pathname === '/favicon.ico') {
    const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
    if (fs.existsSync(icoPath)) {
      res.writeHead(200, { 'Content-Type': 'image/x-icon', 'Cache-Control': 'public, max-age=86400' });
      fs.createReadStream(icoPath).pipe(res);
    } else {
      res.writeHead(204, { 'Content-Type': 'image/x-icon' });
      res.end();
    }
    return;
  }

  // -----------------------------------------------------------
  // Static File Serving
  // -----------------------------------------------------------
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = 'index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security check: ensure path stays within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 Fallback
      const notFoundPath = path.join(PUBLIC_DIR, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(notFoundPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' || ext === '.js' || ext === '.css' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=86400'
    });

    fs.createReadStream(filePath).pipe(res);
  });
}

// HTTP Server
const server = http.createServer(requestHandler);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Archive Server] Running at http://localhost:${PORT}`);
    console.log(`[Archive Server] Current unique visitors: ${visitorStore.totalUnique}`);
  });
}

module.exports = {
  server,
  requestHandler,
  handleVisitRequest,
  visitorStore,
  loadStore,
  saveStore,
  resolveDbPath
};
