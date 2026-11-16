/* ════════════════════════════════════════════════════════════════════════
   core.js — tiny helpers shared by every view: element builder, media
   lookups, the "post" viewer (lightbox) and the hash router.
   No framework, no build step. Content comes from content.js.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var C = window.SPA_CONTENT;
  var M = window.SPA_MEDIA || { images: {}, videos: {} };
  var SPA = window.SPA = { C: C, M: M, views: {}, panels: {} };

  /* ── element builder: h('div.card', {onclick: fn}, child, 'text') ────── */
  SPA.h = function h(spec, attrs) {
    var parts = spec.split('.');
    var el = document.createElement(parts[0] || 'div');
    if (parts.length > 1) el.className = parts.slice(1).join(' ');
    var i = 1;
    if (attrs && typeof attrs === 'object' && !(attrs instanceof Node) && !Array.isArray(attrs)) {
      i = 2;
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'style' && typeof v === 'object') {
          Object.keys(v).forEach(function (p) {
            if (p.slice(0, 2) === '--') el.style.setProperty(p, v[p]); else el.style[p] = v[p];
          });
        }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'html') el.innerHTML = v;
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  };
  function append(el, kid) {
    if (kid === null || kid === undefined || kid === false) return;
    if (Array.isArray(kid)) kid.forEach(function (k) { append(el, k); });
    else el.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  var h = SPA.h;

  SPA.pad = function (n, len) { n = String(n); while (n.length < (len || 2)) n = '0' + n; return n; };

  /* ── media ───────────────────────────────────────────────────────────── */
  SPA.info = function (key) { return M.images[key] || null; };
  SPA.src = function (key, thumb) {
    var i = M.images[key];
    return 'media/' + ((i && i.src) || key) + (thumb ? '.t' : '') + '.webp';
  };
  SPA.ratio = function (key) { var i = M.images[key]; return i ? i.w / i.h : 1; };

  /* img('gd/pegasus', {thumb:true, alt:'…', cls:'x', eager:true}) */
  SPA.img = function (key, o) {
    o = o || {};
    var i = M.images[key];
    if (!i) { console.warn('[spa] unknown image key:', key); }
    var el = document.createElement('img');
    el.src = SPA.src(key, o.thumb !== false);
    el.alt = o.alt || '';
    if (i) { el.width = i.w; el.height = i.h; }
    el.loading = o.eager ? 'eager' : 'lazy';
    el.decoding = 'async';
    el.draggable = false;
    if (o.cls) el.className = o.cls;
    return el;
  };
  SPA.videoInfo = function (slug) { return M.videos[slug] || null; };
  SPA.videoSrc = function (slug) { return 'media/video/' + slug + '.mp4'; };
  SPA.posterSrc = function (slug) { return 'media/video/' + slug + '.webp'; };
  SPA.clock = function (sec) {
    sec = Math.max(0, Math.round(sec || 0));
    return SPA.pad(Math.floor(sec / 60)) + ':' + SPA.pad(sec % 60);
  };

  /* ── post viewer: image/video on the left, notes on the right ────────── */
  var post = { el: null, items: [], i: 0, lastFocus: null };

  SPA.openPost = function (items, index) {
    post.items = items; post.i = index || 0;
    post.lastFocus = document.activeElement;
    if (!post.el) buildPost();
    document.body.appendChild(post.el);
    document.documentElement.classList.add('is-locked');
    drawPost();
    post.el.querySelector('.post__close').focus();
  };
  SPA.closePost = function () {
    if (!post.el || !post.el.parentNode) return;
    var v = post.el.querySelector('video'); if (v) v.pause();
    post.el.parentNode.removeChild(post.el);
    document.documentElement.classList.remove('is-locked');
    if (post.lastFocus && post.lastFocus.focus) post.lastFocus.focus();
  };
  function stepPost(d) {
    if (post.items.length < 2) return;
    post.i = (post.i + d + post.items.length) % post.items.length;
    drawPost();
  }
  function buildPost() {
    var media = h('div.post__media',
      h('div.post__stage'),
      h('button.post__arrow.post__arrow--prev', { type: 'button', 'aria-label': 'Previous photo', onclick: function () { stepPost(-1); } }, '←'),
      h('button.post__arrow.post__arrow--next', { type: 'button', 'aria-label': 'Next photo', onclick: function () { stepPost(1); } }, '→'),
      h('span.post__count'));
    post.el = h('div.post', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Work viewer',
      onclick: function (e) { if (e.target === post.el) SPA.closePost(); } },
      h('div.post__frame',
        media,
        h('aside.post__side',
          h('header.post__head',
            h('span.post__avatar', { 'aria-hidden': 'true' }),
            h('span.post__handle', C.site.name),
            h('button.post__close', { type: 'button', 'aria-label': 'Close', onclick: SPA.closePost }, '×')),
          h('div.post__body'),
          h('footer.post__thumbs', { 'aria-label': 'All photos in this stack' }))));
    /* swipe left / right on touch screens */
    var sx = null;
    media.addEventListener('pointerdown', function (e) { sx = e.pointerType === 'touch' ? e.clientX : null; });
    media.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 45) stepPost(dx < 0 ? 1 : -1);
    });
    media.addEventListener('pointercancel', function () { sx = null; });
    document.addEventListener('keydown', function (e) {
      if (!post.el.parentNode) return;
      if (e.key === 'Escape') SPA.closePost();
      else if (e.key === 'ArrowRight') stepPost(1);
      else if (e.key === 'ArrowLeft') stepPost(-1);
    });
  }
  function drawPost() {
    var it = post.items[post.i];
    var stage = post.el.querySelector('.post__stage');
    var body = post.el.querySelector('.post__body');
    var thumbs = post.el.querySelector('.post__thumbs');
    stage.textContent = ''; body.textContent = '';
    if (it.video) {
      stage.appendChild(h('video', { src: SPA.videoSrc(it.video), poster: SPA.posterSrc(it.video),
        controls: true, autoplay: true, loop: true, playsinline: true }));
    } else {
      stage.appendChild(SPA.img(it.img, { thumb: false, eager: true, alt: it.title || '' }));
    }
    if (it.title) body.appendChild(h('h2.post__title', it.title));
    if (it.category) body.appendChild(h('p.post__cat', it.category));
    (Array.isArray(it.text) ? it.text : (it.text ? [it.text] : [])).forEach(function (p) {
      body.appendChild(h('p.post__text', p));
    });
    var many = post.items.length > 1;
    post.el.classList.toggle('is-single', !many);
    post.el.querySelector('.post__count').textContent = SPA.pad(post.i + 1) + ' / ' + SPA.pad(post.items.length);
    if (post.thumbsFor !== post.items) {              /* build the strip once per stack */
      post.thumbsFor = post.items;
      thumbs.textContent = '';
      if (many) post.items.forEach(function (x, n) {
        thumbs.appendChild(h('button', { type: 'button', 'aria-label': 'Photo ' + (n + 1),
          onclick: function () { post.i = n; drawPost(); } },
          h('img', { src: x.video ? SPA.posterSrc(x.video) : SPA.src(x.img, true), alt: '', loading: 'lazy' })));
      });
    }
    thumbs.querySelectorAll('button').forEach(function (b, n) {
      b.classList.toggle('is-on', n === post.i);
      if (n === post.i && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }

  /* Turn a list of image keys into viewer items sharing one caption. */
  SPA.asPosts = function (keys, meta) {
    meta = meta || {};
    return keys.map(function (k) {
      return { img: k, title: meta.title, category: meta.category, text: meta.text };
    });
  };

  /* A clickable picture that opens the viewer. */
  SPA.shot = function (key, items, index, o) {
    o = o || {};
    return h('button.shot' + (o.cls ? '.' + o.cls : ''), { type: 'button',
      'aria-label': 'Open ' + ((items[index] && items[index].title) || 'image'),
      onclick: function () { SPA.openPost(items, index); } },
      SPA.img(key, { thumb: o.thumb !== false, alt: (items[index] && items[index].title) || '', eager: o.eager }));
  };

  /* ── sideways scrollers: arrow buttons + drag-to-pan ─────────────────── */
  SPA.sideways = function (scroller) {
    var down = null;
    scroller.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (e.target.closest('button, a, input, textarea, video')) return;
      down = { x: e.clientX, left: scroller.scrollLeft };
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      scroller.scrollLeft = down.left - (e.clientX - down.x);
    });
    window.addEventListener('pointerup', function () { down = null; });
    var step = function (d) { scroller.scrollBy({ left: d * Math.max(320, scroller.clientWidth * 0.6), behavior: 'smooth' }); };
    return h('div.pager',
      h('button.pager__btn', { type: 'button', 'aria-label': 'Scroll left', onclick: function () { step(-1); } }, '←'),
      h('button.pager__btn', { type: 'button', 'aria-label': 'Scroll right', onclick: function () { step(1); } }, '→'));
  };

  /* ── router ──────────────────────────────────────────────────────────── */
  var cleanup = null;
  SPA.onLeave = function (fn) { var prev = cleanup; cleanup = function () { if (prev) prev(); fn(); }; };

  function parseHash() {
    return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  }
  function render() {
    var parts = parseHash();
    var name = parts[0] || 'home';
    var view = SPA.views[name] || SPA.views.home;
    if (!SPA.views[name]) name = 'home';
    if (cleanup) { try { cleanup(); } catch (err) { console.error(err); } cleanup = null; }
    SPA.closePost();
    var root = document.getElementById('view');
    root.textContent = '';
    root.className = 'view view--' + name;
    document.body.setAttribute('data-view', name);
    var el = view(parts.slice(1));
    root.appendChild(el);
    root.scrollTop = 0; window.scrollTo(0, 0);
    document.querySelectorAll('.nav__link').forEach(function (a) {
      var on = a.getAttribute('data-route') === (name === 'home' ? '' : name);
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.body.classList.remove('nav-open');
    var label = { home: '', projects: 'Projects', highlights: 'Highlights', vocabulary: 'Vocabulary', about: 'About', contact: 'Contact' }[name];
    document.title = (label ? label + ' — ' : '') + C.site.name;
  }

  function buildHeader() {
    var nav = document.getElementById('nav');
    C.nav.forEach(function (n) {
      nav.appendChild(h('a.nav__link', { href: '#/' + n.route, 'data-route': n.route }, n.label));
    });
    document.getElementById('nav-toggle').addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  SPA.start = function () {
    buildHeader();
    window.addEventListener('hashchange', render);
    render();
  };
})();
