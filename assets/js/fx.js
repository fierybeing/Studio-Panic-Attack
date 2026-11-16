/* ════════════════════════════════════════════════════════════════════════
   fx.js — the things that move.

     SPA.fx.floor(canvas)      perspective grid of "+" marks that travels with the scroll
     SPA.fx.flyers(root)       pictures that fly past in 3D as you scroll
     SPA.fx.knot(canvas)       the glossy 3D knot (plain WebGL, no library)
     SPA.fx.disperse(root)     letters that scatter away from the cursor
     SPA.fx.embers(canvas)     glowing particles drawn to the cursor
     SPA.fx.cursor()           the four-pointed star that replaces the mouse cursor

   Each one returns a function that stops it. Every loop pauses when its
   element is off screen, and all of them stand still for visitors who have
   "reduce motion" switched on.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SPA = window.SPA;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  SPA.fx = { reduce: REDUCE };

  /* Effect version of a picture, baked by tools/make_fx.py */
  SPA.fxSrc = function (key, fx) { return 'media/fx/' + key.replace('/', '--') + '--' + fx + '.webp'; };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ── 1. the floor ──────────────────────────────────────────────────────
     Looking down a receding plane: lines fan out from a vanishing point and
     rows of "+" slide toward you. Scrolling pushes the rows along.          */
  SPA.fx.floor = function (canvas) {
    var ctx = canvas.getContext('2d');
    var VP = 0.18, EXPO = 1.6, CELL = 120, BG = '#fafafa';
    var raf = 0, last = 0, row = 0, lastY = window.scrollY, dpr = 1;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    }
    function draw(now) {
      raf = requestAnimationFrame(draw);
      var sy = window.scrollY, vh = window.innerHeight;
      var show = clamp((sy - vh * 0.15) / (vh * 0.5), 0, 1);     /* hidden behind the sphere */
      canvas.style.opacity = show.toFixed(2);
      var dt = Math.min((now - (last || now)) / 1000, 0.05); last = now;
      row += (REDUCE ? 0 : 0.22 * dt) + (sy - lastY) / 420; lastY = sy;
      row = ((row % 1) + 1) % 1;
      if (show === 0) return;

      var W = canvas.width / dpr, H = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      var vy = H * VP, vx = W / 2, span = H - vy;
      var cols = Math.max(2, Math.round(vx / CELL)), rows = Math.max(4, Math.round(span * EXPO / CELL));
      var maxCols = Math.min(60, cols * 4), cell = vx / cols, i, j;

      ctx.lineWidth = 0.4;                                       /* lines fanning from the horizon */
      for (j = -maxCols; j <= maxCols; j++) {
        ctx.strokeStyle = 'rgba(175,178,192,' + ((1 - Math.abs(j) / maxCols * 0.55) * 0.2).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + j * cell, H); ctx.stroke();
      }
      for (i = 0; i <= rows; i++) {
        var t = (i + row) / rows; if (t <= 0 || t > 1) continue;
        var te = Math.pow(t, EXPO), y = vy + span * te;
        ctx.strokeStyle = 'rgba(175,178,192,' + (t * 0.44).toFixed(3) + ')';
        ctx.lineWidth = 0.3 + t * 0.8;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        var s = 1.5 + t * 6.5, jmax = Math.min(maxCols, Math.ceil(cols / te));   /* the "+" marks */
        ctx.lineWidth = 0.6 + t * 0.9;
        for (j = -jmax; j <= jmax; j++) {
          var x = vx + j * cell * te; if (x < -s || x > W + s) continue;
          var a = t * 0.68 * (1 - Math.abs(j) / jmax * 0.42); if (a < 0.025) continue;
          ctx.strokeStyle = 'rgba(105,110,130,' + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke();
        }
      }
      var fog = ctx.createLinearGradient(0, vy, 0, vy + span * 0.12);   /* mist at the horizon */
      fog.addColorStop(0, BG); fog.addColorStop(0.4, BG); fog.addColorStop(1, 'rgba(250,250,250,0)');
      ctx.fillStyle = fog; ctx.fillRect(0, 0, W, vy + span * 0.12);
    }
    size(); window.addEventListener('resize', size);
    raf = requestAnimationFrame(draw);
    return function () { cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  };

  /* ── 2. flying pictures ────────────────────────────────────────────────
     Every .fly has a home spot. Where it sits relative to the middle of the
     screen (p: -1 below … 0 centred … +1 above) drives how far it has risen
     toward you, how much it has turned, and how visible it is.              */
  SPA.fx.flyers = function (root) {
    var items = [].map.call(root.querySelectorAll('.fly'), function (el, i) {
      return { el: el, d: parseFloat(el.getAttribute('data-d')) || 1, r: parseFloat(el.getAttribute('data-r')) || 0,
        dir: i % 2 ? 1 : -1, phase: i * 1.7, home: 0, on: true };
    });
    var raf = 0, small = false;
    function measure() {
      small = window.innerWidth <= 880;
      items.forEach(function (f) {
        var box = f.el.offsetParent; if (!box) return;
        f.home = box.getBoundingClientRect().top + window.scrollY + f.el.offsetTop + f.el.offsetHeight / 2;
      });
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var vh = window.innerHeight, mid = window.scrollY + vh / 2, k = small ? 0.55 : 1;
      for (var i = 0; i < items.length; i++) {
        var f = items[i], p = (mid - f.home) / vh;
        if (p < -1.3 || p > 1.3) { if (f.on) { f.el.style.visibility = 'hidden'; f.on = false; } continue; }
        if (!f.on) { f.el.style.visibility = ''; f.on = true; }
        var bob = Math.sin(now / 1000 * 0.7 + f.phase);
        var x = p * f.dir * f.d * 34 * k, y = -p * f.d * vh * 0.22 * k + bob * 7, z = p * f.d * 240 * k;
        var rx = -p * 12 * k, ry = p * f.dir * 20 * k, rz = f.r + p * f.dir * 9 * f.d * k + bob * 0.6;
        f.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateX(' +
          rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';
        f.el.style.opacity = (p < -0.75 ? clamp((p + 1.2) / 0.45, 0, 1) : p > 0.8 ? clamp((1.25 - p) / 0.45, 0, 1) : 1).toFixed(2);
      }
    }
    if (REDUCE) {                                                /* tilted, but still */
      items.forEach(function (f) { f.el.style.transform = 'rotate(' + f.r + 'deg)'; });
      return function () {};
    }
    measure();
    window.addEventListener('resize', measure); window.addEventListener('load', measure);
    var again = setTimeout(measure, 900);                        /* once fonts and pictures have settled */
    raf = requestAnimationFrame(frame);
    return function () {
      cancelAnimationFrame(raf); clearTimeout(again);
      window.removeEventListener('resize', measure); window.removeEventListener('load', measure);
    };
  };

  /* ── 3. the knot ───────────────────────────────────────────────────────
     A torus knot tube, shaded like polished lacquer in a photo studio.
     Drag to carry it around (it turns as it goes); click to change what it
     is made of. Left alone it bobs gently.                                  */
  var KNOT_LOOKS = [
    { base: [0.02, 0.02, 0.025], tint: [0.85, 0.04, 0.04] },    /* black lacquer, red glow */
    { base: [0.05, 0.05, 0.62], tint: [0.45, 0.55, 1.0] },      /* ultramarine */
    { base: [0.62, 0.63, 0.67], tint: [0.95, 0.95, 1.0] },      /* chrome */
    { base: [0.9, 0.38, 0.62], tint: [1.0, 0.8, 0.9] }          /* bubblegum */
  ];
  SPA.fx.knot = function (canvas) {
    var gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) { canvas.parentNode.classList.add('no-webgl'); return function () {}; }

    /* geometry: sweep a circle along the (2,3) knot curve */
    var TUB = 220, RAD = 22, TUBE = 0.36, P = 2, Q = 3;
    function curve(u) {
      var qu = Q / P * u, cs = Math.cos(qu), r = (2 + cs) * 0.5;
      return [r * Math.cos(u), r * Math.sin(u), Math.sin(qu) * 0.5];
    }
    function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
    var pos = [], nor = [], idx = [], i, j;
    for (i = 0; i <= TUB; i++) {
      var u = i / TUB * P * Math.PI * 2, p1 = curve(u), p2 = curve(u + 0.01);
      var T = sub(p2, p1), N = [p2[0] + p1[0], p2[1] + p1[1], p2[2] + p1[2]];
      var B = norm(cross(T, N)); N = norm(cross(B, T));
      for (j = 0; j <= RAD; j++) {
        var v = j / RAD * Math.PI * 2, cx = -Math.cos(v), cy = Math.sin(v);
        var n = [cx * N[0] + cy * B[0], cx * N[1] + cy * B[1], cx * N[2] + cy * B[2]];
        pos.push(p1[0] + TUBE * n[0], p1[1] + TUBE * n[1], p1[2] + TUBE * n[2]); nor.push(n[0], n[1], n[2]);
      }
    }
    for (i = 0; i < TUB; i++) for (j = 0; j < RAD; j++) {
      var a = i * (RAD + 1) + j, b = a + RAD + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }

    function shader(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('[knot]', gl.getShaderInfoLog(s));
      return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER,
      'attribute vec3 aPos, aNor; uniform mat3 uR; uniform float uAspect; varying vec3 vN, vP;' +
      'void main(){ vec3 p = uR * aPos; vN = uR * aNor; vP = p; float z = p.z - 4.6;' +
      ' gl_Position = vec4(p.x * 2.0 / uAspect, p.y * 2.0, -1.2222 * z - 2.2222, -z); }'));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER,
      'precision mediump float; varying vec3 vN, vP; uniform vec3 uBase, uTint;' +
      'void main(){ vec3 n = normalize(vN); vec3 v = normalize(vec3(0.0, 0.0, 4.6) - vP); vec3 r = reflect(-v, n);' +
      ' float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);' +
      ' float key = smoothstep(0.55, 0.96, r.y);' +                                   /* big soft light overhead */
      ' float strip = smoothstep(0.90, 0.995, sin(r.x * 3.0 + r.y * 2.0 + 1.0) * 0.5 + 0.5);' +   /* strip lights */
      ' float under = smoothstep(-0.15, -0.9, r.y);' +                                /* coloured floor bounce */
      ' float veil = smoothstep(0.25, 0.9, sin(r.z * 4.0 + r.x * 2.0) * 0.5 + 0.5);' +
      ' float diff = max(dot(n, normalize(vec3(0.4, 0.8, 0.6))), 0.0);' +
      ' vec3 env = vec3(key * 0.85 + strip * 0.9) + uTint * (under * 0.55 + veil * 0.3);' +
      ' vec3 col = uBase * (0.3 + 0.7 * diff) + env * (0.3 + 0.7 * fres) + uTint * fres * 0.7;' +
      ' gl_FragColor = vec4(col, 1.0); }'));
    gl.linkProgram(prog); gl.useProgram(prog);
    function attr(name, data) {
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    }
    attr('aPos', pos); attr('aNor', nor);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
    var uR = gl.getUniformLocation(prog, 'uR'), uAspect = gl.getUniformLocation(prog, 'uAspect');
    var uBase = gl.getUniformLocation(prog, 'uBase'), uTint = gl.getUniformLocation(prog, 'uTint');

    var R = [1, 0, 0, 0, 1, 0, 0, 0, 1], vx = 0, vy = 0, look = 0, raf = 0, last = 0, seen = true, lastY = window.scrollY;
    function turnY(a) { var c = Math.cos(a), s = Math.sin(a), k, p, q; for (k = 0; k < 3; k++) { p = R[k]; q = R[6 + k]; R[k] = c * p + s * q; R[6 + k] = -s * p + c * q; } }
    function turnX(a) { var c = Math.cos(a), s = Math.sin(a), k, p, q; for (k = 0; k < 3; k++) { p = R[3 + k]; q = R[6 + k]; R[3 + k] = c * p - s * q; R[6 + k] = s * p + c * q; } }
    turnX(-0.5); turnY(0.6);
    function size() {
      var d = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(canvas.clientWidth * d), h = Math.round(canvas.clientHeight * d);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function paint() {
      size();
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      /* column-major for WebGL: transpose of the row-major R */
      gl.uniformMatrix3fv(uR, false, [R[0], R[3], R[6], R[1], R[4], R[7], R[2], R[5], R[8]]);
      gl.uniform1f(uAspect, canvas.width / canvas.height);
      gl.uniform3fv(uBase, KNOT_LOOKS[look].base); gl.uniform3fv(uTint, KNOT_LOOKS[look].tint);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    }
    /* where the knot has been carried to, relative to its home spot */
    var mover = canvas.parentNode, off = { x: 0, y: 0 }, lim = { x0: 0, x1: 0, y0: 0, y1: 0 };
    function place(now) {
      var bob = REDUCE || drag ? 0 : 1;
      mover.style.transform = 'translate3d(' + (off.x + bob * Math.sin(now / 1500) * 7).toFixed(1) + 'px,' +
        (off.y + bob * Math.cos(now / 1900) * 6).toFixed(1) + 'px,0)';
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!seen) return;
      var dt = Math.min(now - (last || now), 40); last = now;
      var sy = window.scrollY, ds = sy - lastY; lastY = sy;
      if (!drag) { turnY(dt * 0.00045 + vx + ds * 0.0016); turnX(dt * 0.00018 + vy); vx *= 0.94; vy *= 0.94; }
      place(now); paint();
    }
    var drag = null, moved = 0;
    function down(e) {
      drag = { x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch' }; moved = 0; vx = vy = 0;
      /* it may travel across most of the screen, but not out of reach */
      var home = mover.parentNode.getBoundingClientRect(), cx = home.left + home.width / 2;
      lim.x0 = window.innerWidth * 0.16 - cx; lim.x1 = window.innerWidth * 0.9 - cx;
      lim.y0 = -window.innerHeight * 0.38; lim.y1 = window.innerHeight * 0.38;
      canvas.classList.add('is-held');
    }
    function move(e) {
      if (!drag) return;
      /* a finger carries it sideways only, so swiping up and down still scrolls the page */
      var dx = e.clientX - drag.x, dy = drag.touch ? 0 : e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      off.x = clamp(off.x + dx, Math.min(lim.x0, off.x), Math.max(lim.x1, off.x));
      off.y = clamp(off.y + dy, Math.min(lim.y0, off.y), Math.max(lim.y1, off.y));
      vx = dx * 0.006; vy = -dy * 0.006; turnY(vx); turnX(vy);
      if (REDUCE) { place(0); paint(); }
    }
    function up() {
      if (drag && moved < 6) { look = (look + 1) % KNOT_LOOKS.length; if (REDUCE) paint(); }
      drag = null; canvas.classList.remove('is-held');
    }
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) { seen = en[0].isIntersecting; }) : null;
    if (io) io.observe(canvas);
    if (REDUCE) paint(); else raf = requestAnimationFrame(frame);
    return function () {
      cancelAnimationFrame(raf); if (io) io.disconnect();
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    };
  };

  /* ── 4. scattering letters ─────────────────────────────────────────────
     Every element marked data-disperse is split into letters. Letters near
     the pointer are pushed away and spring back (from the old About page).  */
  SPA.fx.disperse = function (root, o) {
    o = o || {};
    var radius = o.radius || 110, maxMove = o.max || 50, spring = o.spring || 0.06, friction = o.friction || 0.88;
    var chars = [], mouse = { x: -9999, y: -9999 }, raf = 0, timer = 0;
    [].forEach.call(root.querySelectorAll('[data-disperse]'), function (el) {
      var text = el.textContent; el.setAttribute('aria-label', text); el.textContent = '';
      text.split(/(\s+)/).forEach(function (word) {
        if (!word) return;
        if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'dword'; w.setAttribute('aria-hidden', 'true');
        word.split('').forEach(function (ch) {
          var s = document.createElement('span'); s.className = 'dchar'; s.textContent = ch; w.appendChild(s);
          chars.push({ el: s, hx: 0, hy: 0, x: 0, y: 0, vx: 0, vy: 0 });
        });
        el.appendChild(w);
      });
    });
    if (REDUCE || !chars.length) return function () {};
    function homes() {                                           /* where each letter rests, in root coordinates */
      var box = root.getBoundingClientRect();
      chars.forEach(function (c) {
        var r = c.el.getBoundingClientRect();
        c.hx = r.left + r.width / 2 - box.left - c.x; c.hy = r.top + r.height / 2 - box.top - c.y;
      });
    }
    function frame() {
      raf = requestAnimationFrame(frame);
      var box = root.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      var mx = mouse.x - box.left, my = mouse.y - box.top, r2 = radius * radius;
      for (var i = 0; i < chars.length; i++) {
        var c = chars[i], dx = c.hx - mx, dy = c.hy - my, d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 0) { var d = Math.sqrt(d2), f = (1 - d / radius) * maxMove * 0.15; c.vx += dx / d * f; c.vy += dy / d * f; }
        else if (!c.x && !c.y && !c.vx && !c.vy) continue;       /* at rest and far away */
        c.vx = (c.vx - c.x * spring) * friction; c.vy = (c.vy - c.y * spring) * friction;
        c.x += c.vx; c.y += c.vy;
        var len = Math.hypot(c.x, c.y);
        if (len > maxMove) { c.x *= maxMove / len; c.y *= maxMove / len; }
        if (Math.abs(c.x) < 0.15 && Math.abs(c.y) < 0.15 && Math.abs(c.vx) < 0.05 && Math.abs(c.vy) < 0.05) {
          c.x = c.y = c.vx = c.vy = 0; c.el.style.transform = '';
        } else c.el.style.transform = 'translate(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px)';
      }
    }
    function onMove(e) { mouse.x = e.clientX; mouse.y = e.clientY; }
    function onOut() { mouse.x = mouse.y = -9999; }
    function later() { clearTimeout(timer); timer = setTimeout(homes, 120); }
    timer = setTimeout(homes, 150);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    function onUp(e) { if (e.pointerType !== 'mouse') onOut(); }
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onOut); window.addEventListener('resize', later);
    raf = requestAnimationFrame(frame);
    return function () {
      cancelAnimationFrame(raf); clearTimeout(timer);
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onOut); window.removeEventListener('resize', later);
    };
  };

  /* ── 5. embers ─────────────────────────────────────────────────────────
     Slow glowing particles; the pointer attracts and brightens them, and
     nearby ones link up with faint lines (from the old About page).         */
  SPA.fx.embers = function (canvas, o) {
    o = o || {};
    var host = canvas.parentNode, ctx = canvas.getContext('2d');
    var count = o.count || 90, reach = o.radius || 180, hue = o.hue === undefined ? 25 : o.hue, spread = o.spread || 20;
    var ps = [], W = 0, H = 0, dpr = 1, raf = 0, mouse = { x: -9999, y: -9999 };
    function size() {
      W = host.clientWidth; H = host.clientHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      if (!ps.length) for (var i = 0; i < count; i++) ps.push({ x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: 1.5 + Math.random() * 2.5,
        hue: hue + (Math.random() - 0.5) * spread * 2, alpha: 0.3 + Math.random() * 0.4, pulse: Math.random() * 6.283 });
    }
    function frame(now) {
      if (!REDUCE) raf = requestAnimationFrame(frame);
      var box = canvas.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var t = now / 1000, r2 = reach * reach, i, j, p;
      for (i = 0; i < ps.length; i++) {
        p = ps[i];
        var dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy, near = 0;
        if (d2 < r2 && d2 > 0) { var d = Math.sqrt(d2); near = 1 - d / reach; p.vx += dx / d * near * 0.6; p.vy += dy / d * near * 0.6; }
        p.near = near;
        p.vx *= 0.96; p.vy *= 0.96; p.x += p.vx; p.y += p.vy;
        if (Math.abs(p.vx) + Math.abs(p.vy) < 0.08) { p.vx += (Math.random() - 0.5) * 0.06; p.vy += (Math.random() - 0.5) * 0.06; }   /* never quite still */
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
        var s = p.size + Math.sin(t * 1.5 + p.pulse) * 0.8 + near * 4, al = p.alpha + near * 0.5;
        var hh = p.hue + near * 15, light = 45 + near * 25, sat = 85 + near * 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, s * 3, 0, 6.283);
        ctx.fillStyle = 'hsla(' + hh + ',' + sat + '%,' + (light - 10) + '%,' + (al * 0.15) + ')'; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(s, 0.5), 0, 6.283);
        ctx.fillStyle = 'hsla(' + hh + ',' + sat + '%,' + light + '%,' + al + ')'; ctx.fill();
      }
      ctx.lineWidth = 0.5;
      for (i = 0; i < ps.length; i++) {
        if (!ps[i].near) continue;
        for (j = i + 1; j < ps.length; j++) {
          if (!ps[j].near) continue;
          var gap = Math.hypot(ps[j].x - ps[i].x, ps[j].y - ps[i].y);
          if (gap < 100) {
            ctx.strokeStyle = 'hsla(' + (ps[i].hue + ps[j].hue) / 2 + ',80%,50%,' + ((1 - gap / 100) * 0.3) + ')';
            ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.stroke();
          }
        }
      }
    }
    function onMove(e) { var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }
    function onOut() { mouse.x = mouse.y = -9999; }
    size(); window.addEventListener('resize', size);
    host.addEventListener('pointermove', onMove); host.addEventListener('pointerleave', onOut);
    raf = requestAnimationFrame(frame);
    return function () {
      cancelAnimationFrame(raf); window.removeEventListener('resize', size);
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onOut);
    };
  };

  /* ── 6. the star cursor ────────────────────────────────────────────────
     On mouse devices the arrow is swapped for a four-pointed star with a
     tiny companion. It twinkles, whirls over anything clickable and steps
     aside for the text cursor inside form fields.                           */
  var STAR = 'M16 1C17.2 10.5 21.5 14.8 31 16C21.5 17.2 17.2 21.5 16 31C14.8 21.5 10.5 17.2 1 16C10.5 14.8 14.8 10.5 16 1Z';
  SPA.fx.cursor = function () {
    if (REDUCE || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var NS = 'http://www.w3.org/2000/svg';
    function star(cls) {
      var svg = document.createElementNS(NS, 'svg'), path = document.createElementNS(NS, 'path');
      svg.setAttribute('viewBox', '0 0 32 32'); svg.setAttribute('class', cls); path.setAttribute('d', STAR);
      svg.appendChild(path); return svg;
    }
    var el = document.createElement('div'); el.className = 'cursor'; el.setAttribute('aria-hidden', 'true');
    el.appendChild(star('cursor__big')); el.appendChild(star('cursor__small'));
    document.body.appendChild(el);
    var armed = false;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (!armed) { armed = true; document.documentElement.classList.add('has-star'); }   /* only once a real mouse shows up */
      el.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
      el.classList.add('is-on');
      var t = e.target.closest ? e.target : document.body;
      el.classList.toggle('is-text', !!t.closest('input, textarea'));
      el.classList.toggle('is-over', !!t.closest('a, button, .knot, video'));
    });
    window.addEventListener('pointerdown', function () { el.classList.add('is-down'); });
    window.addEventListener('pointerup', function () { el.classList.remove('is-down'); });
    document.documentElement.addEventListener('mouseleave', function () { el.classList.remove('is-on'); });
  };
})();
