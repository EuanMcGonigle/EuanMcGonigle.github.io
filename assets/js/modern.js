/* Modern theme interactions for euanmcgonigle.github.io */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
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
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('theme', next);
      document.dispatchEvent(new Event('themechange'));
    });
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('nav-burger');
  var links = document.getElementById('nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- Nav: scrolled state, progress bar, active link ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('nav-progress');
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    }
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

  /* ---------- Hero canvas: a live nonstationary series with change points ---------- */
  var canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var STEP = 4;               // px between observations
  var series = [];            // {y, mu, cp}
  var colors = {};
  var seg = null;
  var t = 0, offset = 0, running = true;

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
    if (!running) return;
    var dt = lastT ? Math.min(64, now - lastT) : 16;
    lastT = now;
    offset += dt * 0.045; // px per ms
    while (offset >= STEP) { offset -= STEP; series.shift(); series.push(nextPoint()); }
    draw(now);
    requestAnimationFrame(frame);
  }

  readColors();
  resize();
  document.addEventListener('themechange', readColors);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 120); });

  if (reduceMotion) {
    draw(performance.now() + 5000);
  } else {
    // pause when off-screen or tab hidden
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; lastT = 0; requestAnimationFrame(frame); }
        else if (!vis) running = false;
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) running = false;
      else if (!running) { running = true; lastT = 0; requestAnimationFrame(frame); }
    });
    requestAnimationFrame(frame);
  }
})();
