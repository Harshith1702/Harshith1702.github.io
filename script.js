/* ============================================================
   ARCHIVE SCRIPTS
   1. Reveal Observer
   2. Entrance Gate Controls
   3. Canonical Chapter Navigation System (00 to 08)
   4. Wednesday's Thing Easter Egg Interaction
   5. Secret Chapter Reveal
   6. Real Unique Visitor Counter
   Zero em dashes.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // 0. RESET SCROLL RESTORATION & INITIAL ENTRY STATE
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // Clear any residual hash so browser refresh always returns to the main landing experience
  if (window.location.hash) {
    try {
      history.replaceState(null, '', window.location.href.split('#')[0]);
    } catch (e) {}
  }

  // -----------------------------------------------------------
  // 1. REVEAL OBSERVER
  // -----------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 120) {
      el.classList.add('in');
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 60px 0px'
  });
  revealElements.forEach(el => revealObserver.observe(el));


  // -----------------------------------------------------------
  // 2. ENTRANCE GATE CONTROLS (CINEMATIC INTRO vs DIRECT VIEW)
  // -----------------------------------------------------------
  const gateOverlay = document.getElementById('gateOverlay');
  const gateEnterBtn = document.getElementById('gateEnterBtn');
  const gateSkipBtn = document.getElementById('gateSkipBtn');

  function enterWithIntro() {
    if (!gateOverlay || gateOverlay.style.display === 'none') return;
    gateOverlay.classList.add('gate-transitioning');
    document.documentElement.classList.add('archive-entered');
    document.body.classList.add('archive-entered');
    window.scrollTo(0, 0);
    setActiveDockChapter('ch0');

    setTimeout(() => {
      gateOverlay.style.display = 'none';
    }, 820);
  }

  function enterDirectly() {
    if (!gateOverlay || gateOverlay.style.display === 'none') return;
    gateOverlay.style.transition = 'none';
    gateOverlay.style.display = 'none';
    document.documentElement.classList.add('archive-entered');
    document.body.classList.add('archive-entered');
    window.scrollTo(0, 0);
    setActiveDockChapter('ch0');
  }

  if (gateEnterBtn) {
    gateEnterBtn.addEventListener('click', enterWithIntro);
  }
  if (gateSkipBtn) {
    gateSkipBtn.addEventListener('click', enterDirectly);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gateOverlay && gateOverlay.style.display !== 'none') {
      enterDirectly();
    }
  });


  // -----------------------------------------------------------
  // 3. CANONICAL CHAPTER NAVIGATION ARCHITECTURE (00 to 08)
  // -----------------------------------------------------------
  const CANONICAL_CHAPTERS = [
    { index: 0, key: '0', numStr: '00', id: 'ch0', name: 'ROOM', title: '00 / ROOM' },
    { index: 1, key: '1', numStr: '01', id: 'ch1', name: 'GrindLens', title: '01 / GrindLens' },
    { index: 2, key: '2', numStr: '02', id: 'ch2', name: 'BUILDS', title: '02 / BUILDS' },
    { index: 3, key: '3', numStr: '03', id: 'ch3', name: 'OSS', title: '03 / OSS' },
    { index: 4, key: '4', numStr: '04', id: 'ch4', name: 'SKILLS', title: '04 / SKILLS' },
    { index: 5, key: '5', numStr: '05', id: 'ch5', name: 'RIGOR', title: '05 / RIGOR' },
    { index: 6, key: '6', numStr: '06', id: 'ch6', name: 'PUBLIC', title: '06 / PUBLIC' },
    { index: 7, key: '7', numStr: '07', id: 'ch7', name: 'INTERIOR', title: '07 / INTERIOR' },
    { index: 8, key: '8', numStr: '08', id: 'ch8', name: 'ABOUT', title: '08 / ABOUT' }
  ];

  const dockItems = document.querySelectorAll('.dock-item');

  function setActiveDockChapter(activeId) {
    dockItems.forEach(item => {
      const match = item.getAttribute('data-target') === activeId;
      item.classList.toggle('active', match);
    });
  }

  function resolveCanonicalChapter(input) {
    if (typeof input === 'number') {
      return CANONICAL_CHAPTERS.find(c => c.index === input) || null;
    }
    if (typeof input === 'string') {
      const clean = input.replace(/^#/, '').toLowerCase().trim();
      return CANONICAL_CHAPTERS.find(c =>
        c.id.toLowerCase() === clean ||
        c.key === clean ||
        c.numStr === clean ||
        c.name.toLowerCase() === clean ||
        (clean === 'skills' && c.id === 'ch4') ||
        (clean === 'oss' && c.id === 'ch3') ||
        (clean === 'builds' && c.id === 'ch2') ||
        (clean === 'grindlens' && c.id === 'ch1') ||
        (clean === 'room' && c.id === 'ch0') ||
        (clean === 'rigor' && c.id === 'ch5') ||
        (clean === 'public' && c.id === 'ch6') ||
        (clean === 'interior' && c.id === 'ch7') ||
        (clean === 'about' && c.id === 'ch8')
      ) || null;
    }
    return null;
  }

  let isProgrammaticNav = false;
  let navLockTimer = null;

  function navigateToChapter(target, options = {}) {
    const ch = resolveCanonicalChapter(target);
    if (!ch) return false;

    const el = document.getElementById(ch.id);
    if (!el) return false;

    // If gate overlay is up, dismiss it
    if (gateOverlay && gateOverlay.style.display !== 'none') {
      gateOverlay.style.display = 'none';
      document.documentElement.classList.add('archive-entered');
      document.body.classList.add('archive-entered');
    }

    isProgrammaticNav = true;
    clearTimeout(navLockTimer);
    navLockTimer = setTimeout(() => {
      isProgrammaticNav = false;
    }, 1000);

    setActiveDockChapter(ch.id);

    // Update URL hash
    const expectedHash = '#' + ch.id;
    if (options.pushHistory) {
      if (window.location.hash !== expectedHash) {
        try {
          history.pushState(null, '', expectedHash);
        } catch (e) {}
      }
    } else if (options.updateHash !== false) {
      if (window.location.hash !== expectedHash) {
        try {
          history.replaceState(null, '', expectedHash);
        } catch (e) {}
      }
    }

    if (options.immediate) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return true;
  }

  // A. Bottom Dock Clicks
  dockItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      navigateToChapter(targetId, { pushHistory: true });
    });
  });

  const dockContact = document.querySelector('.dock-contact-link');
  if (dockContact) {
    dockContact.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToChapter('ch8', { pushHistory: true });
    });
  }

  // B. Keyboard Number Shortcuts (Keys '0' through '8')
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, [contenteditable="true"]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!document.body.classList.contains('archive-entered')) return;

    const key = e.key;
    if (['0', '1', '2', '3', '4', '5', '6', '7', '8'].includes(key)) {
      e.preventDefault();
      const num = parseInt(key, 10);
      navigateToChapter(num, { pushHistory: true });
    }
  });

  // C. Hero Scroll Cue in Chapter 00
  const heroScrollBtn = document.querySelector('.hero-scroll-action');
  if (heroScrollBtn) {
    heroScrollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToChapter('ch1', { pushHistory: true });
    });
  }

  // D. Scroll Spy & Dynamic Hash Sync
  function performScrollSpy() {
    if (isProgrammaticNav || !document.body.classList.contains('archive-entered')) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const probeY = scrollY + window.innerHeight * 0.35;

    let currentCh = CANONICAL_CHAPTERS[0];

    for (let i = 0; i < CANONICAL_CHAPTERS.length; i++) {
      const ch = CANONICAL_CHAPTERS[i];
      const el = document.getElementById(ch.id);
      if (el) {
        const top = el.getBoundingClientRect().top + scrollY;
        if (top <= probeY) {
          currentCh = ch;
        } else {
          break;
        }
      }
    }

    if (currentCh) {
      setActiveDockChapter(currentCh.id);
      const expectedHash = '#' + currentCh.id;
      if (window.location.hash !== expectedHash) {
        try {
          history.replaceState(null, '', expectedHash);
        } catch (e) {}
      }
    }
  }

  let scrollSpyTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollSpyTicking) {
      window.requestAnimationFrame(() => {
        performScrollSpy();
        scrollSpyTicking = false;
      });
      scrollSpyTicking = true;
    }
  }, { passive: true });

  // E. Browser Back / Forward History Navigation
  window.addEventListener('hashchange', () => {
    if (!document.body.classList.contains('archive-entered')) return;
    if (window.location.hash) {
      navigateToChapter(window.location.hash, { immediate: false, updateHash: false });
    }
  });

  // Reset scroll & strip hash on page unload/refresh
  window.addEventListener('beforeunload', () => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    if (window.location.hash) {
      try {
        history.replaceState(null, '', window.location.href.split('#')[0]);
      } catch (e) {}
    }
    window.scrollTo(0, 0);
  });


  // -----------------------------------------------------------
  // 4. WEDNESDAY'S THING EASTER EGG INTERACTION
  // -----------------------------------------------------------
  const thingEasterEgg = document.getElementById('thingEasterEgg');
  const thingWhisper = document.getElementById('thingWhisper');
  const whispers = [
    "Thing approves.",
    "Watching from the shadows.",
    "Never let them see you blink.",
    "Two taps for yes.",
    "The dark suits you."
  ];
  let whisperIdx = 0;

  if (thingEasterEgg && thingWhisper) {
    thingEasterEgg.addEventListener('click', () => {
      whisperIdx = (whisperIdx + 1) % whispers.length;
      thingWhisper.textContent = whispers[whisperIdx];
      thingEasterEgg.classList.add('thing-active');
      
      // Tap vibration on supported mobile devices
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }

      setTimeout(() => {
        thingEasterEgg.classList.remove('thing-active');
      }, 3500);
    });
  }



  // -----------------------------------------------------------
  // 5. OTHER PROJECTS DRAWER (OPENS WHEN PRESSED ONLY)
  // -----------------------------------------------------------
  const otherProjectsTrigger = document.getElementById('otherProjectsTrigger');
  const otherProjectsPanel = document.getElementById('otherProjectsPanel');
  if (otherProjectsTrigger && otherProjectsPanel) {
    otherProjectsTrigger.addEventListener('click', () => {
      const isExpanded = otherProjectsTrigger.getAttribute('aria-expanded') === 'true';
      const willExpand = !isExpanded;
      otherProjectsTrigger.setAttribute('aria-expanded', String(willExpand));
      otherProjectsPanel.hidden = !willExpand;
      const numSpan = otherProjectsTrigger.querySelector('.trigger-num');
      if (numSpan) {
        numSpan.textContent = willExpand ? '[-]' : '[+]';
      }
    });
  }

  // -----------------------------------------------------------
  async function initVisitorCounter() {
    const noteEl = document.getElementById('visitorPresenceNote');
    const countEl = document.getElementById('visitorCountVal');
    if (!noteEl || !countEl) return;

    try {
      const cachedCount = localStorage.getItem('archive_last_count');
      if (cachedCount && !countEl.textContent.trim()) {
        countEl.textContent = Number(cachedCount).toLocaleString();
      }
    } catch (e) {}

    function resolveApiUrl(path) {
      if (typeof window.__PORTFOLIO_API_URL__ === 'string' && window.__PORTFOLIO_API_URL__) {
        return window.__PORTFOLIO_API_URL__.replace(/\/$/, '') + path;
      }
      if (window.location.protocol === 'file:') {
        return 'http://localhost:3000' + path;
      }
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (window.location.port && window.location.port !== '3000') {
          return 'http://localhost:3000' + path;
        }
      }
      return path;
    }

    let anonVid = null;
    try {
      anonVid = localStorage.getItem('archive_anon_vid');
    } catch (e) {}

    const headers = { 'Content-Type': 'application/json' };
    if (anonVid) {
      headers['X-Visitor-Id'] = anonVid;
    }

    const targetUrl = resolveApiUrl('/api/visit');

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Visitor API status ${response.status}`);
      }

      const data = await response.json();
      if (data && typeof data.count === 'number') {
        countEl.textContent = Number(data.count).toLocaleString();
        try {
          localStorage.setItem('archive_last_count', data.count);
          if (data.visitorId) {
            localStorage.setItem('archive_anon_vid', data.visitorId);
          }
        } catch (e) {}
      }
    } catch (err) {
      try {
        const readUrl = resolveApiUrl('/api/visit/count');
        const readResponse = await fetch(readUrl, { credentials: 'include' });
        if (readResponse.ok) {
          const readData = await readResponse.json();
          if (readData && typeof readData.count === 'number') {
            countEl.textContent = Number(readData.count).toLocaleString();
            try {
              localStorage.setItem('archive_last_count', readData.count);
            } catch (e) {}
            return;
          }
        }
      } catch (readErr) {}

      if (targetUrl !== 'http://localhost:3000/api/visit') {
        try {
          const localRes = await fetch('http://localhost:3000/api/visit', {
            method: 'POST',
            headers: headers,
            credentials: 'include'
          });
          if (localRes.ok) {
            const localData = await localRes.json();
            if (localData && typeof localData.count === 'number') {
              countEl.textContent = Number(localData.count).toLocaleString();
              try {
                localStorage.setItem('archive_last_count', localData.count);
              } catch (e) {}
              return;
            }
          }
        } catch (localErr) {}
      }

      console.warn('[Visitor Counter] API currently unavailable:', err.message);
    }
  }

  initVisitorCounter();

});
