const fs = require('node:fs');
const path = require('node:path');
const { securityHeaders } = require('./security');
const destination = path.join(__dirname, 'public');
// Only known public assets enter the deployment. Keep source and data private.
if (path.dirname(destination) !== __dirname || path.basename(destination) !== 'public' ||
    (fs.existsSync(destination) && fs.lstatSync(destination).isSymbolicLink())) {
  throw new Error('Unsafe build destination');
}
fs.rmSync(destination, { recursive: true, force: true });
fs.mkdirSync(destination, { recursive: true });
// Only images the pages actually use are deployed. Everything else stays in the working folder.
const IMG_ALLOW = new Set(['about_wednesday.jpg', 'about_harshith.jpg', 'grindlens_logo.png', 'grindlens_banner.png', 'rtrp_chat_rooms.png', 'discord_reporter.png', 'tracker_ui.png', 'thing.png', 'playlist-cover.jpg', 'banner_ocean_moon.jpg', 'og-preview.png', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-192x192.png', 'apple-touch-icon.png']);
const imgRoot = path.join(__dirname, 'img');
function publicFilter(source) {
  if (fs.lstatSync(source).isSymbolicLink()) return false;
  const rel = path.relative(imgRoot, source);
  if (rel.startsWith('..') || path.isAbsolute(rel) || rel === '') return true;
  if (rel.startsWith('logos')) return true;
  return IMG_ALLOW.has(rel);
}
for (const name of ['index.html', '404.html', 'privacy.html', 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'style.css', 'portfolio.css', 'reveal-fx.css', 'script.js', 'reveal-fx.js', 'theme.js', 'project-page.js', 'projects', 'experience', 'opensource', 'favicon.ico', 'img', 'fonts', 'cursor', 'video', 'llms.txt', 'CNAME']) {
  if (fs.existsSync(path.join(__dirname, name))) {
    fs.cpSync(path.join(__dirname, name), path.join(destination, name), {
      recursive: true,
      filter: publicFilter
    });
  }
}
// Keep host and local-server headers in sync without requiring a framework.
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8').replace(/^\uFEFF/, ''));
const deployedHeaders = config.headers[0].headers;
if (JSON.stringify(deployedHeaders) !== JSON.stringify(Object.entries(securityHeaders).map(([key, value]) => ({ key, value })))) {
  throw new Error('Vercel security headers differ from security.js');
}
