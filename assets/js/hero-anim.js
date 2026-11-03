/* Homepage hero animations. One of three is chosen at random on each page load:
   a live MOSUM detector, multivariate ribbons, or a scrolling wavelet spectrum.
   All data is simulated. Drawing is confined to a band near the bottom of the hero. */
(function () {
  'use strict';
  var cv = document.getElementById('hero-live');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = {};
  function readColors() {
    var cs = getComputedStyle(root);
    ['bg', 'accent', 'hot', 'ink', 'ink-3'].forEach(function (k) { C[k] = cs.getPropertyValue('--' + k).trim(); });
  }
  readColors();
  document.addEventListener('themechange', readColors);

  function randn() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function rgba(hex, a) {
    var h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function Regimes(o) {
    var s = { mu: 0, sd: .1, phi: .4, left: 0, e: 0, t: 0, freq: .1 };
    s.next = function () {
      var cp = false;
      if (s.left <= 0) {
        var prev = s.mu, m;
        do { m = (Math.random() * 2 - 1) * (o.range || .55); } while (Math.abs(m - prev) < (o.minJump || .22));
        s.mu = m; s.sd = (o.sdMin || .05) + Math.random() * (o.sdRange === undefined ? .12 : o.sdRange);
        s.phi = o.phi === undefined ? Math.random() * .7 : o.phi;
        s.left = (o.minLen || 70) + Math.floor(Math.random() * (o.lenRange || 110));
        s.freq = .05 + Math.random() * .35; cp = s.t > 0;
      }
      s.left--; s.t++; s.e = s.phi * s.e + s.sd * randn();
      return { y: s.mu + s.e, mu: s.mu, sd: s.sd, freq: s.freq, e: s.e, cp: cp };
    };
    return s;
  }
  var heatCache = {};
  function heatColor(lv, L) { var k = C.accent + lv; return heatCache[k] || (heatCache[k] = rgba(C.accent, Math.min(1, (lv + .5) / L) * .9)); }
  var MONO = '500 11px "JetBrains Mono", ui-monospace, monospace';
  var A = { W: 0, H: 0, y0: 0, y1: 0 };
  function Y(f) { return A.y0 + f * (A.y1 - A.y0); }

  /* 1. Live MOSUM detector. The statistic at time k compares the G points before k
     with the G points after it, so it is only available G points behind the newest
     data; the shaded window shows exactly which data the current value uses. */
  function detector() {
    var STEP = 4, G = 22, thr = 4, SD = .09, ys = [], stat = [], det = [], since = 1e9, off = 0;
    var reg = Regimes({ minLen: 90, lenRange: 120, sdMin: SD, sdRange: 0, phi: 0 });
    function push() {
      ys.push(reg.next().y); det.push(null);
      var n = ys.length, k = n - G, s = 0, i;
      if (k - G >= 0) { var a = 0, b = 0; for (i = k - G; i < k; i++) a += ys[i]; for (i = k; i < n; i++) b += ys[i]; s = Math.abs(b - a) / G / (SD * Math.sqrt(2 / G)); }
      stat.push(s); since++;
      var m = stat.length;
      // stat[j] is centred at series index j + 1 - G
      if (m > 3 && stat[m - 2] > thr && stat[m - 2] >= stat[m - 3] && stat[m - 2] > stat[m - 1] && since > G) {
        var at = m - 1 - G; if (at >= 0) { det[at] = { born: performance.now() }; since = 0; }
      }
    }
    function need() { return Math.ceil(A.W / STEP) + G + 4; }
    function trim() { while (ys.length > need()) { ys.shift(); stat.shift(); det.shift(); } }
    return {
      resize: function () { while (ys.length < need()) push(); trim(); },
      step: function (dt) { off += dt * .05; while (off >= STEP) { off -= STEP; push(); trim(); } },
      draw: function (now) {
        var n = ys.length, i;
        var right = A.W * .88; // newest observation sits here, leaving room to see the window's right edge
        var X = function (j) { return right - off - (n - 1 - j) * STEP; };
        var mid = Y(.25), sc = (A.y1 - A.y0) * .22, sTop = Y(.55), sBot = Y(.98);
        var smax = Math.sqrt(Math.max(thr * 3, Math.max.apply(null, stat) * 1.1));
        var SY = function (v) { return sBot - Math.sqrt(Math.max(0, v)) / smax * (sBot - sTop); };
        var k = n - G; // centre of the newest statistic value
        // moving window on the series: dashed edges at k - G and k + G, solid line at the current time k
        var wTop = Y(0), wBot = Y(.5);
        ctx.fillStyle = rgba(C.accent, .06); ctx.fillRect(X(k - G), wTop, X(n - 1) - X(k - G), wBot - wTop);
        ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath();
        ctx.moveTo(X(k - G), wTop); ctx.lineTo(X(k - G), wBot); ctx.moveTo(X(n - 1), wTop); ctx.lineTo(X(n - 1), wBot); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(k), wTop); ctx.lineTo(X(k), wBot); ctx.stroke();
        ctx.font = MONO; ctx.fillStyle = C['ink-3']; ctx.fillText('window', X(k - G) + 6, wTop + 12);
        // fitted mean between detections
        var segs = [], st = 0; for (i = 0; i < n; i++) if (det[i]) { segs.push([st, i]); st = i; } segs.push([st, k]);
        ctx.lineWidth = 2.6; ctx.strokeStyle = C.hot; ctx.beginPath();
        segs.forEach(function (s) { if (s[1] - s[0] < 2) return; var a = 0; for (var j = s[0]; j < s[1]; j++) a += ys[j]; a /= (s[1] - s[0]);
          ctx.moveTo(X(s[0]), mid - a * sc); ctx.lineTo(X(s[1]), mid - a * sc); });
        ctx.stroke();
        // series
        ctx.strokeStyle = rgba(C.accent, .7); ctx.lineWidth = 1.3; ctx.beginPath();
        for (i = 0; i < n; i++) { var y = mid - ys[i] * sc; i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); } ctx.stroke();
        // statistic, plotted at the time it is centred on
        var ty = SY(thr);
        ctx.strokeStyle = rgba(C['ink-3'], .6); ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(A.W, ty); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C['ink-3']; ctx.fillText('threshold', A.W - 84, ty - 6);
        ctx.beginPath(); ctx.strokeStyle = C.accent; ctx.lineWidth = 1.7;
        var first = true;
        for (i = 0; i < stat.length; i++) { var c = i + 1 - G; if (c < 0) continue; var yy = SY(stat[i]); first ? ctx.moveTo(X(c), yy) : ctx.lineTo(X(c), yy); first = false; }
        ctx.stroke(); ctx.lineTo(X(k), sBot); ctx.lineTo(X(0), sBot); ctx.fillStyle = rgba(C.accent, .1); ctx.fill();
        var cur = SY(stat[stat.length - 1]); ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(X(k), cur, 3.5, 0, 7); ctx.fill();
        // detections
        for (i = 0; i < n; i++) if (det[i]) {
          var dx = X(i), age = Math.max(0, Math.min(1, (now - det[i].born) / 700));
          ctx.strokeStyle = rgba(C.hot, .4 + .5 * (1 - age)); ctx.lineWidth = 1.2 + 2 * (1 - age); ctx.setLineDash([4, 5]);
          ctx.beginPath(); ctx.moveTo(dx, Y(0)); ctx.lineTo(dx, sBot); ctx.stroke(); ctx.setLineDash([]);
          if (age < 1) { ctx.strokeStyle = rgba(C.hot, 1 - age); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(dx, ty, 6 + age * 32, 0, 7); ctx.stroke(); }
          ctx.fillStyle = C.hot; ctx.fillText('τ̂', dx + 6, Y(0) + 12);
        }
      }
    };
  }

  /* 2. Multivariate ribbons: six series with shared change points where only some shift. */
  function ribbons() {
    var D = 6, STEP = 4, off = 0, cols = [], band = 0, left = 0, st = [];
    for (var d = 0; d < D; d++) st.push({ mu: 0, sd: .2, e: 0 });
    function push() {
      var cp = false;
      if (left <= 0) {
        left = 80 + Math.floor(Math.random() * 100); band++; cp = cols.length > 0;
        st.forEach(function (s) { if (Math.random() < .55 || !cols.length) { s.mu = (Math.random() * 2 - 1) * .9; s.sd = .08 + Math.random() * .3; } });
      }
      left--;
      cols.push({ v: st.map(function (s) { s.e = .5 * s.e + s.sd * randn(); return s.mu + s.e; }), band: band, cp: cp, born: performance.now() });
    }
    function need() { return Math.ceil(A.W / STEP) + 3; }
    return {
      resize: function () { while (cols.length < need()) push(); while (cols.length > need()) cols.shift(); },
      step: function (dt) { off += dt * .045; while (off >= STEP) { off -= STEP; push(); while (cols.length > need()) cols.shift(); } },
      draw: function (now) {
        var n = cols.length, x0 = -off, laneH = (A.y1 - A.y0) / D, i, bs = 0;
        for (i = 1; i <= n; i++) if (i === n || cols[i].band !== cols[bs].band) {
          ctx.fillStyle = cols[bs].band % 2 ? rgba(C.accent, .07) : rgba(C.hot, .05);
          ctx.fillRect(x0 + bs * STEP, A.y0 - 12, (i - bs) * STEP, A.y1 - A.y0 + 12); bs = i;
        }
        for (var d = 0; d < D; d++) {
          var cy = A.y0 + laneH * (d + .5), sc = laneH * .32;
          ctx.strokeStyle = rgba(d % 2 ? C.hot : C.accent, .55 + .06 * d); ctx.lineWidth = 1.4; ctx.beginPath();
          for (i = 0; i < n; i++) { var y = cy - cols[i].v[d] * sc; i ? ctx.lineTo(x0 + i * STEP, y) : ctx.moveTo(x0, y); }
          ctx.stroke();
        }
        for (i = 0; i < n; i++) if (cols[i].cp) {
          var xx = x0 + i * STEP, age = Math.max(0, Math.min(1, (now - cols[i].born) / 900));
          var g = ctx.createLinearGradient(xx - 50, 0, xx, 0); g.addColorStop(0, rgba(C.hot, 0)); g.addColorStop(1, rgba(C.hot, .28 * (1 - age)));
          ctx.fillStyle = g; ctx.fillRect(xx - 50, A.y0 - 12, 50, A.y1 - A.y0 + 12);
          ctx.strokeStyle = rgba(C.hot, .7); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xx, A.y0 - 12); ctx.lineTo(xx, A.y1); ctx.stroke();
        }
      }
    };
  }

  /* 3. Wavelet spectrum: series with regime-dependent frequency and variance, plus a
     scrolling heat strip of local energy at seven dyadic scales. */
  function wavelet() {
    var J = 7, STEP = 3, off = 0, ys = [], spec = [], hist = [], ema = [], ph = 0, reg = Regimes({ minLen: 110, lenRange: 120 });
    for (var j = 0; j < J; j++) ema.push(0);
    function push() {
      var p = reg.next(); ph += p.freq * 2.2;
      var y = .45 * Math.sin(ph) * (p.sd * 4) + p.e * 1.4; ys.push(y); hist.push(y); if (hist.length > 140) hist.shift();
      var col = [];
      for (var j = 0; j < J; j++) {
        var h = Math.pow(2, j), L = hist.length, d = 0;
        if (L >= 2 * h) { var a = 0, b = 0, i; for (i = L - 2 * h; i < L - h; i++) a += hist[i]; for (i = L - h; i < L; i++) b += hist[i]; d = (b - a) / h; }
        ema[j] = .9 * ema[j] + .1 * d * d; col.push(ema[j]);
      }
      spec.push({ e: col, mx: Math.max.apply(null, col) || 1e-9, cp: p.cp });
    }
    function need() { return Math.ceil(A.W / STEP) + 3; }
    function trim() { while (ys.length > need()) { ys.shift(); spec.shift(); } }
    return {
      resize: function () { while (ys.length < need()) push(); trim(); },
      step: function (dt) { off += dt * .04; while (off >= STEP) { off -= STEP; push(); trim(); } },
      draw: function () {
        var i, j, gmax = 1e-9; for (i = 0; i < spec.length; i++) gmax = Math.max(gmax, spec[i].mx);
        var n = ys.length, x0 = -off, mid = Y(.2), sc = (A.y1 - A.y0) * .22, sTop = Y(.48), sH = A.y1 - sTop, rowH = sH / J;
        // Quantise intensity into LEVELS bins and fill each bin as one path:
        // a handful of fill() calls per frame instead of thousands of fillRect().
        var LEVELS = 24, bins = [], lv;
        for (lv = 0; lv < LEVELS; lv++) bins.push([]);
        for (i = 0; i < n; i++) for (j = 0; j < J; j++) {
          var a = Math.sqrt(spec[i].e[j] / gmax); if (a < .06) continue;
          bins[Math.min(LEVELS - 1, Math.floor(a * LEVELS))].push(i, j);
        }
        for (lv = 0; lv < LEVELS; lv++) {
          var b = bins[lv]; if (!b.length) continue;
          ctx.fillStyle = heatColor(lv, LEVELS); ctx.beginPath();
          for (var q = 0; q < b.length; q += 2) ctx.rect(x0 + b[q] * STEP, sTop + (J - 1 - b[q + 1]) * rowH, STEP + .6, rowH - 1);
          ctx.fill();
        }
        ctx.font = MONO; ctx.fillStyle = C['ink-3'];
        ctx.fillText('fine scales', A.W - 96, A.y1 - 4); ctx.fillText('coarse scales', A.W - 110, sTop + 12);
        ctx.strokeStyle = rgba(C.accent, .85); ctx.lineWidth = 1.3; ctx.beginPath();
        for (i = 0; i < n; i++) { var y = mid - ys[i] * sc; i ? ctx.lineTo(x0 + i * STEP, y) : ctx.moveTo(x0, y); } ctx.stroke();
        for (i = 0; i < n; i++) if (spec[i].cp) {
          var cx = x0 + i * STEP; ctx.strokeStyle = rgba(C.hot, .75); ctx.setLineDash([4, 5]); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(cx, Y(0) - 10); ctx.lineTo(cx, A.y1); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = C.hot; ctx.fillText('τ', cx + 5, Y(0));
        }
      }
    };
  }

  var makers = { detector: detector, ribbons: ribbons, wavelet: wavelet };
  var names = Object.keys(makers);
  // Pick at random on each load; #hero-detector, #hero-ribbons or #hero-wavelet forces one.
  var forced = (location.hash.match(/^#hero-(\w+)$/) || [])[1];
  var choice = makers[forced] ? forced : names[Math.floor(Math.random() * names.length)];
  cv.setAttribute('data-anim', choice);
  var anim = makers[choice]();

  var raf = 0, last = 0, onScreen = true;
  function resize() {
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    A.W = r.width; A.H = r.height;
    A.y0 = A.H * .06; A.y1 = A.H * .96;
    cv.width = Math.round(A.W * dpr); cv.height = Math.round(A.H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); anim.resize();
  }
  function draw(now) { ctx.clearRect(0, 0, A.W, A.H); anim.draw(now); }
  function shouldRun() { return !reduce && onScreen && !document.hidden && A.W >= 860; }
  function frame(now) { raf = 0; var dt = last ? Math.min(50, now - last) : 16; last = now; anim.step(dt); draw(now); raf = requestAnimationFrame(frame); }
  function update() {
    if (shouldRun()) { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    else { if (raf) { cancelAnimationFrame(raf); raf = 0; } draw(performance.now() + 1e4); }
  }
  resize();
  if (!shouldRun()) for (var i = 0; i < 300; i++) anim.step(16); // settle into a representative still frame
  draw(performance.now() + 1e4);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); update(); }, 150); });
  document.addEventListener('themechange', function () { if (!raf) draw(performance.now() + 1e4); });
  document.addEventListener('visibilitychange', update);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; update(); }).observe(cv);
  update();
})();
