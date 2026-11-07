const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'archive-security-'));
process.env.VISITORS_DB_PATH = path.join(directory, 'visitors.json');
process.env.NODE_ENV = 'production';
delete process.env.VERCEL;
const { server } = require('./server');
let base;
before(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise(resolve => server.close(resolve));
  fs.rmSync(directory, { recursive: true });
});
test('public assets work while source, records, and scratch files stay private', async () => {
  for (const url of ['/', '/style.css', '/portfolio.css', '/script.js', '/theme.js', '/img/about.jpg']) {
    const response = await fetch(base + url);
    assert.equal(response.status, 200, url);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.match(response.headers.get('content-security-policy'), /script-src 'self'/);
    await response.arrayBuffer();
  }
  for (const url of ['/server.js', '/security.js', '/data/visitors.json', '/.git/config', '/package.json',
    '/scratch_original_index.html', '/arman_modal_dump.html', '/img/%2e%2e%5cserver.js', '/%2e%2e%5cserver.js']) {
    assert.equal((await fetch(base + url)).status, 404, url);
  }
});
test('project cards navigate to complete internal pages that also work as direct URLs', async () => {
  const index = await (await fetch(base + '/')).text();
  assert.doesNotMatch(index, /href="https:\/\/github\.com\/Harshith1702\/GrindLens(?:[\/"?#])/i, 'Private GrindLens repository must not be advertised');
  const ids = ['grindlens', 'openchat', 'discord', 'midnight', 'deadpacket', 'nptel', 'socialgraph', 'tracker'];
  for (const id of ids) {
    assert.ok(index.includes(`href="projects/${id}.html"`), `Missing internal card link: ${id}`);
    for (const suffix of ['', '.html']) {
      const response = await fetch(`${base}/projects/${id}${suffix}`);
      assert.equal(response.status, 200, `${id}${suffix}`);
      const body = await response.text();
      if (id === 'grindlens') {
        assert.doesNotMatch(body, /href="https:\/\/github\.com\/Harshith1702\/GrindLens(?:[\/"?#])/i);
      }
      assert.match(body, /<h1>.+<\/h1>/);
      assert.ok(body.includes('About the project'));
      assert.ok(body.includes('href="../index.html#projects"'));
      assert.ok(body.includes('href="https://'), `Missing live/source link for ${id}`);
    }
  }
  assert.equal((await fetch(base + '/projects/missing')).status, 404);
  assert.equal((await fetch(base + '/projects/../server.js')).status, 404);
});
test('pages and their assets resolve when index.html is opened directly from disk', () => {
  const { pathToFileURL, fileURLToPath } = require('node:url');
  const pages = ['index.html', '404.html', ...fs.readdirSync(path.join(__dirname, 'projects')).map(name => `projects/${name}`)];
  for (const page of pages) {
    const filename = path.join(__dirname, page);
    const html = fs.readFileSync(filename, 'utf8');
    for (const tag of html.matchAll(/<(?:a|link|script|img)\b[^>]*>/g)) {
      const target = tag[0].match(/(?:href|src)="([^"]+)"/)?.[1];
      if (!target || target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      // 404.html is served at any URL depth, so it must use root-relative paths.
      const rootRelativeAllowed = page === '404.html';
      assert.ok(rootRelativeAllowed || !target.startsWith('/'), `${page}: root-relative link breaks file navigation: ${target}`);
      const resolved = rootRelativeAllowed && target.startsWith('/')
        ? path.join(__dirname, target.split(/[?#]/)[0])
        : fileURLToPath(new URL(target, pathToFileURL(filename)));
      assert.ok(fs.existsSync(resolved), `${page}: missing local file: ${target}`);
    }
  }
});
test('malformed URL returns 400 without crashing', async () => {
  const status = await new Promise((resolve, reject) => {
    http.get(base + '/%ZZ', response => { response.resume(); resolve(response.statusCode); }).on('error', reject);
  });
  assert.equal(status, 400);
  assert.equal((await fetch(base + '/api/health')).status, 200);
});
test('GET is read-only; POST deduplicates cookies and rejects cross-site writes', async () => {
  assert.equal((await (await fetch(base + '/api/visit')).json()).count, 0);
  assert.equal((await (await fetch(base + '/api/visit/count')).json()).count, 0);
  const first = await fetch(base + '/api/visit', { method: 'POST', headers: { Cookie: 'bad=%ZZ' } });
  const cookie = first.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly; Secure/);
  assert.match(cookie, /SameSite=Lax/);
  const data = await first.json();
  assert.equal(data.count, 1);
  assert.equal(data.isNew, true);
  assert.equal(data.visitorId, undefined);
  const returning = await fetch(base + '/api/visit', { method: 'POST', headers: { Cookie: cookie.split(';')[0] } });
  assert.deepEqual(await returning.json(), { success: true, count: 1, isNew: false });
  const crossSite = await fetch(base + '/api/visit', { method: 'POST', headers: { Origin: 'https://attacker.example' } });
  assert.equal(crossSite.status, 403);
  assert.equal(crossSite.headers.get('access-control-allow-origin'), null);
  assert.equal((await fetch(base + '/api/visit', { method: 'DELETE' })).status, 405);
  assert.equal((await fetch(base + '/api/visit/count', { method: 'POST' })).status, 405);
  assert.equal((await (await fetch(base + '/api/visit/count')).json()).count, 1);
});
test('counter throttles repeated writes', async () => {
  let response;
  for (let i = 0; i < 31; i++) response = await fetch(base + '/api/visit', { method: 'POST' });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '60');
});
test('Vercel adapter reports unavailable instead of ephemeral fake totals', () => {
  const { spawnSync } = require('node:child_process');
  const result = spawnSync(process.execPath, ['-e', `
    const handler = require('./api/visit');
    handler({url:'/api/visit/count', method:'GET', headers:{}}, {
      setHeader(){}, writeHead(status){if(status!==503)process.exit(1)},
      end(body){if(JSON.parse(body).success!==false)process.exit(2)}
    });
  `], { cwd: __dirname, env: { ...process.env, VERCEL: '1' } });
  assert.equal(result.status, 0, result.stderr.toString());
});
