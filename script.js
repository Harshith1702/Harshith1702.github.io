// ============================================================
// HARSHITH PADAKANTI - INTERACTION ENGINE V2
// Portfolio interactions
// Zero em/en dashes. Only standard hyphens.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Preferences remain usable when browser storage is blocked.
  const preferences = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };

  // ----------------------------------------------------------
  // 0. HERO BANNER VIDEO AUTOPLAY ASSURANCE
  // ----------------------------------------------------------
  const heroVideo = document.getElementById('hero-banner-video');
  if (heroVideo) {
    heroVideo.play().catch(() => {});
  }

  // ----------------------------------------------------------
  // 3. EXTRA PROJECTS TOGGLE
  // ----------------------------------------------------------
  const toggleExtraBtn = document.getElementById('toggle-extra-projects-btn');
  const extraProjectsWrapper = document.getElementById('extra-projects-wrapper');
  const extraBtnText = document.getElementById('extra-projects-btn-text');

  if (toggleExtraBtn && extraProjectsWrapper) {
    toggleExtraBtn.addEventListener('click', () => {
      const isHidden = extraProjectsWrapper.classList.contains('hidden');
      toggleExtraBtn.setAttribute('aria-expanded', String(isHidden));
      if (isHidden) {
        extraProjectsWrapper.classList.remove('hidden');
        if (extraBtnText) extraBtnText.textContent = 'Fewer projects';
        toggleExtraBtn.querySelector('svg').style.transform = 'rotate(180deg)';
      } else {
        extraProjectsWrapper.classList.add('hidden');
        if (extraBtnText) extraBtnText.textContent = '3 more projects';
        toggleExtraBtn.querySelector('svg').style.transform = 'rotate(0deg)';
      }
    });
  }

  // ----------------------------------------------------------
  // 4. THEME TOGGLER (LIGHT DEFAULT / DARK TOGGLE)
  // ----------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const html = document.documentElement;

  function setTheme(theme) {
    if (theme === 'dark') {
      html.classList.remove('light');
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
      preferences.set('theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      html.style.colorScheme = 'light';
      preferences.set('theme', 'light');
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const current = html.classList.contains('dark') ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ----------------------------------------------------------
  // 4.1. INTERACTIVE THING COMPANION (WEDNESDAY ADDAMS HAND CRAWLER)
  // Crawls toward mouse cursor, fingertip scuttle, idle tapping, and click interaction.
  // ----------------------------------------------------------
  const thingCompanion = document.getElementById('thing-companion');
  const thingSprite = document.getElementById('thing-sprite');
  const thingShadow = document.getElementById('thing-shadow');
  const thingBubble = document.getElementById('thing-bubble');
  const thingToggleBtn = document.getElementById('thing-toggle-btn');

  let thingEnabled = preferences.get('thing_enabled') !== 'false';

  function updateThingVisibility() {
    if (!thingCompanion) return;
    if (thingEnabled) {
      thingCompanion.style.display = 'block';
      if (thingToggleBtn) thingToggleBtn.classList.add('thing-toggle-active');
    } else {
      thingCompanion.style.display = 'none';
      if (thingToggleBtn) thingToggleBtn.classList.remove('thing-toggle-active');
    }
  }

  let bubbleTimer = null;
  function showThingBubble(text, duration = 1600) {
    if (!thingBubble) return;
    thingBubble.textContent = text;
    thingBubble.classList.add('visible');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
      thingBubble.classList.remove('visible');
    }, duration);
  }

  function toggleThingCompanion() {
    thingEnabled = !thingEnabled;
    preferences.set('thing_enabled', thingEnabled.toString());
    updateThingVisibility();
    if (thingBubble && thingEnabled) {
      showThingBubble('*crawling back* 🖐', 1600);
    }
  }

  if (thingToggleBtn) {
    thingToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleThingCompanion();
    });
  }

  if (thingCompanion) {
    updateThingVisibility();

    // Initial position on screen
    let currentX = window.innerWidth * 0.75;
    let currentY = window.innerHeight * 0.65;
    let targetX = currentX;
    let targetY = currentY;
    let facing = 1;
    let crawlCycle = 0;
    let isMoving = false;
    let idleTicks = 0;
    let tapCycle = 0;
    let hopOffset = 0;

    // Track mouse
    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      idleTicks = 0;
      isMoving = true;
    }, { passive: true });

    // Touch support for mobile/tablet
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        targetX = e.touches[0].clientX;
        targetY = e.touches[0].clientY;
        idleTicks = 0;
        isMoving = true;
      }
    }, { passive: true });

    // Click reaction: hop & tap
    thingCompanion.addEventListener('click', (e) => {
      e.stopPropagation();
      hopOffset = -22;
      const phrases = ['*tap tap tap*', '*scuttles*', '*handshake?*', '*scampering*', '🖐', 'Thing approves.'];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      showThingBubble(randomPhrase, 1400);
    });

    // Animation crawl loop
    function animateThing() {
      if (!thingEnabled || !thingCompanion) {
        requestAnimationFrame(animateThing);
        return;
      }

      // Smooth damp hop offset back to 0
      hopOffset += (0 - hopOffset) * 0.12;

      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const dist = Math.hypot(dx, dy);

      // Standoff distance of 55px so hand creeps up politely rather than rushing directly onto pointer
      if (dist > 55) {
        // Calm, deliberate crawling toward cursor
        isMoving = true;
        idleTicks = 0;
        // Tuned crawl speed: between 1.0 and 2.6 px per frame (slow, deliberate hand scuttle)
        const speed = Math.min(Math.max(dist * 0.022, 1.0), 2.6);
        currentX += (dx / dist) * speed;
        currentY += (dy / dist) * speed;

        crawlCycle += speed * 0.14;
        const wiggle = Math.sin(crawlCycle) * 8;
        const bob = Math.abs(Math.sin(crawlCycle * 2)) * -3.5;

        if (dx < -3) facing = -1;
        else if (dx > 3) facing = 1;

        thingCompanion.style.transform = `translate3d(${currentX - 22}px, ${currentY - 38 + hopOffset}px, 0)`;
        if (thingSprite) {
          thingSprite.style.transform = `scaleX(${facing}) rotate(${wiggle}deg) translateY(${bob}px)`;
        }
        if (thingShadow) {
          thingShadow.style.transform = `scale(${1 - bob * 0.04})`;
        }
      } else {
        // Stationary / Idle
        isMoving = false;
        idleTicks++;

        // Fingertip tapping every ~4 seconds of idle
        if (idleTicks > 120 && idleTicks % 220 < 45) {
          tapCycle += 0.25;
          const tapWiggle = Math.sin(tapCycle * 4) * 6;
          const tapBob = Math.abs(Math.sin(tapCycle * 4)) * -2;
          if (thingSprite) {
            thingSprite.style.transform = `scaleX(${facing}) rotate(${tapWiggle}deg) translateY(${tapBob}px)`;
          }
        } else {
          // Resting flat
          if (thingSprite) {
            thingSprite.style.transform = `scaleX(${facing}) rotate(0deg) translateY(0px)`;
          }
          if (thingShadow) {
            thingShadow.style.transform = 'scale(1)';
          }
        }

        thingCompanion.style.transform = `translate3d(${currentX - 22}px, ${currentY - 38 + hopOffset}px, 0)`;
      }

      requestAnimationFrame(animateThing);
    }

    animateThing();
  }

  // ----------------------------------------------------------
  // 4.2. PERSONA SWITCHER (WENZ / HARSHITH)
  // ----------------------------------------------------------
  const personas = {
    wenz: {
      name: 'Wenz',
      subtitle: '19 • Systems Builder & Competitive Programmer',
      avatar: 'img/about_wednesday.jpg',
      alt: 'Wednesday Addams',
      greeting: '*Wednesday approves* 🖤'
    },
    harshith: {
      name: 'Harshith Padakanti',
      subtitle: '19 • India',
      avatar: 'img/about_harshith.jpg',
      alt: 'Harshith Padakanti',
      greeting: '*Harshith!* 🖐'
    }
  };

  const profileName = document.getElementById('profile-name');
  const profileSubtitle = document.getElementById('profile-subtitle');
  const profileAvatar = document.getElementById('profile-avatar');
  const personaToggleBtn = document.getElementById('persona-toggle-btn');
  const tabWenz = document.getElementById('tab-wenz');
  const tabHarshith = document.getElementById('tab-harshith');

  let currentPersona = preferences.get('persona') || 'wenz';

  function applyPersona(personaKey, showBubble = false) {
    const p = personas[personaKey] || personas.wenz;
    currentPersona = personaKey;
    preferences.set('persona', personaKey);

    if (profileName) profileName.textContent = p.name;
    if (profileSubtitle) profileSubtitle.textContent = p.subtitle;
    if (profileAvatar) {
      profileAvatar.src = p.avatar;
      profileAvatar.alt = p.alt;
    }

    if (tabWenz && tabHarshith) {
      if (personaKey === 'wenz') {
        tabWenz.classList.add('active');
        tabWenz.setAttribute('aria-selected', 'true');
        tabHarshith.classList.remove('active');
        tabHarshith.setAttribute('aria-selected', 'false');
      } else {
        tabHarshith.classList.add('active');
        tabHarshith.setAttribute('aria-selected', 'true');
        tabWenz.classList.remove('active');
        tabWenz.setAttribute('aria-selected', 'false');
      }
    }

    if (showBubble && typeof showThingBubble === 'function') {
      showThingBubble(p.greeting, 1800);
    }
  }

  function togglePersona(showBubble = true) {
    const next = currentPersona === 'wenz' ? 'harshith' : 'wenz';
    applyPersona(next, showBubble);
  }

  if (tabWenz) {
    tabWenz.addEventListener('click', (e) => {
      e.stopPropagation();
      applyPersona('wenz', true);
    });
  }
  if (tabHarshith) {
    tabHarshith.addEventListener('click', (e) => {
      e.stopPropagation();
      applyPersona('harshith', true);
    });
  }
  if (personaToggleBtn) {
    personaToggleBtn.addEventListener('click', (e) => {
      if (e.target === personaToggleBtn) {
        togglePersona(true);
      }
    });
  }

  // Initialize persona on load
  applyPersona(currentPersona, false);

  // ----------------------------------------------------------
  // 5. IN-PLACE INTERACTIVE PROJECT DETAIL MODAL
  // ----------------------------------------------------------
  const projectsData = {
    grindlens: {
      title: 'GrindLens',
      category: 'Algorithmic Revision Engine',
      status: 'Live Production • 422 Users',
      statusType: 'live',
      img: 'img/grindlens_banner.png',
      desc: "I was solving problems every day and still didn't know what to solve next, or which patterns I was completely avoiding. So I built GrindLens to map practiced problems against avoided patterns and automate revision queueing.",
      highlights: [
        'Automated LeetCode GraphQL polling to detect accepted solutions and pattern gaps.',
        'Spaced repetition algorithm prioritizing forgotten problem patterns before interviews.',
        'Over 422 registered users and 4,180 unique visitors in production.'
      ],
      tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'GraphQL'],
      live: 'https://grindlens.dev',
      github: 'https://github.com/Harshith1702/GrindLens'
    },
    openchat: {
      title: 'RTRP Chat Rooms (Open Chat)',
      category: 'Real-Time Ephemeral Chat',
      status: 'Live Demo',
      statusType: 'live',
      img: 'img/rtrp_chat_rooms.png',
      desc: 'I wanted somewhere to talk without anyone else keeping the conversation. So I built a chat app with no database. There are no accounts or message logs. Messages only exist in memory while the room is open, and disappear completely as soon as the session ends.',
      highlights: [
        'Zero-database ephemeral architecture with memory-only room state.',
        'Room presence isolation with 100-user cap per room and debounced broadcasts.',
        'Instant media exchange and automatic room cleanup upon client disconnect.'
      ],
      tech: ['Node.js', 'Express', 'Socket.io', 'WebSockets'],
      live: 'https://open-chat-application-ubti.onrender.com',
      github: 'https://github.com/Harshith1702/Open_Chat_Application'
    },
    tracker: {
      title: 'LeetCode Grind Tracker',
      category: 'Analytical Dashboard',
      status: 'Open Source',
      statusType: 'oss',
      img: 'img/tracker_ui.png',
      desc: 'Before GrindLens became a product, it was this. A Python script fetching my LeetCode submissions, a MySQL database, a small PHP API, and a JavaScript dashboard to track streaks and weak topics. That script ran for months before I decided to turn it into a real product.',
      highlights: [
        'Python automation fetching daily submissions via LeetCode GraphQL endpoint.',
        'Relational MySQL schema tracking problem tags, difficulties, and timestamps.',
        'PHP API serving analytical stats to interactive JavaScript dashboard.'
      ],
      tech: ['Python', 'MySQL', 'PHP', 'JavaScript'],
      live: null,
      github: 'https://github.com/Harshith1702/leetcode-grind-tracker'
    },
    discord: {
      title: 'LeetCode Discord Reporter',
      category: 'Discord Automation Bot',
      status: 'Open Source',
      statusType: 'oss',
      img: 'img/discord_reporter.png',
      desc: 'I was copying my solved problem links into our daily training group every day. I got tired of doing it, so I made a bot do it. A bot that checks the LeetCode GraphQL endpoint every night at 10:15 PM IST for accepted submissions and posts them directly to our Discord server.',
      highlights: [
        'Scheduled nightly execution via GitHub Actions workflow.',
        'Queries recentAcSubmissionList from LeetCode GraphQL endpoint with IST window validation.',
        'Formats difficulty stats and fires formatted Discord webhook payloads.'
      ],
      tech: ['Python', 'GitHub Actions', 'Discord Webhooks', 'GraphQL'],
      live: null,
      github: 'https://github.com/Harshith1702/leetcode-discord-reporter'
    },
    nptel: {
      title: 'NPTEL IoT Study Dashboard',
      category: 'Interactive Study Engine',
      status: 'Open Source',
      statusType: 'oss',
      img: 'img/cathedral_submerged.jpg',
      desc: "Interactive exam and study dashboard for IIT Kharagpur's Introduction to IoT course with 724 verified questions and searchable solutions. Built to help students navigate massive question banks with instant search and self-assessment modes.",
      highlights: [
        'Fast client-side indexed search across 724 verified course questions and diagrams.',
        'Self-assessment mode with instant scoring and explanation review.',
        'Zero-dependency vanilla JavaScript, HTML5, and CSS3 architecture.'
      ],
      tech: ['JavaScript', 'HTML5', 'CSS3', 'LocalStorage'],
      live: null,
      github: 'https://github.com/Harshith1702/nptel-iot'
    },
    socialgraph: {
      title: 'Social Follower Graph (C)',
      category: 'Systems & Data Structures',
      status: 'Open Source',
      statusType: 'oss',
      img: 'img/city_inverted.jpg',
      desc: 'Low-level C simulation of a directed follower network with dynamic user creation, mutual follow tracking, and heap-allocated adjacency lists. Built to explore graph algorithms and manual memory management in systems programming.',
      highlights: [
        'Heap-allocated adjacency list representation with custom memory allocation guards.',
        'Directed graph traversal supporting mutual follower discovery and degree metrics.',
        'Valgrind-verified zero memory leaks and proper recursive deallocation.'
      ],
      tech: ['C', 'Data Structures', 'Memory Management', 'Graph Algorithms'],
      live: null,
      github: 'https://github.com/Harshith1702/Social_Media_Follower_System_C'
    },
    deadpacket: {
      title: 'Dead Packet Detective',
      category: 'Network Protocol Utility',
      status: 'Open Source',
      statusType: 'oss',
      img: 'img/bedside_3am.jpg',
      desc: 'Python network utility that captures and parses network protocol headers, inspects TCP/UDP flags, and logs flow anomalies. Inspects packets at the raw socket level for diagnostic and monitoring workflows.',
      highlights: [
        'Raw socket packet sniffing and binary protocol header unpacking.',
        'TCP flag analysis (SYN, ACK, FIN, RST) and port connection state tracking.',
        'Real-time anomaly detection logging malformed packets and burst connections.'
      ],
      tech: ['Python', 'Networking', 'Raw Sockets', 'Packet Parsing'],
      live: null,
      github: 'https://github.com/Harshith1702/dead-packet-detective'
    }
  };

  const projectModal = document.getElementById('project-detail-modal');
  const modalCloseBtn = document.getElementById('modal-project-close-btn');
  const modalImg = document.getElementById('modal-project-img');
  const modalCat = document.getElementById('modal-project-category');
  const modalTitle = document.getElementById('modal-project-title');
  const modalDesc = document.getElementById('modal-project-desc');
  const modalStatus = document.getElementById('modal-project-status');
  const modalStatusText = document.getElementById('modal-status-text');
  const modalExternalLink = document.getElementById('modal-external-link');
  const modalGithubLink = document.getElementById('modal-github-link');
  const modalHighlights = document.getElementById('modal-project-highlights');
  const modalTech = document.getElementById('modal-project-tech');
  const modalActionPrimary = document.getElementById('modal-action-primary');
  const modalActionSecondary = document.getElementById('modal-action-secondary');

  function openProjectModal(projectId) {
    const data = projectsData[projectId];
    if (!data || !projectModal) return;

    if (modalImg) {
      modalImg.src = data.img;
      modalImg.alt = data.title;
    }
    if (modalCat) modalCat.textContent = data.category;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDesc) modalDesc.textContent = data.desc;

    if (modalStatus && modalStatusText) {
      modalStatusText.textContent = data.status;
      if (data.statusType === 'live') {
        modalStatus.className = 'modal-status-pill modal-status-live';
      } else {
        modalStatus.className = 'modal-status-pill modal-status-oss';
      }
    }

    if (modalExternalLink) {
      if (data.live) {
        modalExternalLink.href = data.live;
        modalExternalLink.style.display = 'inline-flex';
      } else {
        modalExternalLink.style.display = 'none';
      }
    }

    if (modalGithubLink) {
      if (data.github) {
        modalGithubLink.href = data.github;
        modalGithubLink.style.display = 'inline-flex';
      } else {
        modalGithubLink.style.display = 'none';
      }
    }

    if (modalHighlights) {
      modalHighlights.innerHTML = data.highlights.map(h => '<li><span class="bullet" aria-hidden="true">•</span><span>' + h + '</span></li>').join('');
    }

    if (modalTech) {
      modalTech.innerHTML = data.tech.map(t => '<span class="modal-tech-pill">' + t + '</span>').join('');
    }

    if (modalActionPrimary) {
      if (data.live) {
        modalActionPrimary.href = data.live;
        modalActionPrimary.style.display = 'inline-flex';
      } else {
        modalActionPrimary.style.display = 'none';
      }
    }

    if (modalActionSecondary) {
      if (data.github) {
        modalActionSecondary.href = data.github;
        modalActionSecondary.style.display = 'inline-flex';
      } else {
        modalActionSecondary.style.display = 'none';
      }
    }

    projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (projectModal) {
      projectModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('[data-project-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      const id = card.getAttribute('data-project-id');
      openProjectModal(id);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        closeProjectModal();
      }
    });
  }

  // ----------------------------------------------------------
  // 6. COMMAND PALETTE (CMD+K)
  // ----------------------------------------------------------
  const cmdkBtn = document.getElementById('cmdk-btn');
  const cmdkModal = document.getElementById('cmdk-modal');
  const cmdkInput = document.getElementById('cmdk-input');
  const cmdkList = document.getElementById('cmdk-list');

  function openCmdk() {
    if (cmdkModal) {
      cmdkModal.classList.add('open');
      if (cmdkInput) {
        cmdkInput.value = '';
        cmdkInput.focus();
        filterCmdk('');
      }
    }
  }

  function closeCmdk() {
    if (cmdkModal) {
      cmdkModal.classList.remove('open');
    }
  }

  if (cmdkBtn) {
    cmdkBtn.addEventListener('click', openCmdk);
  }

  if (cmdkModal) {
    cmdkModal.addEventListener('click', (e) => {
      if (e.target === cmdkModal) {
        closeCmdk();
      }
    });
  }

  function filterCmdk(query) {
    if (!cmdkList) return;
    const items = cmdkList.querySelectorAll('.cmdk-item');
    const q = query.toLowerCase().trim();
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  if (cmdkInput) {
    cmdkInput.addEventListener('input', (e) => {
      filterCmdk(e.target.value);
    });
  }

  if (cmdkList) {
    cmdkList.addEventListener('click', (e) => {
      const item = e.target.closest('.cmdk-item');
      if (!item) return;
      const action = item.getAttribute('data-action');
      if (action === 'email') {
        navigator.clipboard.writeText('harshith.dev.work@gmail.com');
        item.querySelector('span').textContent = 'Email copied to clipboard!';
        setTimeout(() => {
          closeCmdk();
          item.querySelector('span').textContent = 'Copy Email Address (harshith.dev.work@gmail.com)';
        }, 800);
      } else if (action === 'theme') {
        const current = html.classList.contains('dark') ? 'dark' : 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
        closeCmdk();
      } else if (action === 'github') {
        window.open('https://github.com/Harshith1702', '_blank', 'noopener,noreferrer');
        closeCmdk();
      } else if (action === 'twitter') {
        window.open('https://x.com/harshith_irl', '_blank', 'noopener,noreferrer');
        closeCmdk();
      } else if (action === 'leetcode') {
        window.open('https://leetcode.com/u/Harshith-2007/', '_blank', 'noopener,noreferrer');
        closeCmdk();
      } else if (action === 'thing') {
        toggleThingCompanion();
        closeCmdk();
      } else if (action === 'persona') {
        togglePersona(true);
        closeCmdk();
      } else if (action === 'grindlens') {
        window.open('https://grindlens.dev', '_blank', 'noopener,noreferrer');
        closeCmdk();
      }
    });
  }

  // Keyboard Navigation: Escape and CMD+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdkModal && cmdkModal.classList.contains('open')) {
        closeCmdk();
      } else {
        openCmdk();
      }
    } else if (e.key === 'Escape') {
      if (projectModal && projectModal.classList.contains('open')) {
        closeProjectModal();
      }
      closeCmdk();
    }
  });

  // ----------------------------------------------------------
  // 7. VISITOR COUNTER
  // ----------------------------------------------------------
  const visitorCountEl = document.getElementById('visitor-count');
  if (visitorCountEl) {
    fetch('/api/visit', { method: 'POST', credentials: 'same-origin', signal: AbortSignal.timeout(8000) })
      .then(response => {
        if (!response.ok) throw new Error('Counter unavailable');
        return response.json();
      })
      .then(data => {
        if (!data.success || !Number.isSafeInteger(data.count) || data.count < 0) throw new Error('Invalid count');
        visitorCountEl.textContent = data.count.toLocaleString();
      })
      .catch(() => { visitorCountEl.textContent = 'Unavailable'; });
  }

  // ----------------------------------------------------------
  // 11. LIVE DOTO DIGITAL CLOCK
  // ----------------------------------------------------------
  function updateDigitalClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    clockEl.textContent = `${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;
  }
  setInterval(updateDigitalClock, 1000);
  updateDigitalClock();

  // ----------------------------------------------------------
  // 12. EXPERIENCE ACCORDION INTERACTION
  // ----------------------------------------------------------
  const expItems = document.querySelectorAll('.exp-accordion-item');
  expItems.forEach(item => {
    const header = item.querySelector('.exp-item-header');
    const body = item.querySelector('.exp-item-body');
    const chevron = item.querySelector('.exp-chevron');
    if (header && body) {
      header.addEventListener('click', () => {
        const isOpen = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', String(!isOpen));
        if (!isOpen) {
          body.classList.remove('grid-rows-[0fr]');
          body.classList.add('grid-rows-[1fr]');
          if (chevron) chevron.style.transform = 'translateY(-50%) rotate(180deg)';
        } else {
          body.classList.remove('grid-rows-[1fr]');
          body.classList.add('grid-rows-[0fr]');
          if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
        }
      });
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    }
  });

  // ----------------------------------------------------------
  // 13. OPEN SOURCE CONTRIBUTIONS TABS
  // ----------------------------------------------------------
  const osPrData = {
    merged: [
      {
        repo: 'RocketChat/Rocket.Chat',
        title: 'Batch merge: timestamp parsing, isNodeOfType guard tests, emoji fixes',
        pr: '#39853',
        url: 'https://github.com/RocketChat/Rocket.Chat/pull/39853',
        date: 'Apr 2026',
        status: 'merged'
      },
      {
        repo: 'RocketChat/Rocket.Chat',
        title: 'Fix timestamp parsing in markdown formatted messages',
        pr: '#39455',
        url: 'https://github.com/RocketChat/Rocket.Chat/pull/39455',
        date: 'Mar 2026',
        status: 'merged'
      },
      {
        repo: 'RocketChat/Rocket.Chat',
        title: 'Add defensive unit tests for isNodeOfType discriminators',
        pr: '#39737',
        url: 'https://github.com/RocketChat/Rocket.Chat/pull/39737',
        date: 'Apr 2026',
        status: 'merged'
      },
      {
        repo: 'RocketChat/Rocket.Chat',
        title: 'Fix emoji coverage in plain text reduction pipeline',
        pr: '#39733',
        url: 'https://github.com/RocketChat/Rocket.Chat/pull/39733',
        date: 'Apr 2026',
        status: 'merged'
      },
      {
        repo: 'NSoC 2026 Nationwide',
        title: '30+ Merged Pull Requests across open source repositories (Rank 70 / 988)',
        pr: 'NSoC',
        url: 'https://github.com/Harshith1702',
        date: '2026',
        status: 'merged'
      }
    ],
    open: [
      {
        repo: 'Harshith1702/GrindLens',
        title: 'Spaced repetition queueing engine optimization for GraphQL polling',
        pr: '#12',
        url: 'https://github.com/Harshith1702/GrindLens',
        date: 'Active',
        status: 'open'
      },
      {
        repo: 'Harshith1702/Open_Chat_Application',
        title: 'Debounced room broadcast cleanup and socket heartbeat telemetry',
        pr: '#4',
        url: 'https://github.com/Harshith1702/Open_Chat_Application',
        date: 'Active',
        status: 'open'
      }
    ],
    closed: [
      {
        repo: 'RocketChat/Rocket.Chat',
        title: 'Exploratory parser benchmark across nested markdown trees',
        pr: '#39210',
        url: 'https://github.com/RocketChat/Rocket.Chat',
        date: 'Mar 2026',
        status: 'closed'
      }
    ]
  };

  const osContainer = document.getElementById('os-pr-container');
  const osTabs = document.querySelectorAll('.os-tab-btn');
  const osGlider = document.getElementById('os-tab-glider');

  function renderOsPrs(tabKey) {
    if (!osContainer) return;
    const items = osPrData[tabKey] || [];
    if (items.length === 0) {
      osContainer.innerHTML = '<p class="py-4 text-[13px] text-zinc-500">No pull requests in this category.</p>';
      return;
    }
    osContainer.innerHTML = items.map(item => `
      <a class="os-pr-item group" href="${item.url}" target="_blank" rel="noopener noreferrer">
        <div class="flex items-start gap-3 min-w-0">
          <span class="os-status-dot-${item.status}"></span>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[12px] font-mono text-zinc-400 dark:text-zinc-500">${item.repo}</span>
              <span class="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">${item.pr}</span>
            </div>
            <p class="text-[13.5px] font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors mt-0.5 leading-snug">${item.title}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 font-mono text-[11px] text-zinc-400">
          <span>${item.date}</span>
          <span class="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
        </div>
      </a>
    `).join('');
  }

  if (osTabs && osTabs.length > 0) {
    const gliderOffsets = {
      merged: '0px',
      open: '74px',
      closed: '148px'
    };
    osTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-tab');
        osTabs.forEach(t => {
          t.classList.remove('active', 'text-zinc-900', 'dark:text-zinc-100');
          t.classList.add('text-zinc-500', 'dark:text-zinc-400');
        });
        tab.classList.add('active', 'text-zinc-900', 'dark:text-zinc-100');
        tab.classList.remove('text-zinc-500', 'dark:text-zinc-400');
        if (osGlider && gliderOffsets[key]) {
          osGlider.style.transform = `translateX(${gliderOffsets[key]})`;
        }
        renderOsPrs(key);
      });
    });
    renderOsPrs('merged');
  }

  // ----------------------------------------------------------
  // 14. FLOATING RIGHT INDEX SCROLL SPY
  // ----------------------------------------------------------
  const indexLinks = document.querySelectorAll('.nav-index-link');
  const floatingIndexTrackedSections = ['experience', 'projects', 'opensource', 'rigor', 'skills', 'highlights'];

  function updateIndexActive() {
    const scrollY = window.scrollY + 200;
    let currentId = 'experience';
    for (const id of floatingIndexTrackedSections) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop;
        if (scrollY >= top) {
          currentId = id;
        }
      }
    }
    indexLinks.forEach(link => {
      if (link.getAttribute('data-section') === currentId) {
        link.classList.add('active-index');
      } else {
        link.classList.remove('active-index');
      }
    });
  }
  window.addEventListener('scroll', updateIndexActive, { passive: true });
  updateIndexActive();

});

