/* ════════════════════════════════════════════════════════════════════════
   shop.js — the Shop page: a shelf of products that scrolls sideways and a
   wire basket underneath. Grab a product and drop it in. Nothing is paid
   for here: "Send order request" hands the basket to the Contact form.
   Products, prices and texts live in content.js under "shop".
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SPA = window.SPA, C = SPA.C, h = SPA.h, pad = SPA.pad;
  var NS = 'http://www.w3.org/2000/svg';

  /* ── the basket: lives for the whole visit, kept across reloads when allowed ── */
  var KEY = 'spa-basket', items = {}, watchers = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (err) { items = {}; }
  function known(id) { return C.shop.products.filter(function (p) { return p.id === id; })[0]; }
  Object.keys(items).forEach(function (id) { if (!known(id) || !(items[id] > 0)) delete items[id]; });

  function changed(id) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (err) { /* private mode: keep it in memory */ }
    badge();
    watchers.forEach(function (fn) { fn(id); });
  }
  function count() { return Object.keys(items).reduce(function (n, id) { return n + items[id]; }, 0); }
  function badge() {
    var link = document.querySelector('.nav__link[data-route="shop"]');
    if (!link) return;
    var n = count(), tag = link.querySelector('.nav__count');
    if (!tag) { tag = h('span.nav__count', { 'aria-hidden': 'true' }); link.appendChild(tag); }
    tag.textContent = n ? n : '';
    link.setAttribute('aria-label', n ? 'Shop, ' + n + ' in basket' : 'Shop');
  }
  SPA.basket = {
    count: count, badge: badge,
    add: function (id, n) { items[id] = Math.min(99, (items[id] || 0) + (n || 1)); changed(id); },
    set: function (id, n) { if (n > 0) items[id] = Math.min(99, n); else delete items[id]; changed(null); },
    clear: function () { items = {}; changed(null); },
    lines: function () {
      return Object.keys(items).map(function (id) { return { p: known(id), n: items[id] }; });
    }
  };

  function svg(tag, attrs, kids) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (k) { el.appendChild(k); });
    return el;
  }

  /* ── the wire basket, drawn in two layers so things can sit inside it ──── */
  function wire(front) {
    var W = 420, kids = [], i, t;
    var rim = { cx: 210, cy: 112, rx: 182, ry: 24 }, base = { cx: 210, cy: 262, rx: 142, ry: 16 };
    function at(e, a) { return [e.cx + Math.cos(a) * e.rx, e.cy + Math.sin(a) * e.ry]; }
    function arc(e, half) {                     /* half: 1 = front (lower) arc, -1 = back (upper) arc */
      return 'M' + (e.cx - e.rx) + ' ' + e.cy + ' A' + e.rx + ' ' + e.ry + ' 0 0 ' + (half > 0 ? 0 : 1) + ' ' + (e.cx + e.rx) + ' ' + e.cy;
    }
    if (!front) {
      kids.push(svg('path', { 'class': 'bk__handle', d: 'M52 106 C 60 -6, 360 -6, 368 106' }));
      kids.push(svg('path', { 'class': 'bk__grip', d: 'M150 26 C 190 18, 230 18, 270 26' }));
      for (i = 1; i < 12; i++) {                /* back wires, seen through the basket */
        t = Math.PI + (Math.PI * i) / 12;
        kids.push(svg('line', { 'class': 'bk__wire bk__wire--back', x1: at(rim, t)[0], y1: at(rim, t)[1], x2: at(base, t)[0], y2: at(base, t)[1] }));
      }
      kids.push(svg('path', { 'class': 'bk__rim bk__rim--back', d: arc(rim, -1) }));
      kids.push(svg('ellipse', { 'class': 'bk__floor', cx: base.cx, cy: base.cy, rx: base.rx, ry: base.ry }));
    } else {
      kids.push(svg('path', { 'class': 'bk__glass', d: arc(rim, 1) + ' L' + (base.cx + base.rx) + ' ' + base.cy +
        ' A' + base.rx + ' ' + base.ry + ' 0 0 1 ' + (base.cx - base.rx) + ' ' + base.cy + ' Z' }));
      for (i = 0; i <= 14; i++) {               /* front wires */
        t = (Math.PI * i) / 14;
        kids.push(svg('line', { 'class': 'bk__wire', x1: at(rim, t)[0], y1: at(rim, t)[1], x2: at(base, t)[0], y2: at(base, t)[1] }));
      }
      [0.3, 0.58, 0.82].forEach(function (k) {  /* hoops */
        var e = { cx: 210, cy: rim.cy + (base.cy - rim.cy) * k, rx: rim.rx + (base.rx - rim.rx) * k, ry: rim.ry + (base.ry - rim.ry) * k };
        kids.push(svg('path', { 'class': 'bk__wire', d: arc(e, 1) }));
      });
      kids.push(svg('path', { 'class': 'bk__rim', d: arc(base, 1) }));
      kids.push(svg('path', { 'class': 'bk__rim', d: arc(rim, 1) }));
      kids.push(svg('path', { 'class': 'bk__handle bk__handle--front', d: 'M58 124 C 86 208, 334 208, 362 124' }));
      kids.push(svg('path', { 'class': 'bk__grip', d: 'M158 184 C 192 190, 228 190, 262 184' }));
    }
    return svg('svg', { 'class': 'bk__svg' + (front ? ' bk__svg--front' : ''), viewBox: '0 -8 ' + W + ' 300', 'aria-hidden': 'true' }, kids);
  }
  /* where the things stand: [centre x %, distance from the bottom %, tilt deg] — later ones are nearer the front */
  var SLOTS = [[50, 17, -3], [30, 16, -13], [70, 16, 12], [40, 13, 7], [61, 13, -8], [22, 12, -19], [79, 12, 18], [50, 9, 2], [34, 8, -9], [66, 8, 10]];

  SPA.views.shop = function () {
    var S = C.shop, cur = S.currency || '€';
    var P = S.products.filter(function (p) { return SPA.info(p.img); });
    function money(n) { return cur + ' ' + (Math.round(n * 100) % 100 ? n.toFixed(2) : String(n)); }

    var posts = P.map(function (p) {
      return { img: p.img, title: p.title, category: p.kind + ' · ' + money(p.price), text: p.text,
        facts: [['Kind', p.kind], ['Size', p.size || '—'], ['Price', money(p.price)]],
        action: { label: 'Add to basket +', run: function () { add(p); } } };
    });

    /* ── basket ── */
    var inside = h('div.bk__inside', { 'aria-hidden': 'true' });
    var dot = h('span.bk__count', { 'aria-hidden': 'true' });
    var bk = h('div.bk', { role: 'img', 'aria-label': 'Shopping basket' }, wire(false), inside, wire(true), dot);
    var fresh = null;

    /* ── receipt ── */
    var lines = h('ol.till__lines'), total = h('b'), empty = h('p.till__empty', 'Nothing in here yet. Pull something down from the shelf.');
    var live = h('p.till__live', { role: 'status', 'aria-live': 'polite' });
    var tally = h('span.till__no');
    var send = h('button.btn.btn--solid.till__send', { type: 'button', onclick: order }, 'Send order request ', h('span.arrow', { 'aria-hidden': 'true' }, '——>'));
    var clear = h('button.till__clear', { type: 'button', onclick: function () { SPA.basket.clear(); live.textContent = 'Basket emptied.'; } }, 'Empty the basket');
    var till = h('section.till', { 'aria-label': 'Your basket' },
      h('header.till__head', h('h2', 'Basket'), tally),
      lines, empty,
      h('p.till__total', h('span', 'Total'), total),
      h('div.till__row', send, clear),
      S.note ? h('p.till__note', S.note) : null,
      live);

    function add(p) {
      fresh = p.id;
      SPA.basket.add(p.id);
      live.textContent = p.title + ' is in the basket.';
      bk.classList.remove('is-bump'); void bk.offsetWidth; bk.classList.add('is-bump');
    }

    function draw() {
      var L = SPA.basket.lines(), n = SPA.basket.count(), sum = 0, units = [];
      lines.textContent = '';
      L.forEach(function (l) {
        sum += l.p.price * l.n;
        for (var k = 0; k < l.n; k++) units.push(l.p);
        lines.appendChild(h('li.till__line',
          h('span.till__name', l.p.title, h('i', l.p.kind)),
          h('span.till__qty',
            h('button', { type: 'button', 'aria-label': 'One less ' + l.p.title, onclick: function () { SPA.basket.set(l.p.id, l.n - 1); } }, '−'),
            h('span', { 'aria-label': 'Quantity' }, String(l.n)),
            h('button', { type: 'button', 'aria-label': 'One more ' + l.p.title, onclick: function () { fresh = l.p.id; SPA.basket.set(l.p.id, l.n + 1); } }, '+')),
          h('span.till__price', money(l.p.price * l.n))));
      });
      empty.hidden = n > 0; lines.hidden = !n;
      total.textContent = money(sum);
      send.disabled = !n; clear.hidden = !n;
      dot.textContent = n || ''; dot.hidden = !n;
      tally.textContent = n + (n === 1 ? ' thing' : ' things');
      /* what you can see poking out of the basket (the last ten things) */
      inside.textContent = '';
      units = units.slice(-SLOTS.length);
      var newest = -1;
      units.forEach(function (p, k) { if (p.id === fresh) newest = k; });
      units.forEach(function (p, k) {
        var s = SLOTS[k], r = SPA.ratio(p.img);
        var el = h('span.bk__thing' + (k === newest ? '.is-new' : '') + (r > 1.15 ? '.is-wide' : ''), { style: {
          left: s[0] + '%', bottom: s[1] + '%', zIndex: k + 1, '--r': s[2] + 'deg' } },
          SPA.img(p.img, { alt: '' }));
        inside.appendChild(el);
      });
      fresh = null;
    }

    function order() {
      var L = SPA.basket.lines(); if (!L.length) return;
      var sum = 0, text = ['Hi Ema, I would like to order:', ''];
      L.forEach(function (l) {
        sum += l.p.price * l.n;
        text.push(l.n + ' × ' + l.p.title + ' (' + l.p.kind + (l.p.size ? ', ' + l.p.size : '') + ') — ' + money(l.p.price * l.n));
      });
      text.push('', 'Total: ' + money(sum), '', 'Ship to: ');
      SPA.draft = { subject: 'Shop order: ' + SPA.basket.count() + (SPA.basket.count() === 1 ? ' item' : ' items'), message: text.join('\n') };
      location.hash = '#/contact';
    }

    /* ── shelf ── */
    var track = h('div.shelf__track');
    var rail = h('div.shelf', { tabindex: '0', 'aria-label': 'Products. Scroll sideways.' }, track);
    P.forEach(function (p, i) {
      var pic = h('div.prod__pic', { 'data-grab': '' }, SPA.img(p.img, { alt: p.title, eager: i < 6 }));
      var card = h('article.prod', { 'data-id': p.id },
        h('div.prod__row', h('span.prod__k', 'No.'), h('span.prod__v', pad(i + 1)), h('span.prod__kind', p.kind)),
        pic,
        h('div.prod__row', h('span.prod__k', 'Title'), h('button.prod__v.prod__title', { type: 'button', onclick: function () { SPA.openPost(posts, i); } }, p.title)),
        h('div.prod__row.prod__row--buy', h('span.prod__price', money(p.price)),
          h('button.prod__add', { type: 'button', 'aria-label': 'Add ' + p.title + ' to the basket', onclick: function () { add(p); } }, 'Add +')));
      track.appendChild(card);
      carry(pic, p, i);
    });

    /* pick a product up; let go over the basket to keep it */
    function carry(pic, p, i) {
      var ghost = null, from = null, over = false;
      SPA.grab(pic, {
        begin: function (e, dx, dy) {
          /* a finger moving sideways scrolls the shelf; pulling up or down picks the thing up */
          if (e.pointerType === 'touch' && Math.abs(dx) > Math.abs(dy)) return false;
          var im = pic.querySelector('img'), r = im.getBoundingClientRect();
          from = { x: r.left, y: r.top, w: r.width, h: r.height, px: e.clientX - dx, py: e.clientY - dy };
          ghost = h('img.shop__ghost', { src: im.currentSrc || im.src, alt: '', style: { width: r.width + 'px', height: r.height + 'px', left: r.left + 'px', top: r.top + 'px' } });
          document.body.appendChild(ghost);
          pic.classList.add('is-out'); document.documentElement.classList.add('is-carrying');
        },
        move: function (e, dx, dy) {
          var tilt = Math.max(-14, Math.min(14, dx * 0.04));
          ghost.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0) rotate(' + tilt + 'deg) scale(0.86)';
          var b = bk.getBoundingClientRect();
          over = e.clientX > b.left - 30 && e.clientX < b.right + 30 && e.clientY > b.top - 40 && e.clientY < b.bottom + 40;
          bk.classList.toggle('is-hot', over);
        },
        end: function (e, cancelled) {
          var g = ghost, b = bk.getBoundingClientRect(); ghost = null;
          bk.classList.remove('is-hot'); document.documentElement.classList.remove('is-carrying');
          g.classList.add('is-landing');
          if (over && !cancelled) {
            var tx = b.left + b.width / 2 - (from.x + from.w / 2), ty = b.top + b.height * 0.42 - (from.y + from.h / 2);
            g.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) rotate(-6deg) scale(0.22)';
            g.style.opacity = '0.2';
            setTimeout(function () { add(p); }, 190);
          } else {
            g.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
          }
          setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); pic.classList.remove('is-out'); }, 300);
          over = false;
        },
        tap: function () { SPA.openPost(posts, i); }
      });
    }

    /* the mouse wheel moves the shelf sideways while it still has somewhere to go */
    rail.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.ctrlKey) return;
      var max = rail.scrollWidth - rail.clientWidth;
      if ((e.deltaY > 0 && rail.scrollLeft >= max - 1) || (e.deltaY < 0 && rail.scrollLeft <= 0)) return;
      e.preventDefault(); rail.scrollLeft += e.deltaY;
    }, { passive: false });

    watchers.push(draw);
    SPA.onLeave(function () {
      watchers = watchers.filter(function (fn) { return fn !== draw; });
      document.documentElement.classList.remove('is-carrying');
      Array.prototype.forEach.call(document.querySelectorAll('.shop__ghost'), function (g) { g.parentNode.removeChild(g); });
    });
    draw();

    return h('div.shop',
      h('header.shop__head',
        h('div', h('p.eyebrow', '— shop —'), h('h1.page__title', S.title)),
        h('p.lede', S.intro),
        S.status ? h('span.tape.shop__status', S.status) : null),
      h('div.shop__shelf', rail, SPA.sideways(rail)),
      h('p.shop__hint', h('span', { 'aria-hidden': 'true' }, '↓'), ' Grab a thing and drop it in the basket ', h('span', { 'aria-hidden': 'true' }, '↓')),
      h('div.shop__floor', h('div.shop__basket', bk), till),
      SPA.footer());
  };
})();
