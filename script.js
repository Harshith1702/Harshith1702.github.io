// ============================================================
// HARSHITH PADAKANTI - PORTFOLIO INTERACTION ENGINE
// Blueprint & Minimalist Architecture
// Zero em/en dashes. Only standard hyphens.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Preferences storage with error resilience
  const preferences = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };

  // ----------------------------------------------------------
  // 1. HERO BANNER VIDEO AUTOPLAY ASSURANCE
  // ----------------------------------------------------------
  const heroVideo = document.getElementById('hero-banner-video');
  if (heroVideo) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) heroVideo.pause(); else heroVideo.play().catch(() => {});
  }

  // ----------------------------------------------------------
  // 2. LIVE DOTO DIGITAL CLOCK (IF PRESENT)
  // ----------------------------------------------------------
  const clockEl = document.getElementById('live-clock');
  if (clockEl) {
    function updateDigitalClock() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      clockEl.textContent = `${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;
    }
    setInterval(updateDigitalClock, 1000);
    updateDigitalClock();
  }

  // ----------------------------------------------------------
  // 3. THEME TOGGLER (LIGHT DEFAULT / DARK TOGGLE)
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

  function toggleTheme(e) {
    const isDark = html.classList.contains('dark');
    const targetTheme = isDark ? 'light' : 'dark';

    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.classList.add('theme-transition');
      setTheme(targetTheme);
      window.setTimeout(() => html.classList.remove('theme-transition'), 350);
      return;
    }

    let x = window.innerWidth / 2;
    let y = 40;
    if (e && typeof e.clientX === 'number' && e.clientX > 0) {
      x = e.clientX;
      y = e.clientY;
    } else if (themeToggleBtn) {
      const rect = themeToggleBtn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(targetTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath
        },
        {
          duration: 400,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    }).catch(() => {
      setTheme(targetTheme);
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTheme(e);
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

  // Articulated finger segments from img/thing.png
  const palmPart = document.getElementById('palm-part');
  const leftFingers = document.getElementById('left-part');
  const midFinger = document.getElementById('middle-part');
  const rightFinger = document.getElementById('right-part');

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

    // Crawl motion state for authentic Thing hand
    let currentX = window.innerWidth * 0.8;
    let currentY = window.innerHeight * 0.7;
    let mouseX = currentX;
    let mouseY = currentY;
    let targetX = currentX;
    let targetY = currentY;
    let facing = 1;
    let facingScale = 1;
    let walkCycle = 0;
    let idleTicks = 0;
    let hopOffset = 0;
    let hopScale = 1;

    // Standoff gap configuration:
    // Companion tracks cursor but stays at a generous buffer (~65px)
    // so it NEVER blocks clicking buttons, links, or inputs.
    const STANDOFF_GAP = 65;

    function updateTargetFromMouse(mx, my) {
      mouseX = mx;
      mouseY = my;
      idleTicks = 0;

      // Keep companion to the side of the cursor and slightly below
      const side = (mouseX >= currentX) ? -1 : 1;
      targetX = mouseX + side * STANDOFF_GAP;
      targetY = mouseY + 24;

      // Clamp within viewport
      targetX = Math.max(25, Math.min(window.innerWidth - 45, targetX));
      targetY = Math.max(35, Math.min(window.innerHeight - 45, targetY));
    }

    // Track mouse
    window.addEventListener('mousemove', (e) => {
      updateTargetFromMouse(e.clientX, e.clientY);
    }, { passive: true });

    // Touch support for mobile/tablet
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        updateTargetFromMouse(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Click reaction: surprised hop, articulated fingers, speech bubble
    thingCompanion.addEventListener('click', (e) => {
      e.stopPropagation();
      hopOffset = -18;
      hopScale = 1.15;
      if (leftFingers) leftFingers.style.transform = 'translateY(-3px) rotate(-22deg) scaleY(1.06)';
      if (midFinger) midFinger.style.transform = 'translateY(-5px) rotate(20deg) scaleY(1.08)';
      if (rightFinger) rightFinger.style.transform = 'translateY(-3px) rotate(-18deg) scaleY(1.06)';
      if (palmPart) palmPart.style.transform = 'translateY(-4px) rotate(0deg)';
      const phrases = ['*tap tap tap*', '*scuttles*', '*handshake?*', '*scampering*', '🖐', 'Thing approves.'];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      showThingBubble(randomPhrase, 1400);
    });

    // Companion animation loop
    function animateCompanion() {
      if (!thingEnabled || !thingCompanion) {
        requestAnimationFrame(animateCompanion);
        return;
      }

      // Smooth damp hop offset and scale back to normal
      hopOffset += (0 - hopOffset) * 0.16;
      hopScale += (1 - hopScale) * 0.14;

      // Distance to actual mouse cursor
      const dxMouse = mouseX - currentX;
      const dyMouse = mouseY - currentY;
      const distToMouse = Math.hypot(dxMouse, dyMouse);

      // Distance to escort target
      const dxTarget = targetX - currentX;
      const dyTarget = targetY - currentY;
      const distTarget = Math.hypot(dxTarget, dyTarget);

      let vx = 0;
      let vy = 0;

      // 1. Escort tracking: smoothly move towards target position if beyond deadzone
      if (distTarget > 12) {
        const escortSpeed = Math.min(Math.max(distTarget * 0.032, 0.6), 3.2);
        vx += (dxTarget / distTarget) * escortSpeed;
        vy += (dyTarget / distTarget) * escortSpeed;
      }

      // 2. Active Cursor Evasion:
      // When mouse moves against Thing (< 68px), Thing actively scurries away on its fingers.
      // Evasion velocity pushes Thing away from the encroaching cursor.
      const SAFE_RADIUS = 68;
      if (distToMouse < SAFE_RADIUS) {
        const evadeStrength = ((SAFE_RADIUS - distToMouse) / SAFE_RADIUS) * 3.8 + 0.9;
        const evX = distToMouse > 0.1 ? -(dxMouse / distToMouse) : (facing * -1);
        const evY = distToMouse > 0.1 ? -(dyMouse / distToMouse) : 0;
        vx += evX * evadeStrength;
        vy += evY * evadeStrength;
      }

      // Apply movement
      currentX += vx;
      currentY += vy;

      // Viewport bounds clamping
      currentX = Math.max(22, Math.min(window.innerWidth - 45, currentX));
      currentY = Math.max(32, Math.min(window.innerHeight - 45, currentY));

      const moveSpeed = Math.hypot(vx, vy);

      // 3. Dynamic Walking vs Resting Kinematics:
      // Whenever Thing has movement velocity (seeking or evading), it physically crawls on its fingers.
      if (moveSpeed > 0.22) {
        idleTicks = 0;

        // Facing direction aligns with horizontal movement velocity:
        // When fleeing from mouse on right, vx is negative -> faces left and runs away!
        if (vx < -0.25) facing = -1;
        else if (vx > 0.25) facing = 1;
        facingScale += (facing - facingScale) * 0.22;

        // Advance walk cadence proportionally to moveSpeed
        const cadence = Math.min(Math.max(moveSpeed, 0.9), 3.8) * 0.24;
        walkCycle += cadence;
        const phi = walkCycle;
        const sinP = Math.sin(phi);
        const cosP = Math.cos(phi);

        // Articulated finger step kinematics
        let leftAngle, leftScaleY, leftTy;
        let midAngle, midScaleY, midTy;
        let rightAngle, rightScaleY, rightTy;

        if (sinP >= 0) {
          midAngle = -sinP * 18;
          midScaleY = 0.94 + 0.06 * cosP;
          midTy = 0;

          leftAngle = sinP * 22;
          leftScaleY = 0.88 + 0.12 * (1 - sinP);
          leftTy = -5.0 * sinP;

          rightAngle = Math.sin(phi + 0.25) * 18;
          rightScaleY = 0.88 + 0.12 * (1 - sinP);
          rightTy = -4.2 * sinP;
        } else {
          leftAngle = sinP * 18;
          leftScaleY = 0.94 + 0.06 * cosP;
          leftTy = 0;

          rightAngle = Math.sin(phi + 0.25) * 16;
          rightScaleY = 0.94 + 0.06 * cosP;
          rightTy = 0;

          midAngle = -sinP * 24;
          midScaleY = 0.85 + 0.15 * (1 + sinP);
          midTy = -6.0 * (-sinP);
        }

        if (leftFingers) leftFingers.style.transform = 'translateY(' + leftTy + 'px) rotate(' + leftAngle + 'deg) scaleY(' + leftScaleY + ')';
        if (midFinger) midFinger.style.transform = 'translateY(' + midTy + 'px) rotate(' + midAngle + 'deg) scaleY(' + midScaleY + ')';
        if (rightFinger) rightFinger.style.transform = 'translateY(' + rightTy + 'px) rotate(' + rightAngle + 'deg) scaleY(' + rightScaleY + ')';

        const palmBob = Math.sin(phi * 2) * 2.0;
        const palmRoll = Math.sin(phi) * 4.2;
        const wristDrag = -facing * Math.min(moveSpeed, 3.0) * 2.0;
        const palmTilt = palmRoll + wristDrag;

        if (palmPart) palmPart.style.transform = 'translateY(' + palmBob + 'px) rotate(' + palmTilt + 'deg)';

        if (thingSprite) {
          const bodyLean = facing * 3.4;
          thingSprite.style.transform = 'scaleX(' + (facingScale * hopScale) + ') scaleY(' + hopScale + ') rotate(' + bodyLean + 'deg)';
        }

        thingCompanion.style.transform = 'translate3d(' + (currentX - 18) + 'px, ' + (currentY - 36 + hopOffset) + 'px, 0)';

        if (thingShadow) {
          thingShadow.style.transform = 'scale(1.0)';
          thingShadow.style.opacity = '0.58';
        }
      } else {
        // Stationary resting state (when Thing has reached standoff spot and cursor is not encroaching)
        idleTicks++;

        // Face toward mouse cursor while resting
        if (dxMouse > 8) facing = 1;
        else if (dxMouse < -8) facing = -1;
        facingScale += (facing - facingScale) * 0.22;

        // Thing desk finger drumming
        const drumCycle = idleTicks % 190;
        if (idleTicks > 60 && drumCycle < 55) {
          const drumPhase = drumCycle * 0.35;
          const drumRight = Math.max(0, Math.sin(drumPhase - 2.4)) * -16;
          const drumMid = Math.max(0, Math.sin(drumPhase - 1.2)) * -18;
          const drumLeft = Math.max(0, Math.sin(drumPhase)) * -20;

          if (leftFingers) leftFingers.style.transform = 'translateY(' + (drumLeft * 0.15) + 'px) rotate(' + drumLeft + 'deg) scaleY(1)';
          if (midFinger) midFinger.style.transform = 'translateY(' + (drumMid * 0.15) + 'px) rotate(' + drumMid + 'deg) scaleY(1)';
          if (rightFinger) rightFinger.style.transform = 'translateY(' + (drumRight * 0.15) + 'px) rotate(' + drumRight + 'deg) scaleY(1)';

          if (palmPart) {
            palmPart.style.transform = 'translateY(' + (Math.sin(drumPhase) * 0.6) + 'px) rotate(' + (Math.sin(drumPhase) * 1.2) + 'deg)';
          }
        } else {
          const breath = Math.sin(idleTicks * 0.04) * 0.6;
          if (leftFingers) leftFingers.style.transform = 'translateY(0) rotate(0deg) scaleY(1)';
          if (midFinger) midFinger.style.transform = 'translateY(0) rotate(0deg) scaleY(1)';
          if (rightFinger) rightFinger.style.transform = 'translateY(0) rotate(0deg) scaleY(1)';
          if (palmPart) palmPart.style.transform = 'translateY(' + breath + 'px) rotate(0deg)';
        }

        if (thingSprite) {
          thingSprite.style.transform = 'scaleX(' + (facingScale * hopScale) + ') scaleY(' + hopScale + ') rotate(0deg)';
        }

        thingCompanion.style.transform = 'translate3d(' + (currentX - 18) + 'px, ' + (currentY - 36 + hopOffset) + 'px, 0)';
        if (thingShadow) {
          thingShadow.style.transform = 'scale(1)';
          thingShadow.style.opacity = '0.52';
        }
      }

      requestAnimationFrame(animateCompanion);
    }

    animateCompanion();
  }

  // ----------------------------------------------------------
  // 4.2. PERSONA SWITCHER (WENZ / HARSHITH)
  // ----------------------------------------------------------
  const personas = {
    wenz: {
      name: 'Wenz',
      subtitle: '19, Full-stack and backend developer, OSS',
      avatar: 'img/about_wednesday.jpg',
      alt: 'Wednesday Addams',
      greeting: '*Wednesday approves* 🖤',
      bio: 'I love solving problems I face and things I get curious about. Also solving others\' code through open source and other projects.'
    },
    harshith: {
      name: 'Harshith Padakanti',
      subtitle: '19, Full-stack and backend developer, OSS',
      avatar: 'img/about_harshith.jpg',
      alt: 'Harshith Padakanti',
      greeting: '*Harshith!* 🖐',
      bio: 'I love solving problems I face and things I get curious about. Also solving others\' code through open source and other projects.'
    }
  };

  const profileName = document.getElementById('profile-name');
  const profileSubtitle = document.getElementById('profile-subtitle');
  const profileBio = document.getElementById('profile-bio');
  const profileAvatar = document.getElementById('profile-avatar');
  const personaRevealBtn = document.getElementById('persona-reveal-btn');

  // Always clear stale persona so initial visit always shows Wenz with Reveal button
  try { localStorage.removeItem('persona'); } catch (e) {}
  let currentPersona = 'wenz';

  function applyPersona(personaKey, showBubble = false) {
    const p = personas[personaKey] || personas.wenz;
    currentPersona = personaKey;

    if (profileName) profileName.textContent = p.name;
    if (profileSubtitle) profileSubtitle.textContent = p.subtitle;
    if (profileBio) profileBio.textContent = p.bio;
    if (profileAvatar) {
      profileAvatar.src = p.avatar;
      profileAvatar.alt = p.alt;
    }

    if (personaRevealBtn) {
      if (personaKey === 'harshith') {
        personaRevealBtn.classList.add('revealing');
        personaRevealBtn.style.display = 'none';
      } else {
        personaRevealBtn.classList.remove('revealing');
        personaRevealBtn.style.display = '';
      }
    }

    if (showBubble) {
      if (profileName) {
        profileName.classList.remove('persona-animate-down');
        void profileName.offsetWidth;
        profileName.classList.add('persona-animate-down');
      }
      if (profileAvatar) {
        profileAvatar.classList.remove('persona-avatar-fade');
        void profileAvatar.offsetWidth;
        profileAvatar.classList.add('persona-avatar-fade');
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

  if (personaRevealBtn) {
    personaRevealBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      applyPersona('harshith', true);
    });
  }

  // Initialize persona on load: always start with Wenz and visible Reveal option
  applyPersona('wenz', false);

  // ----------------------------------------------------------
  // 5. AVATAR ZOOM LIGHTBOX
  // ----------------------------------------------------------
  const avatarZoomModal = document.getElementById('avatar-zoom-modal');
  const avatarZoomImg = document.getElementById('avatar-zoom-img');

  function openAvatarZoom() {
    if (avatarZoomModal && avatarZoomImg && profileAvatar) {
      avatarZoomImg.src = profileAvatar.src;
      avatarZoomImg.alt = profileAvatar.alt || 'Expanded avatar';
      avatarZoomModal.classList.add('open');
      avatarZoomModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeAvatarZoom() {
    if (avatarZoomModal) {
      avatarZoomModal.classList.remove('open');
      avatarZoomModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (profileAvatar) {
    profileAvatar.addEventListener('click', openAvatarZoom);
    profileAvatar.tabIndex = 0;
    profileAvatar.setAttribute('role', 'button');
    profileAvatar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAvatarZoom();
      }
    });
  }

  if (avatarZoomModal) {
    avatarZoomModal.addEventListener('click', closeAvatarZoom);
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

  function visibleCmdkItems() {
    return cmdkList ? Array.from(cmdkList.querySelectorAll('.cmdk-item')).filter(item => item.style.display !== 'none') : [];
  }

  function selectCmdkItem(index) {
    if (!cmdkList) return;
    const items = visibleCmdkItems();
    cmdkList.querySelectorAll('.cmdk-item').forEach(item => item.setAttribute('aria-selected', 'false'));
    if (!items.length) return;
    const next = items[(index + items.length) % items.length];
    next.setAttribute('aria-selected', 'true');
    next.scrollIntoView({ block: 'nearest' });
  }

  function filterCmdk(query) {
    if (!cmdkList) return;
    const q = query.toLowerCase().trim();
    cmdkList.querySelectorAll('.cmdk-item').forEach(item => {
      item.setAttribute('role', 'option');
      item.style.display = (!q || item.textContent.toLowerCase().includes(q)) ? 'flex' : 'none';
    });
    let empty = cmdkList.querySelector('.cmdk-empty');
    const none = visibleCmdkItems().length === 0;
    if (none && !empty) {
      empty = document.createElement('div');
      empty.className = 'cmdk-empty';
      empty.textContent = 'No matching commands';
      cmdkList.appendChild(empty);
    } else if (!none && empty) {
      empty.remove();
    }
    selectCmdkItem(0);
  }

  if (cmdkInput) {
    cmdkInput.addEventListener('input', (e) => {
      filterCmdk(e.target.value);
    });
    cmdkInput.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
      e.preventDefault();
      const items = visibleCmdkItems();
      const current = items.findIndex(item => item.getAttribute('aria-selected') === 'true');
      if (e.key === 'Enter') {
        if (items[current]) items[current].click();
        return;
      }
      selectCmdkItem(current + (e.key === 'ArrowDown' ? 1 : -1));
    });
  }

  if (cmdkList) {
    cmdkList.addEventListener('click', (e) => {
      const item = e.target.closest('.cmdk-item');
      if (!item) return;
      const action = item.getAttribute('data-action');
      if (action === 'nav-home') {
        const homeEl = document.getElementById('about');
        if (homeEl) {
          homeEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = '#about';
        }
        closeCmdk();
      } else if (action === 'nav-projects') {
        const projEl = document.getElementById('projects');
        if (projEl) {
          projEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = '#projects';
        }
        closeCmdk();
      } else if (action === 'email') {
        const address = 'harshith.dev.work@gmail.com';
        (navigator.clipboard ? navigator.clipboard.writeText(address) : Promise.reject()).catch(() => { window.location.href = 'mailto:' + address; });
        const span = item.querySelector('span');
        if (span) span.textContent = 'Email copied to clipboard!';
        setTimeout(() => {
          closeCmdk();
          if (span) span.textContent = 'Copy Email Address (harshith.dev.work@gmail.com)';
        }, 800);
      } else if (action === 'theme') {
        toggleTheme();
        closeCmdk();
      } else if (action === 'llms') {
        window.open('llms.txt', '_blank');
        closeCmdk();
      } else if (action === 'thing') {
        toggleThingCompanion();
        closeCmdk();
      } else if (action === 'persona') {
        togglePersona(true);
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
      closeCmdk();
      closeAvatarZoom();
    }
  });

  // ----------------------------------------------------------
  // 7. VISITOR COUNTER
  // ----------------------------------------------------------
  const discordBtn = document.getElementById('discord-btn');
  if (discordBtn) {
    // A listener, not an inline onclick: the CSP (script-src 'self') blocks inline handlers
    discordBtn.addEventListener('click', () => {
      const label = discordBtn.querySelector('span');
      const handle = 'harshith_padakanti';
      (navigator.clipboard ? navigator.clipboard.writeText(handle) : Promise.reject()).then(
        () => { if (label) label.textContent = 'Copied!'; },
        () => { if (label) label.textContent = handle; }
      );
      setTimeout(() => { if (label) label.textContent = 'Discord'; }, 1400);
    });
  }

  const visitorCountEl = document.getElementById('visitor-count');
  const counterHost = !/(?:github\.io|vercel\.app)$/.test(location.hostname);
  if (visitorCountEl && counterHost) {
    fetch('/api/visit', { method: 'POST', credentials: 'same-origin', signal: AbortSignal.timeout(8000) })
      .then(response => {
        if (!response.ok) throw new Error('Counter unavailable');
        return response.json();
      })
      .then(data => {
        if (!data.success || !Number.isSafeInteger(data.count) || data.count < 0) throw new Error('Invalid count');
        visitorCountEl.textContent = data.count.toLocaleString();
        const visitorWrap = document.getElementById('visitor-counter');
        if (visitorWrap) visitorWrap.hidden = false;
      })
      .catch(() => {});
  }

  // ----------------------------------------------------------
  // 8. EXPERIENCE ACCORDION INTERACTION (Default All Collapsed)
  // ----------------------------------------------------------
  const expItems = document.querySelectorAll('.exp-accordion-item');
  expItems.forEach(item => {
    const header = item.querySelector('.exp-item-header');
    const body = item.querySelector('.exp-item-body');
    const chevron = item.querySelector('.exp-chevron');
    if (header && body) {
      body.inert = true;
      header.addEventListener('click', () => {
        const isOpen = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', String(!isOpen));
        body.inert = isOpen;
        if (!isOpen) {
          body.classList.remove('grid-rows-[0fr]');
          body.classList.add('grid-rows-[1fr]');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        } else {
          body.classList.remove('grid-rows-[1fr]');
          body.classList.add('grid-rows-[0fr]');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
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
  // 9. GITHUB 53-WEEK CONTRIBUTION CALENDAR (Monochrome)
  // Fixed snapshot of the owner's GitHub contributions, pinned to its real dates.
  // ----------------------------------------------------------
  const calendarGrid = document.getElementById('gh-calendar-grid');
  const calendarTooltip = document.getElementById('gh-calendar-tooltip');
  const ghTotalCount = document.getElementById('gh-total-count');
  const ghDateRange = document.getElementById('gh-date-range');
  const ghMonthsHeader = document.getElementById('gh-months-header');

  if (calendarGrid) {
    // 371 consecutive days from authentic Harshith1702 GitHub contributions
    const initialContributions = [
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,13,17,19,0,0,0,0,8,2,7,0,10,6,0,15,44,23,30,18,13,11,5,0,0,0,0,0,0,0,1,0,0,0,0,0,0,13,7,6,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,16,0,26,12,9,4,12,8,4,10,4,2,3,8,9,6,8,37,24,9,7,20,8,14,46,9,10,4,9,11,12,23,19,4,1,2,2,15,13,3,3,1,4,1,3,3,2,2,3,2,5,18,8,3,2,1,5,3,9,9,7,3,8,6,7,9,8,4,4,0,3,2,6,20,19,19,13,4,18,7,13,7,5,1,5,13,12,8,2,9,13,9,21,3,7,5,3,4,16,9,14,10,3,5,0,3,4,3,11,2,2,1,1,1,4,3,2,3,4,3,2,2,9,1,2,0,1,2,2,6,2,2,2,2,2,2,3,0,1,2,1,0,12,0,3,2,2,2,2,0,3,3,1,1,0,2,0,3,3,1,1,2,0,1,5,1,0,2,0,0,0,9,10,3,16,0,4,1,0,8,5,5,0,10,3,1,4,3,5,4,17,2,3,2,0,3,5,3,6,11,3,1,11,2,0,0,0,2,0,3,0,2,1,6,5,6,4,15,3,3,4,3,3,0,0,2,0,3,2,0,4,2,0,16,0,0,0,0,26,15,6,31,9,0,0,0,0,0,1
    ];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // The counts above start on Monday, October 20, 2025 and end on Sunday,
    // October 25, 2026. The dates are pinned to that range so every count lands
    // on its real day. A window computed from today shifts them by weeks.
    const startDate = new Date(2025, 9, 20);
    const snapshotEnd = new Date(2026, 9, 25);
    const todayIndex = initialContributions.length - 1;

    // Update dynamic date range string
    const dateOpts = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedStart = startDate.toLocaleDateString('en-US', dateOpts);
    const formattedEnd = snapshotEnd.toLocaleDateString('en-US', dateOpts);
    if (ghDateRange) {
      ghDateRange.textContent = `${formattedStart} - ${formattedEnd}`;
    }

    // Month labels sit over the first week column of each month
    if (ghMonthsHeader) {
      ghMonthsHeader.style.position = 'relative';
      ghMonthsHeader.style.height = '14px';
      let labels = '';
      let lastMonth = -1;
      for (let c = 0; c < 53; c++) {
        const monday = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + c * 7);
        if (monday.getMonth() !== lastMonth) {
          lastMonth = monday.getMonth();
          labels += `<span style="position:absolute;left:${(c / 53 * 100).toFixed(2)}%">${monthNames[lastMonth]}</span>`;
        }
      }
      ghMonthsHeader.innerHTML = labels;
    }

    function getLevel(cnt) {
      if (cnt <= 0) return 0;
      if (cnt <= 3) return 1;
      if (cnt <= 6) return 2;
      if (cnt <= 9) return 3;
      return 4;
    }

    function renderCalendar() {
      let calendarHtml = '';
      let totalContributions = 0;

      for (let c = 0; c < 53; c++) {
        calendarHtml += '<div class="gh-col">';
        for (let r = 0; r < 7; r++) {
          const idx = c * 7 + r;
          const cellDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + idx);
          const isFuture = idx > todayIndex;

          let cnt = 0;
          if (!isFuture) {
            cnt = idx < initialContributions.length ? initialContributions[idx] : 0;
            totalContributions += cnt;
          }

          const y = cellDate.getFullYear();
          const m = String(cellDate.getMonth() + 1).padStart(2, '0');
          const d = String(cellDate.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;
          const lvl = isFuture ? 0 : getLevel(cnt);
          const futureAttr = isFuture ? ' data-future="true"' : '';

          calendarHtml += `<div class="gh-cell" data-level="${lvl}" data-count="${cnt}" data-date="${dateStr}"${futureAttr}></div>`;
        }
        calendarHtml += '</div>';
      }

      calendarGrid.innerHTML = calendarHtml;
      calendarGrid.setAttribute('aria-label', `GitHub contribution snapshot: ${formattedStart} through ${formattedEnd}`);
      if (ghTotalCount) {
        ghTotalCount.textContent = totalContributions.toLocaleString();
      }
      setupCalendarTooltips();
    }

    function setupCalendarTooltips() {
      if (!calendarTooltip) return;
      const cells = calendarGrid.querySelectorAll('.gh-cell');

      cells.forEach(cell => {
        function showTooltip(e) {
          if (cell.getAttribute('data-future') === 'true') {
            calendarTooltip.classList.remove('visible');
            return;
          }
          const count = parseInt(cell.getAttribute('data-count') || '0', 10);
          const dateStr = cell.getAttribute('data-date') || '';
          if (!dateStr) return;
          const parts = dateStr.split('-');
          const month = monthNames[parseInt(parts[1], 10) - 1];
          const day = parseInt(parts[2], 10);
          const year = parts[0];
          const dateFormatted = `${month} ${day}, ${year}`;

          let message = `${count} contribution${count === 1 ? '' : 's'} on ${dateFormatted}`;
          if (count === 0) {
            message = `No contributions on ${dateFormatted}`;
          }

          calendarTooltip.textContent = message;
          const rect = cell.getBoundingClientRect();
          calendarTooltip.style.left = `${rect.left + rect.width / 2}px`;
          calendarTooltip.style.top = `${rect.top}px`;
          calendarTooltip.classList.add('visible');
        }

        function hideTooltip() {
          calendarTooltip.classList.remove('visible');
        }

        cell.addEventListener('mouseenter', showTooltip);
        cell.addEventListener('mousemove', showTooltip);
        cell.addEventListener('mouseleave', hideTooltip);
        cell.addEventListener('focus', showTooltip);
        cell.addEventListener('blur', hideTooltip);
      });
    }

    renderCalendar();
  }

  // ----------------------------------------------------------
  // 10. OPEN SOURCE CONTRIBUTIONS
  // ----------------------------------------------------------
  // ----------------------------------------------------------
  // 11. FLOATING RIGHT INDEX SCROLL SPY
  // ----------------------------------------------------------
  const indexLinks = document.querySelectorAll('.nav-index-link');
  const floatingIndexTrackedSections = ['about', 'experience', 'projects', 'activity', 'competitive', 'education', 'opensource', 'skills', 'playlist'];

  function updateIndexActive() {
    const scrollY = window.scrollY + 200;
    let currentId = 'about';
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

