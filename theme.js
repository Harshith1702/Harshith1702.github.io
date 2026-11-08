(function() {
  try {
    if (window.location.protocol.startsWith('http') && window.location.pathname.endsWith('/index.html')) {
      const cleanPath = window.location.pathname.slice(0, -10) || '/';
      window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
    }
  } catch (e) {}

  try {
    const saved = localStorage.getItem('theme');
    // Default to dark mode unless explicitly chosen as light
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {}
})();
