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

