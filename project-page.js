document.getElementById('project-theme-toggle')?.addEventListener('click', () => {
  const root = document.documentElement;
  const theme = root.classList.contains('dark') ? 'light' : 'dark';
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
  try { localStorage.setItem('theme', theme); } catch {}
});

// Use clean URLs on web servers while preserving static HTML local file compatibility
if (window.location.protocol.startsWith('http')) {
  document.querySelectorAll('a[href*="index.html"]').forEach(a => {
    const raw = a.getAttribute('href');
    if (raw) a.setAttribute('href', raw.replace('index.html', ''));
  });
}

// Anonymous first-party visit telemetry (strictly first-party, zero third-party tracking)
if (window.location.protocol.startsWith('http') && navigator.doNotTrack !== '1' && !/(?:github\.io|vercel\.app)$/.test(window.location.hostname)) {
  try {
    fetch('/api/visit', { method: 'POST', credentials: 'same-origin', signal: AbortSignal.timeout(6000) }).catch(() => {});
  } catch (e) {}
}

// 404 Interactive Raven & Hotkey Navigation
(function() {
  const badPathEl = document.getElementById('bad-path');
  if (badPathEl) {
    try {
      const p = window.location.pathname;
      if (p && p !== '/404.html' && p !== '/404') {
        badPathEl.textContent = ' ' + p;
      }
    } catch (e) {}
  }

  if (document.querySelector('.diagnostic-panel')) {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey) return;
      const routes = {
        '1': '/',
        'h': '/',
        'H': '/',
        '2': '/projects/grindlens.html',
        '3': '/projects/openchat.html',
        '4': '/projects/discord.html',
        '5': '/projects/deadpacket.html'
      };
      if (routes[e.key]) {
        window.location.href = routes[e.key];
      }
    });
  }
})();


