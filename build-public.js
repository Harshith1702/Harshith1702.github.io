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
for (const name of ['index.html', '404.html', 'style.css', 'portfolio.css', 'reveal-fx.css', 'script.js', 'reveal-fx.js', 'theme.js', 'project-page.js', 'projects', 'favicon.ico', 'img', 'fonts', 'cursor', 'video', 'llms.txt', 'CNAME']) {
  if (fs.existsSync(path.join(__dirname, name))) {
    fs.cpSync(path.join(__dirname, name), path.join(destination, name), {
      recursive: true,
      filter: source => !fs.lstatSync(source).isSymbolicLink()
    });
  }
}
// Keep host and local-server headers in sync without requiring a framework.
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8').replace(/^\uFEFF/, ''));
const deployedHeaders = config.headers[0].headers;
if (JSON.stringify(deployedHeaders) !== JSON.stringify(Object.entries(securityHeaders).map(([key, value]) => ({ key, value })))) {
  throw new Error('Vercel security headers differ from security.js');
}
