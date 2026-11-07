// ============================================================
// reveal-fx.js
// 1. Theme switch: eclipse to dark, blinds to light
// 2. Reveal button: a full-screen red storm with rain, embers, lightning,
//    thunder and a Lichtenberg figure that the strike burns in and grows live.
//    The persona flips inside the strike.
// Loaded after script.js. Nothing here touches the Thing companion.
// Zero em dashes.
// ============================================================

(function () {
  'use strict';

  const html = document.documentElement;
  const byId = (id) => document.getElementById(id);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = () => window.matchMedia('(min-width: 320px)').matches;

  // ----------------------------------------------------------
  // 1. THEME SWITCH
  // ----------------------------------------------------------
  function setTheme(theme) {
    html.classList.toggle('dark', theme === 'dark');
    html.classList.toggle('light', theme !== 'dark');
    html.style.colorScheme = theme;
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }

  function spinIcon(btn) {
    if (!btn) return;
    btn.classList.remove('fx-spin');
    void btn.offsetWidth;
    btn.classList.add('fx-spin');
    setTimeout(() => btn.classList.remove('fx-spin'), 700);
  }

  let switching = false;
  let replaying = false;

  function toggleTheme() {
    if (switching) return;
    const next = html.classList.contains('dark') ? 'light' : 'dark';
    const btn = byId('theme-toggle-btn');
    spinIcon(btn);

    if (!document.startViewTransition || reduced()) {
      html.classList.add('theme-transition');
      setTheme(next);
      setTimeout(() => html.classList.remove('theme-transition'), 350);
      return;
    }

    const rect = btn ? btn.getBoundingClientRect() : { left: innerWidth - 40, top: 40, width: 0, height: 0 };
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    switching = true;
    html.style.setProperty('--fx-x', x + 'px');
    html.style.setProperty('--fx-y', y + 'px');
    html.style.setProperty('--fx-max', (reach + 80) + 'px');
    html.classList.add(next === 'dark' ? 'fx-to-dark' : 'fx-to-light');

    const transition = document.startViewTransition(() => setTheme(next));
    transition.finished
      .catch(() => {})
      .then(() => {
        html.classList.remove('fx-to-dark', 'fx-to-light');
        html.style.removeProperty('--fx-x');
        html.style.removeProperty('--fx-y');
        html.style.removeProperty('--fx-max');
        switching = false;
      });
  }

  // ----------------------------------------------------------
  // 2. THUNDER (Web Audio, no files)
  // Built from the layers real thunder has, following the model in
  // "Advances in Thunder Sound Synthesis" (arXiv 2204.08026):
  //   crack       a few band-passed noise claps, bright and clipped
  //   afterimage  a softer, darker echo that arrives late
  //   rumble      two low-passed noise sources with random swells
  //   deepener    a sub tone for body
  // Every filter sweeps downward, so highs die first and only the
  // low end is left. Distance is a delay plus less top end.
  // ----------------------------------------------------------
  let audioCtx = null;

  function getAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function noiseBuffer(c, seconds, brown) {
    const buffer = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        data[i] = white;
      }
    }
    return buffer;
  }

  function reverbImpulse(c, seconds) {
    const length = Math.floor(c.sampleRate * seconds);
    const buffer = c.createBuffer(2, length, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
      }
    }
    return buffer;
  }

  // Quick rise, then a decay broken up by random swells. This makes the
  // roll sound like it bounces off hills instead of fading evenly.
  function swellCurve(points, peak) {
    const curve = new Float32Array(points);
    const rate = 6 + Math.random() * 7;
    const phase = Math.random() * 6;
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      const body = t < 0.07 ? t / 0.07 : Math.pow(1 - (t - 0.07) / 0.93, 1.5);
      const swell = 0.58 + 0.42 * Math.sin(t * rate + phase);
      curve[i] = Math.max(0, peak * body * swell);
    }
    curve[points - 1] = 0;
    return curve;
  }

  function lowRumble(c, out, at, duration, peak, cutoff) {
    [[1, 1], [0.55, 0.7]].forEach(([scale, level]) => {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c, duration + 1, true);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(cutoff * scale, at);
      lp.frequency.exponentialRampToValueAtTime(Math.max(cutoff * scale * 0.18, 30), at + duration);
      const gain = c.createGain();
      gain.gain.setValueCurveAtTime(swellCurve(72, peak * level), at, duration);
      src.connect(lp);
      lp.connect(gain);
      gain.connect(out);
      src.start(at, Math.random() * 0.8);
      src.stop(at + duration + 0.2);
    });
  }

  function deepener(c, out, at, duration, peak) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(52, at);
    osc.frequency.exponentialRampToValueAtTime(24, at + duration);
    const gain = c.createGain();
    gain.gain.setValueCurveAtTime(swellCurve(48, peak), at, duration);
    osc.connect(gain);
    gain.connect(out);
    osc.start(at);
    osc.stop(at + duration + 0.1);
  }

  // One clap: noise through a band-pass that sweeps from bright to dull.
  // No distortion stage and a soft attack, so it reads as far thunder, not a click.
  function clap(c, out, at, power, topHz, length) {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, length + 0.1, false);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(topHz, at);
    bp.frequency.exponentialRampToValueAtTime(160, at + length);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(power, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    src.connect(bp);
    bp.connect(gain);
    gain.connect(out);
    src.start(at);
    src.stop(at + length + 0.1);
  }

  function crack(c, out, at, power) {
    clap(c, out, at, power, 1700, 0.42);
    clap(c, out, at + 0.05 + Math.random() * 0.05, power * 0.7, 1200, 0.4);
    clap(c, out, at + 0.15 + Math.random() * 0.08, power * 0.45, 800, 0.5);
  }

  // Late, softer echo off something far away
  function afterimage(c, out, at, power) {
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    lp.connect(out);
    clap(c, lp, at, power, 700, 0.6);
  }

  function playThunder() {
    const c = getAudio();
    if (!c) return null;

    const master = c.createGain();
    master.gain.value = 0.7;
    const tone = c.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 5200;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 5;
    const verb = c.createConvolver();
    verb.buffer = reverbImpulse(c, 2.6);
    const wet = c.createGain();
    wet.gain.value = 0.32;
    master.connect(tone);
    tone.connect(comp);
    tone.connect(verb);
    verb.connect(wet);
    wet.connect(comp);
    comp.connect(c.destination);

    // Times match the visual timeline below. Sound always lags the light.
    const t0 = c.currentTime + 0.05;
    lowRumble(c, master, t0, 2.6, 0.22, 150);               // clouds rolling in
    lowRumble(c, master, t0 + 0.9, 3.2, 0.4, 170);          // far flash, long delay
    deepener(c, master, t0 + 0.9, 3.0, 0.25);
    crack(c, master, t0 + 1.37, 0.55);                      // main strike
    afterimage(c, master, t0 + 1.9, 0.3);
    lowRumble(c, master, t0 + 1.4, 5.6, 1.3, 420);          // main roll
    deepener(c, master, t0 + 1.37, 5.0, 0.85);
    lowRumble(c, master, t0 + 6.0, 3.4, 0.45, 180);         // parting thunder
    deepener(c, master, t0 + 6.0, 3.0, 0.3);

    // Rain on a roof: a soft hiss under everything, in early, gone before the end
    const rain = c.createBufferSource();
    rain.buffer = noiseBuffer(c, 9, false);
    const rainHp = c.createBiquadFilter();
    rainHp.type = 'highpass';
    rainHp.frequency.value = 800;
    const rainLp = c.createBiquadFilter();
    rainLp.type = 'lowpass';
    rainLp.frequency.value = 4800;
    const rainGain = c.createGain();
    rainGain.gain.setValueAtTime(0.0001, t0);
    rainGain.gain.linearRampToValueAtTime(0.045, t0 + 1.2);
    rainGain.gain.setValueAtTime(0.045, t0 + 6.4);
    rainGain.gain.linearRampToValueAtTime(0, t0 + 8.6);
    rain.connect(rainHp);
    rainHp.connect(rainLp);
    rainLp.connect(rainGain);
    rainGain.connect(master);
    rain.start(t0);
    rain.stop(t0 + 9);

    // Sizzle: tiny electric pops that follow the discharge while it grows
    const popLength = Math.floor(c.sampleRate * 0.014);
    const popBuffer = c.createBuffer(1, popLength, c.sampleRate);
    const popData = popBuffer.getChannelData(0);
    for (let i = 0; i < popLength; i++) popData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / popLength, 3);
    const sizzleHp = c.createBiquadFilter();
    sizzleHp.type = 'highpass';
    sizzleHp.frequency.value = 1800;
    sizzleHp.connect(master);

    return {
      crackle(n) {
        const pops = Math.min(4, 1 + (n >> 3));
        const now = c.currentTime;
        for (let i = 0; i < pops; i++) {
          const src = c.createBufferSource();
          src.buffer = popBuffer;
          src.playbackRate.value = 0.7 + Math.random() * 1.6;
          const g = c.createGain();
          g.gain.value = 0.03 + Math.random() * 0.08;
          src.connect(g);
          g.connect(sizzleHp);
          src.start(now + Math.random() * 0.016);
        }
      },
      fade() {
        const now = c.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0, now + 0.4);
      }
    };
  }

  // ----------------------------------------------------------
  // 3. REVEAL SCENE
  // ----------------------------------------------------------
  // ----------------------------------------------------------
  // LICHTENBERG FIGURE
  // The fern-shaped burn real lightning leaves on grass, skin and wood.
  // Grown with the dielectric breakdown model (Niemeyer, Pietronero and
  // Wiesmann, 1984): solve Laplace's equation for the potential, then let
  // the discharge extend into a neighbouring cell with probability
  // proportional to potential squared. The strike bolt is the trunk.
  // The ground is the sides and the bottom, the sky stays open.
  // ----------------------------------------------------------
  const CELL = 4;        // css px per grid cell
  const COOL = 1700;     // ms from white-hot to settled
  const PAD = 20;        // cells of ground kept off screen (sides and bottom), so it never outlines the page

  // white-hot, ember, dried blood
  const HEAT = (() => {
    const stops = [[0, 255, 246, 240], [0.16, 255, 132, 104], [0.5, 218, 40, 40], [1, 122, 18, 26]];
    const out = new Uint8ClampedArray(65 * 3);
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      let k = 0;
      while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
      const a = stops[k];
      const b = stops[k + 1];
      const u = Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])));
      for (let c = 0; c < 3; c++) out[i * 3 + c] = a[c + 1] + (b[c + 1] - a[c + 1]) * u;
    }
    return out;
  })();

  function createFigure(canvas, w, h) {
    const cols = Math.floor(w / CELL) + PAD * 2;
    const rows = Math.floor(h / CELL) + PAD;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const img = ctx.createImageData(cols, rows);
    const px = img.data;
    const phi = new Float32Array(cols * rows);
    const frozen = new Uint8Array(cols * rows);
    const queued = new Uint8Array(cols * rows);
    const order = [];
    const born = [];
    let cand = [];
    let cum = new Float64Array(256);
    let cool = 0;

    // Start with a plain ramp from sky to ground so relaxing converges fast
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) phi[y * cols + x] = 0.1 + 0.9 * (y / (rows - 1));
    }
    for (let y = 0; y < rows; y++) { phi[y * cols] = 1; phi[y * cols + cols - 1] = 1; }
    for (let x = 0; x < cols; x++) phi[(rows - 1) * cols + x] = 1;

    function relax(sweeps) {
      const omega = 1.6;
      for (let s = 0; s < sweeps; s++) {
        for (let x = 1; x < cols - 1; x++) if (!frozen[x]) phi[x] = phi[x + cols];
        for (let y = 1; y < rows - 1; y++) {
          let i = y * cols + 1;
          for (let x = 1; x < cols - 1; x++, i++) {
            if (frozen[i]) continue;
            const avg = (phi[i - 1] + phi[i + 1] + phi[i - cols] + phi[i + cols]) * 0.25;
            phi[i] += omega * (avg - phi[i]);
          }
        }
      }
    }

    function freeze(i, now) {
      if (frozen[i]) return;
      frozen[i] = 1;
      phi[i] = 0;
      order.push(i);
      born.push(now);
      const x = i % cols;
      const y = (i / cols) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < PAD || nx > cols - 1 - PAD || ny < 0 || ny > rows - 1 - PAD) continue;
          const j = ny * cols + nx;
          if (!frozen[j] && !queued[j]) { queued[j] = 1; cand.push(j); }
        }
      }
    }

    // The bolt, rasterised, becomes the first frozen cells
    function seed(spine, now) {
      for (let s = 1; s < spine.length; s++) {
        const a = spine[s - 1];
        const b = spine[s];
        const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (CELL * 0.5)));
        for (let k = 0; k <= steps; k++) {
          const t = k / steps;
          const gx = PAD + Math.round((a[0] + (b[0] - a[0]) * t) / CELL);
          const gy = Math.round((a[1] + (b[1] - a[1]) * t) / CELL);
          if (gx < PAD || gx > cols - 1 - PAD || gy < 0 || gy > rows - 1 - PAD) continue;
          freeze(gy * cols + gx, now);
        }
      }
    }

    function grow(count, now) {
      let m = 0;
      for (let k = 0; k < cand.length; k++) if (!frozen[cand[k]]) cand[m++] = cand[k];
      cand.length = m;
      if (!m) return;
      if (cum.length < m) cum = new Float64Array(m * 2);
      let total = 0;
      for (let k = 0; k < m; k++) {
        const p = phi[cand[k]];
        total += p * p;
        cum[k] = total;
      }
      if (total <= 0) return;
      for (let c = 0; c < count; c++) {
        const r = Math.random() * total;
        let lo = 0;
        let hi = m - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (cum[mid] < r) lo = mid + 1; else hi = mid;
        }
        freeze(cand[lo], now);
      }
    }

    function put(i, step) {
      const o = i * 4;
      const k = step * 3;
      px[o] = HEAT[k];
      px[o + 1] = HEAT[k + 1];
      px[o + 2] = HEAT[k + 2];
      px[o + 3] = 255 - step * 0.8;
    }

    function paint(now) {
      while (cool < order.length && now - born[cool] >= COOL) { put(order[cool], 64); cool++; }
      for (let k = cool; k < order.length; k++) put(order[k], Math.min(64, ((now - born[k]) / COOL * 64) | 0));
      ctx.putImageData(img, 0, 0);
    }

    return {
      strike(spine, now) { seed(spine, now); relax(70); paint(now); },
      step(now, count) { relax(8); grow(count, now); paint(now); },
      cols,
      rows,
      offset: PAD * CELL
    };
  }

  // Dark red clouds, built from displaced ellipses so they stay vector
  const CLOUDS = `
    <svg class="fx-clouds" viewBox="0 0 480 300" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <filter id="fx-cloud-f" x="-20%" y="-30%" width="140%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.02" numOctaves="4" seed="7" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="64" xChannelSelector="R" yChannelSelector="G"/>
          <feGaussianBlur stdDeviation="5"/>
        </filter>
      </defs>
      <g filter="url(#fx-cloud-f)">
        <g class="fx-c-back" fill="#5c1a1f">
          <ellipse cx="80" cy="60" rx="120" ry="46"/>
          <ellipse cx="220" cy="42" rx="140" ry="52"/>
          <ellipse cx="350" cy="70" rx="130" ry="50"/>
          <ellipse cx="450" cy="44" rx="100" ry="44"/>
        </g>
        <g class="fx-c-mid" fill="#38100f">
          <ellipse cx="40" cy="96" rx="110" ry="50"/>
          <ellipse cx="170" cy="104" rx="150" ry="58"/>
          <ellipse cx="320" cy="112" rx="140" ry="54"/>
          <ellipse cx="440" cy="102" rx="110" ry="48"/>
        </g>
        <g class="fx-c-front" fill="#1a0708">
          <ellipse cx="100" cy="134" rx="140" ry="50"/>
          <ellipse cx="260" cy="144" rx="160" ry="56"/>
          <ellipse cx="400" cy="134" rx="120" ry="48"/>
        </g>
      </g>
    </svg>`;

  // Embers drifting up through the rain
  function buildEmbers(w, h) {
    let out = '';
    const count = Math.min(120, Math.round(w / 11));
    for (let i = 0; i < count; i++) {
      const r = 0.7 + Math.random() * 2.1;
      const x = w * (0.05 + Math.random() * 0.9);
      const y = h * (0.4 + Math.random() * 0.58);
      const dx = 10 + Math.random() * 90;
      const dy = -(60 + Math.random() * 260);
      const delay = 1000 + Math.random() * 3200;
      const time = 2200 + Math.random() * 2800;
      out += '<circle class="fx-fly" cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + r.toFixed(1) +
        '" style="--dx:' + dx.toFixed(0) + 'px;--dy:' + dy.toFixed(0) + 'px;--d:' + delay.toFixed(0) + 'ms;--t:' + time.toFixed(0) + 'ms"/>';
    }
    return out;
  }

  // Slanted rain on a canvas
  function startRain(canvas, state) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    const drops = [];
    const total = Math.min(420, Math.round(canvas.clientWidth / 3));
    for (let i = 0; i < total; i++) {
      drops.push({ x: Math.random(), y: Math.random(), len: 14 + Math.random() * 26, v: 0.8 + Math.random() * 0.9 });
    }
    (function frame() {
      if (state.done) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255, 205, 200, 0.3)';
      ctx.lineWidth = dpr;
      ctx.beginPath();
      for (const d of drops) {
        const x = d.x * canvas.width;
        const y = d.y * canvas.height;
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5 * dpr, y + d.len * dpr);
        d.y += d.v * 0.022;
        d.x -= d.v * 0.003;
        if (d.y > 1) { d.y = -0.05; d.x = Math.random() + 0.1; }
      }
      ctx.stroke();
      requestAnimationFrame(frame);
    })();
  }

  let storm = null;
  let flash = null;
  let hero = null;
  let bolt = null;
  let thunder = null;
  let rainState = null;
  let figure = null;
  let figureRaf = 0;
  let timers = [];

  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  // Jagged line by midpoint displacement
  function boltPoints(x0, y0, x1, y1, jitter, depth) {
    let pts = [[x0, y0], [x1, y1]];
    for (let i = 0; i < depth; i++) {
      const next = [pts[0]];
      for (let j = 1; j < pts.length; j++) {
        const a = pts[j - 1];
        const b = pts[j];
        next.push([(a[0] + b[0]) / 2 + (Math.random() - 0.5) * jitter, (a[1] + b[1]) / 2], b);
      }
      pts = next;
      jitter *= 0.55;
    }
    return pts;
  }

  const toPath = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');

  function buildBolt(w, h) {
    const main = boltPoints(w * 0.5, 0, w * 0.43, h * 0.78, h * 0.2, 6);
    const fork = main[Math.floor(main.length * 0.42)];
    const branch = boltPoints(fork[0], fork[1], fork[0] - h * 0.12, fork[1] + h * 0.2, h * 0.1, 4);
    const d = toPath(main);
    return {
      spine: main,
      markup:
        '<path class="halo" pathLength="1" d="' + d + '"/>' +
        '<path class="core" pathLength="1" d="' + d + '"/>' +
        '<path class="branch" pathLength="1" d="' + toPath(branch) + '"/>'
    };
  }

  function pulse(el, cls) {
    if (!el) return;
    el.classList.remove('go-soft', 'go-main');
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function lit(ms) {
    if (!storm) return;
    storm.classList.add('is-lit');
    setTimeout(() => storm && storm.classList.remove('is-lit'), ms);
  }

  // The strike lands: the bolt becomes the trunk and the discharge branches out of it
  function burnFigure(spine) {
    const fig = figure;
    if (!fig) return;
    const t0 = performance.now();
    let prev = t0;
    fig.strike(spine, 0);
    (function frame(t) {
      if (figure !== fig) return;
      const dt = Math.min(50, t - prev);
      prev = t;
      const n = Math.max(1, Math.round(dt * 2.8));
      fig.step(t - t0, n);
      if (thunder) thunder.crackle(n);
      figureRaf = requestAnimationFrame(frame);
    })(t0);
  }

  function stopFigure() {
    figure = null;
    cancelAnimationFrame(figureRaf);
  }

  function startScene() {
    if (storm || reduced()) {
      if (!storm) thunder = playThunder();
      return;
    }
    thunder = playThunder();
    if (!wide()) return;

    const strip = innerWidth;
    const bz = buildBolt(strip, innerHeight);

    flash = document.createElement('div');
    flash.className = 'fx-flash';
    flash.setAttribute('aria-hidden', 'true');

    storm = document.createElement('div');
    storm.className = 'fx-storm';
    storm.setAttribute('aria-hidden', 'true');
    storm.innerHTML =
      '<div class="fx-veil"></div>' +
      CLOUDS +
      '<div class="fx-hero"><canvas class="fx-fern"></canvas></div>' +
      '<div class="fx-glow"></div>' +
      '<canvas class="fx-rain"></canvas>' +
      '<svg class="fx-grain" aria-hidden="true"><filter id="fx-grain-f"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#fx-grain-f)"/></svg>' +
      '<svg class="fx-air" viewBox="0 0 ' + strip + ' ' + innerHeight + '">' + buildEmbers(strip, innerHeight) + '</svg>' +
      '<svg class="fx-bolt" viewBox="0 0 ' + strip + ' ' + innerHeight + '">' + bz.markup + '</svg>';

    document.body.append(storm, flash);
    document.documentElement.classList.add('fx-storm-active');
    document.body.classList.add('fx-storm-active');
    hero = storm.querySelector('.fx-hero');
    bolt = storm.querySelector('.fx-bolt');

    // The grid reaches past the strip so the ground stays off screen
    const fern = hero.querySelector('.fx-fern');
    figure = createFigure(fern, strip, innerHeight);
    if (figure) {
      fern.style.width = (figure.cols * CELL) + 'px';
      fern.style.height = (figure.rows * CELL) + 'px';
      fern.style.left = (-figure.offset) + 'px';
    }

    rainState = { done: false };
    startRain(storm.querySelector('.fx-rain'), rainState);

    // Next frame so the opacity and cloud transitions run
    requestAnimationFrame(() => requestAnimationFrame(() => storm && storm.classList.add('on')));

    at(550, () => { pulse(flash, 'go-soft'); lit(120); });             // far flash

    at(1150, () => {                                                    // main strike
      pulse(flash, 'go-main');
      bolt.classList.add('strike');
      hero.classList.add('is-here');
      burnFigure(bz.spine);
      lit(180);
      at(330, () => lit(110));
    });

    at(5600, () => {                                                    // second flash, art is gone
      pulse(flash, 'go-soft');
      lit(120);
      hero.classList.add('is-gone');
      stopFigure();
    });

    at(6100, () => storm && storm.classList.add('fx-fading'));
    at(7200, () => endScene());
  }

  function endScene(fast) {
    document.documentElement.classList.remove('fx-storm-active');
    document.body.classList.remove('fx-storm-active');
    timers.forEach(clearTimeout);
    timers = [];
    if (thunder) {
      thunder.fade();
      thunder = null;
    }
    stopFigure();
    if (rainState) {
      rainState.done = true;
      rainState = null;
    }
    if (!storm) return;
    const s = storm;
    const f = flash;
    storm = flash = hero = bolt = null;
    s.classList.add('fx-fading');
    setTimeout(() => { s.remove(); if (f) f.remove(); }, fast ? 80 : 850);
  }

  // ----------------------------------------------------------
  // 4. WIRING (capture phase so script.js handlers stay untouched)
  // ----------------------------------------------------------
  const onWenz = () => {
    const name = byId('profile-name');
    return !!name && name.textContent.trim() === 'Wenz';
  };

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    if (target.closest('#theme-toggle-btn')) {
      e.stopPropagation();
      toggleTheme();
      return;
    }

    const revealBtn = target.closest('#persona-reveal-btn');
    if (revealBtn) {
      if (replaying) return;
      if (storm) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      if (wide() && !reduced()) {
        // Hide button immediately so it disappears upon pressing
        revealBtn.style.display = 'none';
        // Hold the persona switch so the persona changes inside the strike
        e.stopPropagation();
        e.preventDefault();
        startScene();
        setTimeout(() => {
          replaying = true;
          revealBtn.click();
          replaying = false;
        }, 1180);
        return;
      }
      revealBtn.style.display = 'none';
      startScene();
      return;
    }

    const item = target.closest('#cmdk-list .cmdk-item');
    if (!item) return;
    const action = item.getAttribute('data-action');

    if (action === 'theme') {
      e.stopPropagation();
      const modal = byId('cmdk-modal');
      if (modal) modal.classList.remove('open');
      toggleTheme();
    } else if (action === 'persona' && onWenz()) {
      startScene();
    }
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') endScene(true);
  });
})();
