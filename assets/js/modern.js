/* Modern theme interactions for euanmcgonigle.github.io */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  window.__modernReady = true;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById('theme-toggle');
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  function labelToggle() {
    if (!toggle) return;
    var dark = currentTheme() === 'dark';
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      var system = systemDark.matches ? 'dark' : 'light';
      if (next === system) {
        // Back to following the system setting.
        root.removeAttribute('data-theme');
        try { localStorage.removeItem('theme'); } catch (e) {}
      } else {
        root.setAttribute('data-theme', next);
        store('theme', next);
      }
      labelToggle();
      document.dispatchEvent(new Event('themechange'));
    });
    labelToggle();
    systemDark.addEventListener('change', function () { labelToggle(); document.dispatchEvent(new Event('themechange')); });
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('nav-burger');
  var links = document.getElementById('nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    var closeMenu = function () { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) { closeMenu(); burger.focus(); }
    });
  }

  /* ---------- Nav: scrolled state, progress bar, active link ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('nav-progress');
  // Cache the scrollable height so the scroll handler never forces layout.
  var scrollMax = 0;
  function measure() { scrollMax = document.documentElement.scrollHeight - window.innerHeight; }
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 8);
    if (progress) progress.style.transform = 'scaleX(' + (scrollMax > 0 ? Math.min(1, y / scrollMax) : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[data-section]'));
  function setActive(id) {
    navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-section') === id); });
  }
  // Sub-pages: highlight by path.
  var path = window.location.pathname.replace(/\/+$/, '/');
  navLinks.forEach(function (a) {
    var s = a.getAttribute('data-section');
    if (path.indexOf('/' + s + '/') !== -1) a.classList.add('is-active');
  });
  // Homepage: scroll-spy.
  var spySections = navLinks.map(function (a) { return document.getElementById(a.getAttribute('data-section')); }).filter(Boolean);
  if (spySections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spySections.forEach(function (s) { spy.observe(s); });
    var top = document.getElementById('top');
    if (top) new IntersectionObserver(function (en) { if (en[0].isIntersecting) setActive(null); }, { rootMargin: '-45% 0px -50% 0px' }).observe(top);
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Card spotlight follows cursor ---------- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Typewriter ---------- */
  var typer = document.getElementById('typer');
  if (typer && !reduceMotion) {
    var words = typer.getAttribute('data-words').split('|');
    var wi = 0, ci = words[0].length, deleting = true;
    var tick = function () {
      var w = words[wi];
      if (deleting) {
        ci--;
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
      } else {
        ci++;
      }
      typer.textContent = words[wi].slice(0, Math.max(0, ci));
      var delay = deleting ? 35 : 70;
      if (!deleting && ci >= words[wi].length) { deleting = true; delay = 2200; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var out = btn.parentNode.querySelector('.copied');
      var text = btn.getAttribute('data-copy');
      var done = function () { if (out) { out.textContent = 'Copied!'; setTimeout(function () { out.textContent = ''; }, 1800); } };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { window.location.href = 'mailto:' + text; });
      else window.location.href = 'mailto:' + text;
    });
  });

  /* ---------- Publication filter + search ---------- */
  document.querySelectorAll('[data-pubs]').forEach(function (wrap) {
    var chips = wrap.querySelectorAll('.chip');
    var search = wrap.querySelector('[data-search]');
    var items = wrap.querySelectorAll('.pub');
    var empty = wrap.querySelector('.pubs__empty');
    if (!chips.length) return;
    var filter = 'all';
    function apply() {
      var q = (search && search.value || '').trim().toLowerCase();
      var shown = 0;
      items.forEach(function (li) {
        var ok = (filter === 'all' || li.getAttribute('data-type') === filter) &&
                 (!q || li.getAttribute('data-text').indexOf(q) !== -1);
        li.hidden = !ok;
        if (ok) { shown++; li.classList.add('is-in'); }
      });
      if (empty) empty.hidden = shown !== 0;
      // Show each year once, on the first visible paper of that year.
      var prev = null;
      items.forEach(function (li) {
        if (li.hidden) return;
        var yr = li.querySelector('.pub__year');
        if (!yr) return;
        yr.classList.toggle('is-repeat', yr.textContent === prev);
        prev = yr.textContent;
      });
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.remove('is-active'); });
        c.classList.add('is-active');
        filter = c.getAttribute('data-filter');
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
  });

  /* ---------- Figure lightbox ---------- */
  var lastFocus = null;
  function closeLightbox() {
    var lb = document.querySelector('.lightbox');
    if (!lb) return;
    lb.classList.remove('is-open');
    setBackgroundInert(false);
    setTimeout(function () { if (lb.parentNode) lb.parentNode.removeChild(lb); }, 250);
    document.removeEventListener('keydown', onLbKey);
    if (lastFocus) lastFocus.focus();
  }
  function setBackgroundInert(on) {
    ['nav', 'main', 'footer'].forEach(function (sel) {
      var el = sel === 'nav' ? document.getElementById('nav') : document.querySelector(sel === 'main' ? '#main' : '.footer');
      if (!el) return;
      if (on) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
      else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
    });
    document.body.style.overflow = on ? 'hidden' : '';
  }
  function onLbKey(e) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'Tab') {
      // The close button is the only control in the dialog: keep focus on it.
      e.preventDefault();
      var c = document.querySelector('.lightbox .icon-btn');
      if (c) c.focus();
    }
  }
  document.querySelectorAll('[data-lightbox]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lastFocus = btn;
      var lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', btn.getAttribute('data-caption'));
      var fig = document.createElement('figure');
      var img = document.createElement('img');
      img.src = btn.getAttribute('data-lightbox');
      img.alt = btn.querySelector('img').alt;
      var cap = document.createElement('figcaption');
      cap.textContent = btn.getAttribute('data-caption');
      var close = document.createElement('button');
      close.className = 'icon-btn';
      close.type = 'button';
      close.setAttribute('aria-label', 'Close');
      close.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      fig.appendChild(img); fig.appendChild(cap);
      lb.appendChild(fig); lb.appendChild(close);
      lb.addEventListener('click', function (e) { if (e.target === lb || close.contains(e.target)) closeLightbox(); });
      document.body.appendChild(lb);
      setBackgroundInert(true);
      document.addEventListener('keydown', onLbKey);
      requestAnimationFrame(function () { lb.classList.add('is-open'); close.focus(); });
    });
  });

  /* ---------- Hero canvas: a live nonstationary series with change points ---------- */
  var canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var STEP = 4;               // px between observations
  var series = [];            // {y, mu, cp}
  var colors = {};
  var seg = null;
  var t = 0, offset = 0, rafId = 0, onScreen = true;
  var isHero = !canvas.classList.contains('hero__canvas--small');

  function readColors() {
    var cs = getComputedStyle(root);
    colors.accent = cs.getPropertyValue('--accent').trim() || '#0f6e78';
    colors.hot = cs.getPropertyValue('--hot').trim() || '#d9572b';
    colors.ink = cs.getPropertyValue('--ink-3').trim() || '#888';
  }

  function randn() {
    var u = 1 - Math.random(), v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  var ar = 0;
  function newSegment() {
    var prev = seg ? seg.mu : 0;
    var mu;
    do { mu = (Math.random() * 2 - 1) * 0.55; } while (Math.abs(mu - prev) < 0.22);
    seg = { mu: mu, sd: 0.04 + Math.random() * 0.12, phi: Math.random() * 0.8, left: 60 + Math.floor(Math.random() * 110) };
  }
  function nextPoint() {
    var cp = false;
    if (!seg || seg.left <= 0) { newSegment(); cp = series.length > 0; }
    seg.left--;
    // smooth time-varying amplitude (locally stationary flavour)
    var amp = 1 + 0.6 * Math.sin(t / 47) * Math.sin(t / 13);
    ar = seg.phi * ar + seg.sd * amp * randn();
    t++;
    return { y: seg.mu + ar, mu: seg.mu, cp: cp, born: performance.now() };
  }

  function resize() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var need = Math.ceil(W / STEP) + 3;
    while (series.length < need) series.push(nextPoint());
    if (series.length > need) series = series.slice(series.length - need);
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    var small = canvas.classList.contains('hero__canvas--small');
    var mid = small ? H * 0.52 : H * (W < 860 ? 0.86 : 0.8);
    var scale = small ? H * 0.28 : H * (W < 860 ? 0.08 : 0.13);
    var x0 = -offset;
    var yOf = function (v) { return mid - v * scale; };

    // change point markers
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 1;
    ctx.font = '500 12px "JetBrains Mono", monospace';
    for (var i = 0; i < series.length; i++) {
      if (!series[i].cp) continue;
      var x = x0 + i * STEP;
      var age = Math.max(0, Math.min(1, (now - series[i].born) / 900));
      ctx.globalAlpha = 0.55 * age;
      ctx.strokeStyle = colors.hot;
      ctx.beginPath(); ctx.moveTo(x, small ? H * 0.12 : H * 0.6); ctx.lineTo(x, H * 0.97); ctx.stroke();
      ctx.fillStyle = colors.hot;
      ctx.globalAlpha = 0.8 * age;
      ctx.fillText('τ', x + 5, (small ? H * 0.12 : H * 0.6) + 12);
      // pulse when newly detected
      if (age < 1) {
        ctx.globalAlpha = (1 - age) * 0.6;
        ctx.beginPath(); ctx.setLineDash([]);
        ctx.arc(x, yOf(series[i].mu), 4 + age * 26, 0, Math.PI * 2);
        ctx.stroke(); ctx.setLineDash([4, 6]);
      }
    }
    ctx.restore();

    // observed series
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (var j = 0; j < series.length; j++) {
      var px = x0 + j * STEP, py = yOf(series[j].y);
      if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // fitted piecewise-constant mean
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = colors.hot;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (var k = 0; k < series.length; k++) {
      var qx = x0 + k * STEP, qy = yOf(series[k].mu);
      if (k === 0) ctx.moveTo(qx, qy);
      else { if (series[k].cp) ctx.lineTo(qx, yOf(series[k - 1].mu)); ctx.lineTo(qx, qy); }
    }
    ctx.stroke();
    ctx.restore();

    // leading point
    var last = series[series.length - 1];
    var lx = x0 + (series.length - 1) * STEP;
    if (lx <= W + 2) {
      ctx.fillStyle = colors.accent;
      ctx.beginPath(); ctx.arc(lx, yOf(last.y), 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  var lastT = 0;
  function frame(now) {
    rafId = 0;
    var dt = lastT ? Math.min(64, now - lastT) : 16;
    lastT = now;
    offset += dt * 0.045; // px per ms
    while (offset >= STEP) { offset -= STEP; series.shift(); series.push(nextPoint()); }
    draw(now);
    rafId = requestAnimationFrame(frame);
  }

  // Animate only when the canvas is on screen, the tab is visible and (for the
  // homepage hero) the screen is wide enough for the animation to be seen.
  function shouldRun() {
    return !reduceMotion && onScreen && !document.hidden && W >= 860;
  }
  function updateLoop() {
    if (shouldRun()) {
      if (!rafId) { lastT = 0; rafId = requestAnimationFrame(frame); }
    } else {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      draw(performance.now() + 5000);
    }
  }

  readColors();
  resize();
  document.addEventListener('themechange', readColors);
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); updateLoop(); }, 120); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; updateLoop(); }).observe(canvas);
  }
  document.addEventListener('visibilitychange', updateLoop);
  document.addEventListener('themechange', function () { if (!rafId) draw(performance.now() + 5000); });
  updateLoop();
})();
