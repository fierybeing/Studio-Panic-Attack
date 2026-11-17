/* ════════════════════════════════════════════════════════════════════════
   random.js — the Random page and its five toys:
     01 Vocabulary (drawn by pages.js)   02 Curiosity cards   03 Dress-up
     04 Cardboard castle                 05 Shadowrealm
   Titles, questions and "things I like" live in content.js under "random".
   The drawings (doll, clothes, castle, tent, shadows) are made in code here,
   so there are no extra image files to keep track of.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SPA = window.SPA, C = SPA.C, h = SPA.h, pad = SPA.pad;
  var NS = 'http://www.w3.org/2000/svg';
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toys = {};

  /* small helpers */
  function svg(markup, cls, box) {                 /* an <svg> from a string of shapes */
    var el = document.createElementNS(NS, 'svg');
    el.setAttribute('viewBox', box); if (cls) el.setAttribute('class', cls);
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = markup;
    return el;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function shuffle(list) {
    var a = list.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function arrow() { return h('span.arrow', { 'aria-hidden': 'true' }, '——>'); }
  var STAR = 'M16 1C17.2 10.5 21.5 14.8 31 16C21.5 17.2 17.2 21.5 16 31C14.8 21.5 10.5 17.2 1 16C10.5 14.8 14.8 10.5 16 1Z';

  /* ── the page: a numbered list of the toys, or one toy with a strip to hop between them ── */
  SPA.views.random = function (parts) {
    var R = C.random, P = R.projects, at = -1;
    P.forEach(function (p, i) { if (p.slug === parts[0]) at = i; });
    if (at < 0 || !toys[P[at].slug]) return overview(R);
    return h('div.rnd.rnd--' + P[at].slug,
      h('nav.rbar', { 'aria-label': 'Random projects' },
        h('a.rbar__back', { href: '#/random' }, '← Random'),
        h('ol.rbar__list', P.map(function (p, i) {
          return h('li', h('a.rbar__link' + (i === at ? '.is-on' : ''), { href: '#/random/' + p.slug, 'aria-current': i === at ? 'page' : null },
            h('span', pad(i + 1)), ' ' + p.title));
        }))),
      toys[P[at].slug](P[at], at));
  };

  var GLYPHS = {
    vocabulary: '<text x="60" y="88" text-anchor="middle" class="g-letter">A</text><path d="M22 104h76"/>',
    cards: '<rect x="26" y="24" width="50" height="76" rx="6" transform="rotate(-12 51 62)"/><rect x="46" y="22" width="50" height="76" rx="6" transform="rotate(9 71 60)" class="g-fill"/><path transform="translate(57 46) scale(0.9)" d="' + STAR + '" class="g-ink"/>',
    'dress-up': '<path d="M60 26a7 7 0 1 0-7-7M60 26v8M60 34L24 52h72Z"/><path d="M40 52l-12 52h64L80 52" class="g-fill"/><path d="M44 70h32M40 86h40"/>',
    castle: '<path d="M18 104V48h8v-8h8v8h8v-8h8v8h4V30h8v-8h8v8h8v-8h8v22h4v-6h8v6h8v-6h4v64Z" class="g-fill"/><path d="M52 104V84a8 8 0 0 1 16 0v20M30 62h8v10h-8zM82 62h8v10h-8z"/><path d="M60 22V8l12 4-12 4"/>',
    shadowrealm: '<path d="M14 104V58C30 54 40 40 42 22c2 18 10 30 18 34 8-4 16-16 18-34 2 18 12 32 28 36v46Z" class="g-fill"/><path d="M48 104V74c4 6 8 8 12 8s8-2 12-8v30"/><path d="M42 22V8l10 3-10 3M78 22V8l10 3-10 3"/>'
  };
  /* the five toys as loose cut-outs you can push around; a click opens one */
  var SCATTER = {                       /* left %, top %, width %, tilt */
    vocabulary: [1, 20, 17, -7], cards: [22, 50, 13, 5], 'dress-up': [40.5, 2, 9.5, 3], castle: [53, 33, 25, -2], shadowrealm: [79, 3, 20.5, 4]
  };
  var WORDS = [[5, 80], [23, 22], [35, 90], [55, 14], [69, 93], [86, 70], [14, 4]];
  function preview(slug) {
    if (slug === 'vocabulary') return SPA.info(C.vocabulary.entries[0].img) ? SPA.img(C.vocabulary.entries[0].img, { alt: '', eager: true }) : null;
    if (slug === 'cards') return h('span.sc__cards', h('i.qback'), h('i.sc__face', h('b', 'IV'), h('span', C.random.cards.decks[1].questions[3]), h('small', C.random.cards.decks[1].name)));
    if (slug === 'dress-up') {
      var on = {}; GARMENTS.forEach(function (g) { on[g.id] = g.art; });
      return svg(DOLL + on.boots + on.skirt + on.sweater + on.hat, 'sc__doll', '30 -72 240 780');
    }
    if (slug === 'castle') {
      return svg(castleArt() + FLAPS.concat([DOOR]).map(function (b) {
        var r = b[2] / 2;
        return '<path d="M' + b[0] + ' ' + (b[1] + b[3]) + 'V' + (b[1] + r) + 'a' + r + ' ' + r + ' 0 0 1 ' + b[2] + ' 0V' + (b[1] + b[3]) + 'Z" fill="#ffc65e" stroke="#5d4128" stroke-width="4"/>';
      }).join(''), 'sc__castle', '0 0 1000 770');
    }
    if (slug === 'shadowrealm') return svg(tentBack() + tentFront(), 'sc__tent', '0 0 1000 780');
    return null;
  }
  function scatter(R) {
    var box = h('div.sc', { 'aria-hidden': 'true' });
    WORDS.forEach(function (w, i) {
      var p = R.projects[i % R.projects.length];
      box.appendChild(h('span.sc__word', { style: { left: w[0] + '%', top: w[1] + '%' } }, i < R.projects.length ? p.kind : (i % 2 ? 'poke at them' : 'side quests')));
    });
    R.projects.forEach(function (p, i) {
      var s = SCATTER[p.slug], pic = preview(p.slug);
      if (!s || !pic) return;
      var a = h('a.sc__item.sc__item--' + p.slug, { href: '#/random/' + p.slug, draggable: 'false', tabindex: '-1',
        style: { left: s[0] + '%', top: s[1] + '%', width: s[2] + '%', '--r': s[3] + 'deg', '--dur': (5 + i * 0.9) + 's' },
        ondragstart: function (e) { e.preventDefault(); } },
        h('span.sc__bob', pic), h('span.sc__tag', h('b', pad(i + 1)), ' ' + p.title));
      var ox = 0, oy = 0, sx, sy;
      SPA.grab(a, {
        begin: function () { sx = ox; sy = oy; a.classList.add('is-held'); },
        move: function (e, dx, dy) { ox = sx + dx; oy = sy + dy; a.style.transform = 'translate(' + ox + 'px,' + oy + 'px)'; },
        end: function () { a.classList.remove('is-held'); }
      });
      box.appendChild(a);
    });
    return box;
  }
  function overview(R) {
    return h('div.page.random',
      h('header.page__head', h('p.eyebrow', '— random —'), h('h1.page__title', R.title), h('p.lede', R.intro)),
      scatter(R),
      h('ol.rlist', R.projects.map(function (p, i) {
        return h('li', h('a.rrow', { href: '#/random/' + p.slug },
          h('span.rrow__no', { 'aria-hidden': 'true' }, pad(i + 1)),
          svg(GLYPHS[p.slug] || '', 'rrow__glyph', '0 0 120 120'),
          h('span.rrow__title', p.title),
          h('span.rrow__text', h('b', p.kind), p.text),
          h('span.go.rrow__go', 'Open ', arrow())));
      })),
      SPA.footer());
  }
  function head(p, i, intro) {
    return h('header.toy__head',
      h('p.eyebrow', '— ' + pad(i + 1) + ' / ' + p.kind + ' —'),
      h('h1.page__title', p.title),
      intro ? h('p.lede', intro) : null);
  }

  /* ── 01 VOCABULARY ───────────────────────────────────────────────────── */
  toys.vocabulary = function () { return SPA.vocabulary(); };

  /* ── 02 CURIOSITY CARDS ──────────────────────────────────────────────────
     Two decks on a dark table. Click a deck to deal a card, click a card to
     turn it over, drag cards around. Once a question is on the table the
     matchbox opens; carry the match to the candle to light it.              */
  function roman(n) {
    var out = '', map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    map.forEach(function (m) { while (n >= m[0]) { out += m[1]; n -= m[0]; } });
    return out;
  }
  toys.cards = function (p, idx) {
    var K = C.random.cards;
    var table = h('div.ct'), glow = h('div.ct__glow', { 'aria-hidden': 'true' });
    var spot = h('span.ct__spot', { 'aria-hidden': 'true' }), discard = h('span.ct__discard', { 'aria-hidden': 'true' });
    var say = h('p.ct__say', { role: 'status', 'aria-live': 'polite' });
    var z = 10, current = null, step = 0, cards = [];
    var state = K.decks.map(function (d) { return { left: shuffle(d.questions), n: 0 }; });

    function centre(el) { var t = table.getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left - t.left + r.width / 2, r.top - t.top + r.height / 2, r.width]; }
    function put(card, x, y, r, s) {
      card._x = x; card._y = y;
      card.style.setProperty('--x', (x - card.offsetWidth / 2) + 'px'); card.style.setProperty('--y', (y - card.offsetHeight / 2) + 'px');
      if (r !== undefined) card.style.setProperty('--r', r + 'deg');
      card.style.setProperty('--s', s === undefined ? 1 : s);
    }

    var deckEls = K.decks.map(function (d, di) {
      var left = h('span.deck__left');
      var b = h('button.deck.deck--' + (di ? 'b' : 'a'), { type: 'button', onclick: function () { deal(di); } },
        h('span.deck__pile', { 'aria-hidden': 'true' }, h('i'), h('i'), h('i.qback')),
        h('span.deck__name', d.name), left);
      b._left = left;
      return b;
    });
    function counts() {
      deckEls.forEach(function (b, di) {
        var n = state[di].left.length;
        b._left.textContent = n ? n + ' left' : 'reshuffle';
        b.setAttribute('aria-label', K.decks[di].name + ' deck, ' + (n ? n + ' cards left. Draw one.' : 'empty. Reshuffle.'));
        b.classList.toggle('is-empty', !n);
      });
    }

    function deal(di) {
      var st = state[di];
      if (!st.left.length) { st.left = shuffle(K.decks[di].questions); st.n = 0; counts(); return; }
      var q = st.left.pop(); st.n++;
      var face = h('span.qcard__face',
        h('span.qcard__no', roman(st.n)),
        h('span.qcard__q', q),
        h('span.qcard__deck', K.decks[di].name));
      var card = h('div.qcard.qcard--' + (di ? 'b' : 'a'), { tabindex: '0', role: 'button', 'aria-label': 'Card, face down. Press to turn it over.' },
        h('span.qcard__in', h('span.qcard__back.qback'), face));
      card._q = q;
      card.style.zIndex = ++z;
      table.appendChild(card);
      var from = centre(deckEls[di].querySelector('.deck__pile'));
      card.classList.add('is-still');
      put(card, from[0], from[1], 0, from[2] / card.offsetWidth);
      void card.offsetWidth;
      card.classList.remove('is-still');
      if (current && cards.indexOf(current) >= 0) { var d = centre(discard); put(current, d[0] + rnd(-26, 26), d[1] + rnd(-22, 22), rnd(-16, 16)); }
      var c = centre(spot);
      put(card, c[0], c[1], rnd(-3, 3));
      current = card; cards.push(card);
      setTimeout(function () { if (card.isConnected) flip(card, true); }, REDUCE ? 0 : 420);
      hold(card);
      counts();
      if (step < 1) setStep(1);
    }
    function flip(card, up) {
      var on = up === undefined ? !card.classList.contains('is-up') : up;
      card.classList.toggle('is-up', on);
      card.setAttribute('aria-label', on ? 'Card: ' + card._q + ' Press to turn it face down.' : 'Card, face down. Press to turn it over.');
    }
    function hold(card) {
      var ox, oy;
      SPA.grab(card, {
        begin: function () { ox = card._x; oy = card._y; card.classList.add('is-held'); card.style.zIndex = ++z; },
        move: function (e, dx, dy) {
          var t = table.getBoundingClientRect();
          put(card, Math.max(20, Math.min(t.width - 20, ox + dx)), Math.max(20, Math.min(t.height - 20, oy + dy)));
        },
        end: function () { card.classList.remove('is-held'); },
        tap: function () { card.style.zIndex = ++z; flip(card); }
      });
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(card); } });
    }

    /* the ritual: matchbox + candle */
    var match = h('span.match', { 'aria-hidden': 'true' }, h('i'));
    var box = h('button.mbox', { type: 'button', onclick: openBox },
      h('span.mbox__tray', { 'aria-hidden': 'true' }, match),
      h('span.mbox__sleeve', { 'aria-hidden': 'true' }, svg('<path d="' + STAR + '"/>', 'mbox__star', '0 0 32 32'), h('b', 'Curiosity'), h('small', 'safety matches')));
    var candle = h('button.candle', { type: 'button', onclick: function () { if (step === 3) setStep(1); else if (step === 2) light(); } },
      h('span.candle__flame', { 'aria-hidden': 'true' }, h('i')),
      h('span.candle__wick', { 'aria-hidden': 'true' }),
      h('span.candle__wax', { 'aria-hidden': 'true' }),
      h('span.candle__dish', { 'aria-hidden': 'true' }));
    var SAY = ['Pick a deck and draw a card.',
      'Read it out. Talk it through. When the question has landed, try the matchbox.',
      'There is a match after all. Carry it to the candle.',
      K.done];
    function setStep(n) {
      step = n;
      table.setAttribute('data-step', n);
      say.textContent = SAY[n];
      box.setAttribute('aria-label', n === 0 ? 'Matchbox. It rattles: empty.' : n === 1 ? 'Matchbox. Open it.' : 'Matchbox, open.');
      candle.setAttribute('aria-label', n === 3 ? 'Candle, lit. Press to blow it out.' : n === 2 ? 'Candle, unlit. Press to light it with the match.' : 'Candle, unlit.');
      match.style.transform = '';
      if (n === 3) { var c = centre(candle); table.style.setProperty('--gx', c[0] + 'px'); table.style.setProperty('--gy', (c[1] - candle.offsetHeight * 0.45) + 'px'); }
    }
    function openBox() {
      if (step === 0) { box.classList.remove('is-shut'); void box.offsetWidth; box.classList.add('is-shut'); say.textContent = 'It rattles, but it is empty. Draw a card first.'; return; }
      if (step === 1) setStep(2);
    }
    function light() { if (step === 2) setStep(3); }
    SPA.grab(match, {
      begin: function () { if (step !== 2) return false; match.classList.add('is-held'); },
      move: function (e, dx, dy) { match.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(-38deg)'; },
      end: function (e) {
        match.classList.remove('is-held');
        var c = candle.getBoundingClientRect();
        var near = e.clientX > c.left - 50 && e.clientX < c.right + 50 && e.clientY > c.top - 70 && e.clientY < c.bottom;
        if (near) light(); else match.style.transform = '';
      },
      tap: function () { light(); }
    });

    function reset() {
      cards.forEach(function (card, k) {
        var di = card.classList.contains('qcard--b') ? 1 : 0, to = centre(deckEls[di].querySelector('.deck__pile'));
        flip(card, false);
        setTimeout(function () { put(card, to[0], to[1], 0, to[2] / card.offsetWidth); }, 40 + k * 30);
        setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 520 + k * 30);
      });
      cards = []; current = null;
      state = K.decks.map(function (d) { return { left: shuffle(d.questions), n: 0 }; });
      counts(); setStep(0);
    }

    table.appendChild(glow);
    table.appendChild(h('div.ct__decks', deckEls));
    table.appendChild(spot); table.appendChild(discard);
    table.appendChild(h('div.rit', box, candle));
    table.appendChild(say);
    table.appendChild(h('button.ct__reset', { type: 'button', onclick: reset }, 'Shuffle & start again ↺'));
    counts(); setStep(0);
    return h('div.toy.toy--cards', head(p, idx, K.intro), table, SPA.footer());
  };

  /* ── 03 DRESS-UP ─────────────────────────────────────────────────────────
     A jointed paper doll and a sheet of clothes. Everything is drawn in the
     doll's own units (300 wide, 700 tall), so a piece lands exactly where it
     was drawn. To add a piece: give it a name, a slot (pieces in the same slot
     swap), a layer (z), the box it fills [x, y, width, height] and its shapes. */
  var INK = '#151515', ULTRA = '#1c1ce6', RED = '#d42b2b', SKIN = '#efe3d0';
  function mirror(shapes) { return shapes + '<g transform="translate(300 0) scale(-1 1)">' + shapes + '</g>'; }
  function line(d, colour, width, extra) { return '<path d="' + d + '" fill="none" stroke="' + (colour || INK) + '" stroke-width="' + (width || 2) + '"' + (extra || '') + '/>'; }
  var PEN = '<g stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">';
  var DOLL = PEN +
    '<path d="M72 676H228L246 699H54Z" fill="#fff"/>' +                                       /* the stand */
    mirror('<path fill="' + SKIN + '" d="M156 338C150 410 158 462 162 516C158 572 162 612 164 636L158 660Q157 672 168 672L198 672Q206 670 200 660L186 636C192 588 196 540 190 490C198 430 200 384 196 332Z"/>' +
      '<path fill="' + SKIN + '" d="M196 150C212 148 222 164 224 190C228 236 230 268 232 300L238 356C242 376 232 388 224 386C216 384 214 372 216 358L210 300C206 262 200 232 190 198Z"/>') +
    '<path fill="' + SKIN + '" d="M138 104L162 104L164 138C176 146 196 146 204 156C206 190 196 230 184 268C186 296 198 320 200 348L100 348C102 320 114 296 116 268C104 230 94 190 96 156C104 146 124 146 136 138Z"/>' +
    '<path fill="#fff" d="M118 158L132 148C140 168 160 168 168 148L182 158C190 200 190 236 184 268C186 296 198 320 200 346L178 340Q150 376 122 340L100 346C102 320 114 296 116 268C110 236 110 200 118 158Z"/>' +
    '<ellipse cx="150" cy="70" rx="35" ry="42" fill="' + SKIN + '"/>' +
    '<path fill="' + ULTRA + '" d="M112 94C102 40 126 20 150 20C174 20 198 40 188 94C190 106 186 114 180 116C185 96 182 76 172 60C160 68 138 66 126 58C118 74 115 96 120 116C114 114 110 106 112 94Z"/>' +
    line('M134 76q4-5 8 0M158 76q4-5 8 0M150 82v5', INK, 2.2) +
    '<circle cx="150" cy="95" r="3.4" fill="' + RED + '" stroke="none"/>' +
    '<g fill="#d9b23c" stroke-width="1.8"><circle cx="199" cy="163" r="4.5"/><circle cx="101" cy="163" r="4.5"/><circle cx="178" cy="338" r="4.5"/><circle cx="122" cy="338" r="4.5"/></g>' +
    '</g>';
  var GARMENTS = [
    { id: 'cape', name: 'Cape', slot: 'back', z: 5, box: [28, 124, 244, 426], art: PEN +
      '<path fill="' + RED + '" d="M112 146Q150 128 188 146L266 508Q150 546 34 508Z"/>' +
      line('M98 232L72 506M202 232L228 506M150 300V526', '#9d1d1d', 2.2) +
      '<path fill="' + ULTRA + '" d="M104 132Q150 152 196 132L188 148Q150 166 112 148Z"/></g>' },
    { id: 'sweater', name: 'Sweater', slot: 'top', z: 30, box: [44, 130, 212, 236], art: PEN +
      '<path fill="' + ULTRA + '" d="M126 140Q150 160 174 140L206 150C230 160 236 200 240 250L250 352L214 360L206 264L204 334Q150 348 96 334L94 264L86 360L50 352L60 250C64 200 70 160 94 150Z"/>' +
      line('M121 146Q150 172 179 146M98 320Q150 334 202 320M54 338L88 346M212 346L246 338', '#fff', 2, ' opacity=".85"') +
      '<path transform="translate(127 198) scale(1.45)" d="' + STAR + '" fill="#fff" stroke="none"/></g>' },
    { id: 'tee', name: 'Dot tee', slot: 'top', z: 30, box: [64, 130, 172, 190], art: PEN +
      '<path fill="#fff" d="M128 140Q150 160 172 140L208 152L230 216L200 226L196 200L198 304Q150 314 102 304L104 200L100 226L70 216L92 152Z"/>' +
      line('M123 146Q150 170 177 146', INK, 1.6) +
      '<circle cx="150" cy="232" r="27" fill="' + RED + '" stroke="none"/></g>' },
    { id: 'jacket', name: 'Jacket', slot: 'outer', z: 40, box: [44, 128, 212, 240], art: PEN + mirror(
      '<path fill="#1b1b1d" d="M170 138L206 150C230 160 236 200 240 250L250 352L216 360L206 264L206 320L162 326L164 204Z"/>' +
      '<path fill="#343437" d="M170 138L164 204L192 168Z"/>' +
      line('M168 214L166 318M178 276l20-5M216 344l32-8', '#cfcfd4', 1.8) +
      '<circle cx="174" cy="232" r="2.6" fill="#cfcfd4" stroke="none"/><circle cx="173" cy="262" r="2.6" fill="#cfcfd4" stroke="none"/>') + '</g>' },
    { id: 'skirt', name: 'Skirt', slot: 'bottom', z: 24, box: [76, 250, 148, 200], art:
      '<defs><pattern id="dd-hq" width="34" height="46" patternUnits="userSpaceOnUse"><rect width="34" height="46" fill="' + RED + '"/><path d="M17 0L34 23L17 46L0 23Z" fill="' + INK + '"/></pattern></defs>' + PEN +
      '<path fill="url(#dd-hq)" d="M114 264L186 264L218 430Q150 450 82 430Z"/><rect x="111" y="256" width="78" height="15" rx="2" fill="' + INK + '"/></g>' },
    { id: 'trousers', name: 'Trousers', slot: 'bottom', z: 24, box: [84, 250, 132, 402], art:
      '<defs><pattern id="dd-pin" width="11" height="11" patternUnits="userSpaceOnUse"><rect width="11" height="11" fill="#ece6d6"/><path d="M5.5 0V11" stroke="' + ULTRA + '" stroke-width="1.6"/></pattern></defs>' + PEN +
      '<path fill="url(#dd-pin)" d="M112 262L188 262L210 640L156 644L150 392L144 644L90 640Z"/>' +
      '<rect x="110" y="256" width="80" height="13" rx="2" fill="#ece6d6"/>' + line('M150 270V392M122 276q10 20 0 40M178 276q-10 20 0 40', INK, 1.8) + '</g>' },
    { id: 'boots', name: 'Boots', slot: 'feet', z: 22, box: [80, 584, 140, 108], art: PEN + mirror(
      '<path fill="#1b1b1d" d="M160 592L192 592L194 644Q216 650 216 668L216 674L154 674Z"/>' +
      '<rect x="152" y="672" width="66" height="13" rx="3" fill="' + ULTRA + '"/>' + line('M166 606h20M166 619h20M166 632h20', '#fff', 2)) + '</g>' },
    { id: 'sneakers', name: 'Sneakers', slot: 'feet', z: 22, box: [80, 630, 140, 62], art: PEN + mirror(
      '<path fill="#fff" d="M160 640L188 640Q212 650 214 666L214 676L154 676Z"/><rect x="152" y="674" width="64" height="9" rx="3" fill="#fff"/>' +
      '<circle cx="186" cy="661" r="5.5" fill="' + RED + '" stroke="none"/>' + line('M164 650l12 6M164 658l10 5', INK, 1.6)) + '</g>' },
    { id: 'hat', name: 'Hat', slot: 'head', z: 55, box: [102, -66, 104, 138], art: PEN +
      line('M150-52q22-6 28 9q5 13 20 8', ULTRA, 3.2) +
      '<path fill="' + RED + '" d="M110 52L150-54L190 52Q150 66 110 52Z"/>' +
      '<path transform="translate(137 2) scale(0.8)" d="' + STAR + '" fill="#fff" stroke="none"/>' +
      '<circle cx="150" cy="-54" r="8" fill="#fff"/></g>' },
    { id: 'glasses', name: 'Glasses', slot: 'face', z: 50, box: [112, 56, 76, 40], art: PEN +
      '<path transform="translate(118 60) scale(0.95)" d="' + STAR + '" fill="' + INK + '"/><path transform="translate(152 60) scale(0.95)" d="' + STAR + '" fill="' + INK + '"/>' +
      line('M129 73l4-4M163 73l4-4', '#fff', 1.8) + '</g>' },
    { id: 'bag', name: 'Tote', slot: 'hand', z: 45, box: [190, 342, 86, 144], art: PEN +
      line('M214 406C212 346 246 346 246 406', INK, 4.5) +
      '<path fill="#f1e7d2" d="M200 402L262 402L268 476L196 476Z"/>' +
      '<path transform="translate(215 422) scale(1.05)" d="' + STAR + '" fill="' + INK + '" stroke="none"/></g>' }
  ];

  toys['dress-up'] = function (p, idx) {
    var K = C.random.dressup;
    var stage = h('div.dd');
    var doll = svg(DOLL, 'dd__doll', '0 0 300 700');
    var zone = h('div.dd__zone', { 'aria-hidden': 'true' });
    var wearing = h('p.dd__wearing', { role: 'status', 'aria-live': 'polite' });
    var worn = {}, L = { k: 1, s: 0.6, mx: 0, my: 0, home: {} }, cells = [];

    var items = GARMENTS.map(function (g) {
      var el = h('button.gar', { type: 'button', 'aria-pressed': 'false', onclick: function () { wear(el, !el.classList.contains('is-worn')); report(); } },
        svg(g.art, null, g.box.join(' ')));
      el._g = g;
      var x0, y0, over;
      SPA.grab(el, {
        begin: function () { x0 = el._x; y0 = el._y; over = false; el.classList.add('is-held'); },
        move: function (e, dx, dy) {
          el._x = x0 + dx; el._y = y0 + dy;
          el.style.transform = 'translate(' + el._x + 'px,' + el._y + 'px) rotate(' + Math.max(-9, Math.min(9, dx * 0.03)) + 'deg)';
          var z = zone.getBoundingClientRect();
          over = e.clientX > z.left && e.clientX < z.right && e.clientY > z.top && e.clientY < z.bottom;
          stage.classList.toggle('is-hot', over);
        },
        end: function (e, cancelled) {
          el.classList.remove('is-held'); stage.classList.remove('is-hot');
          wear(el, cancelled ? el.classList.contains('is-worn') : over); report();
        }
      });
      return el;
    });

    function place(el) {
      var g = el._g, on = el.classList.contains('is-worn'), k = on ? L.k : L.s;
      var x = on ? L.mx + g.box[0] * L.k : L.home[g.id][0], y = on ? L.my + g.box[1] * L.k : L.home[g.id][1];
      el._x = x; el._y = y;
      el.style.width = g.box[2] * k + 'px'; el.style.height = g.box[3] * k + 'px';
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      el.style.zIndex = on ? g.z : 3;
    }
    function wear(el, on) {
      var g = el._g;
      if (on) { var was = worn[g.slot]; if (was && was !== el) wear(was, false); worn[g.slot] = el; }
      else if (worn[g.slot] === el) delete worn[g.slot];
      el.classList.toggle('is-worn', on);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
      el.setAttribute('aria-label', g.name + (on ? '. Take it off.' : '. Put it on.'));
      place(el);
    }
    function report() {
      var names = items.filter(function (el) { return el.classList.contains('is-worn'); }).map(function (el) { return el._g.name.toLowerCase(); });
      wearing.textContent = names.length ? 'Wearing: ' + names.join(', ') + '.' : 'Wearing: nothing but the basics.';
    }

    /* lay the sheet out: clothes either side of the model, or underneath on a phone */
    function pack(list, x0, y0, width, s) {
      var x = x0, y = y0, rowH = 0, gap = 12;
      list.forEach(function (el) {
        var g = el._g, w = g.box[2] * s + 18, hh = g.box[3] * s + 34;
        if (x > x0 && x + w > x0 + width + 1) { x = x0; y += rowH + gap; rowH = 0; }
        L.home[g.id] = [x + 9, y + 9];
        cells.push({ x: x, y: y, w: w, h: hh, name: g.name });
        x += w + gap; rowH = Math.max(rowH, hh);
      });
      return y + rowH - y0;
    }
    function layout() {
      var W = stage.clientWidth, H, bottom;
      if (!W) return;
      cells = []; L.home = {};
      if (W >= 760) {
        H = Math.max(540, Math.min(740, window.innerHeight - 250));
        L.k = H / 800; L.mx = W / 2 - 150 * L.k; L.my = 84 * L.k;
        var side = L.mx - 46;
        L.s = L.k * Math.min(0.62, Math.max(0.4, side / 520));
        var half = [items.slice(0, 5), items.slice(5)];
        bottom = Math.max(H, pack(half[0], 4, 10, side, L.s) + 20, pack(half[1], L.mx + 300 * L.k + 42, 10, side, L.s) + 20);
      } else {
        L.k = Math.min(0.8, (W * 0.7) / 300, (window.innerHeight * 0.52) / 800); L.mx = W / 2 - 150 * L.k; L.my = 80 * L.k;
        H = 800 * L.k; L.s = Math.min(0.36, L.k * 0.7);
        bottom = H + 18 + pack(items, 2, H + 18, W - 4, L.s) + 8;
      }
      stage.style.height = bottom + 'px';
      doll.style.left = L.mx + 'px'; doll.style.top = L.my + 'px'; doll.style.width = 300 * L.k + 'px'; doll.style.height = 700 * L.k + 'px';
      zone.style.left = (L.mx - 40 * L.k) + 'px'; zone.style.top = '0px'; zone.style.width = 380 * L.k + 'px'; zone.style.height = 800 * L.k + 'px';
      Array.prototype.forEach.call(stage.querySelectorAll('.dd__cell'), function (c) { stage.removeChild(c); });
      cells.forEach(function (c) {
        stage.insertBefore(h('span.dd__cell', { 'aria-hidden': 'true', style: { left: c.x + 'px', top: c.y + 'px', width: c.w + 'px', height: c.h + 'px' } }, h('i', c.name)), stage.firstChild);
      });
      stage.classList.add('is-still');
      items.forEach(place);
      void stage.offsetWidth; stage.classList.remove('is-still');
    }
    function surprise() {
      var bySlot = {};
      items.forEach(function (el) { (bySlot[el._g.slot] = bySlot[el._g.slot] || []).push(el); wear(el, false); });
      Object.keys(bySlot).forEach(function (slot, n) {
        var must = slot === 'top' || slot === 'bottom' || slot === 'feet';
        if (must || Math.random() < 0.55) setTimeout(function () { var l = bySlot[slot]; wear(l[Math.floor(Math.random() * l.length)], true); report(); }, 90 * n);
      });
    }

    stage.appendChild(zone); stage.appendChild(doll);
    items.forEach(function (el) { stage.appendChild(el); });
    window.addEventListener('resize', layout);
    SPA.onLeave(function () { window.removeEventListener('resize', layout); });
    requestAnimationFrame(function () { layout(); items.forEach(function (el) { wear(el, false); }); report(); });

    return h('div.toy.toy--dress', head(p, idx, K.intro),
      h('div.dd__bar',
        h('button.btn', { type: 'button', onclick: surprise }, 'Surprise me ✦'),
        h('button.btn', { type: 'button', onclick: function () { items.forEach(function (el) { wear(el, false); }); report(); } }, 'Undress'),
        wearing),
      stage, SPA.footer());
  };

  /* ── 04 CARDBOARD CASTLE ─────────────────────────────────────────────────
     The castle is one drawing; the six windows and the door are flaps laid
     over it that swing open. What is behind each one comes from content.js.  */
  var CB = { base: '#c79f72', lite: '#d9b88f', shade: '#b28a5f', dark: '#7c5b3c', ink: '#5d4128', hole: '#3a2716' };
  function merlons(x0, x1, y, w, gap, tall) {       /* a crenellated top edge, as a closed strip */
    var d = 'M' + x0 + ' ' + (y + 2) + 'V' + (y - tall), x = x0;
    while (x + w <= x1 + 0.5) {
      d += 'H' + (x + w) + 'V' + y;
      x += w + gap;
      if (x + w <= x1 + 0.5) d += 'H' + x + 'V' + (y - tall);
    }
    return d + 'H' + x1 + 'V' + (y + 2) + 'Z';
  }
  function bricks(list) {                           /* marker-drawn brick lines: [x, y, length] */
    return '<path class="cb-ink" d="' + list.map(function (b) { return 'M' + b[0] + ' ' + b[1] + 'h' + b[2]; }).join('') + '"/>';
  }
  function tower(cx, flag) {                        /* one of the two side towers */
    var x = cx - 80;
    return '<g class="cb-layer">' +
      '<path class="cb-pole" d="M' + cx + ' 152V104"/><path d="M' + (cx + 2) + ' 106l52 13-52 15Z" fill="' + flag + '"/>' +
      '<path d="M' + cx + ' 146L' + (cx + 100) + ' 262H' + (cx - 100) + 'Z" fill="' + CB.shade + '"/>' +
      '<path class="cb-ink" d="M' + cx + ' 150L' + (cx - 34) + ' 258M' + cx + ' 150L' + (cx + 34) + ' 258M' + cx + ' 150L' + (cx - 72) + ' 258M' + cx + ' 150L' + (cx + 72) + ' 258"/>' +
      '<rect x="' + (cx - 104) + '" y="258" width="208" height="20" fill="url(#cb-edge)"/>' +
      '<rect x="' + x + '" y="278" width="160" height="414" fill="' + CB.base + '"/><rect x="' + x + '" y="278" width="160" height="414" fill="url(#cb-flute)"/>' +
      '<rect x="' + (cx - 7) + '" y="560" width="14" height="62" rx="7" fill="' + CB.hole + '"/><rect x="' + (cx - 18) + '" y="584" width="36" height="10" rx="5" fill="' + CB.hole + '"/>' +
      bricks([[x + 10, 300, 34], [x + 112, 306, 38], [x + 16, 446, 40], [x + 96, 462, 46], [x + 30, 470, 30], [x + 104, 650, 40], [x + 12, 664, 44]]) +
      '</g>';
  }
  function castleArt() {
    return '<defs>' +
      '<pattern id="cb-flute" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M3.5 0V7" stroke="#000" stroke-opacity=".06" stroke-width="2"/></pattern>' +
      '<pattern id="cb-edge" width="9" height="20" patternUnits="userSpaceOnUse"><rect width="9" height="20" fill="#8c6744"/><path d="M0 3h9M0 17h9" stroke="' + CB.lite + '" stroke-width="2.4"/><path d="M0 14Q2.25 4 4.5 10T9 6" stroke="' + CB.lite + '" stroke-width="1.5" fill="none"/></pattern>' +
      '<filter id="cb-grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/>' +
      '<feComponentTransfer><feFuncA type="table" tableValues="0 .34"/></feComponentTransfer><feComposite operator="in" in2="SourceGraphic" result="n"/><feBlend mode="multiply" in="n" in2="SourceGraphic"/></filter>' +
      '</defs>' +
      '<g filter="url(#cb-grain)">' +
      /* the sheet it stands on */
      '<g class="cb-layer"><path d="M46 690H954L1000 746H0Z" fill="' + CB.lite + '"/><rect y="746" width="1000" height="16" fill="url(#cb-edge)"/>' +
      '<path class="cb-ink" d="M90 716h70M800 712h96M420 726h150"/></g>' +
      /* the tall tower at the back */
      '<g class="cb-layer"><path class="cb-pole" d="M500 48V8"/><path d="M502 10l60 15-60 16Z" fill="#d42b2b"/>' +
      '<path d="M500 44L606 150H394Z" fill="' + CB.shade + '"/><path class="cb-ink" d="M500 48L466 146M500 48L534 146M500 48L428 146M500 48L572 146"/>' +
      '<rect x="388" y="146" width="224" height="20" fill="url(#cb-edge)"/>' +
      '<rect x="412" y="166" width="176" height="330" fill="' + CB.base + '"/><rect x="412" y="166" width="176" height="330" fill="url(#cb-flute)"/>' +
      bricks([[424, 186, 30], [548, 198, 30], [420, 250, 32], [546, 272, 34]]) + '</g>' +
      /* the wall */
      '<g class="cb-layer"><path d="' + merlons(240, 760, 446, 40, 30, 30) + '" fill="' + CB.lite + '"/>' +
      '<rect x="240" y="446" width="520" height="246" fill="' + CB.lite + '"/><rect x="240" y="446" width="520" height="246" fill="url(#cb-flute)"/>' +
      bricks([[320, 470, 44], [344, 640, 40], [316, 656, 30], [640, 474, 40], [626, 644, 46], [660, 660, 28]]) +
      /* a shipping label someone forgot to peel off */
      '<g transform="rotate(-3 655 640)"><rect x="622" y="622" width="66" height="40" fill="#f4f1ea"/><path d="M628 632h40M628 640h54M628 648h30" stroke="#8a8a8a" stroke-width="2.4"/><path d="M670 646h3v10h-3zM675 646h1.5v10h-1.5zM678 646h4v10h-4z" fill="#2a2a2a"/></g></g>' +
      /* the two towers */
      tower(225, '#1c1ce6') + tower(775, '#1c1ce6') +
      /* "this way up" and "fragile", printed on the boxes it was cut from */
      '<g fill="none" stroke="' + CB.dark + '" stroke-width="5" opacity=".62" stroke-linejoin="round"><path d="M178 520v-52M164 484l14-18 14 18M222 520v-52M208 484l14-18 14 18M158 532h84"/></g>' +
      '<g transform="translate(838 548) rotate(-90)" opacity=".62"><rect x="-4" y="-25" width="124" height="33" fill="none" stroke="' + CB.dark + '" stroke-width="3.4"/><text x="58" y="0" text-anchor="middle" font-family="Geist Mono, monospace" font-weight="700" font-size="21" letter-spacing="3" fill="' + CB.dark + '">FRAGILE</text></g>' +
      /* the gatehouse */
      '<g class="cb-layer"><path d="' + merlons(392, 608, 344, 36, 24, 28) + '" fill="' + CB.base + '"/>' +
      '<rect x="392" y="344" width="216" height="348" fill="' + CB.base + '"/><rect x="392" y="344" width="216" height="348" fill="url(#cb-flute)"/>' +
      '<path d="M428 692V530a72 72 0 0 1 144 0V692Z" fill="' + CB.shade + '"/><path d="M440 692V530a60 60 0 0 1 120 0V692Z" fill="' + CB.hole + '"/>' +
      '<path class="cb-ink" d="M428 600h-20M428 560h-16M572 600h20M572 560h16M446 478l-12-12M554 478l12-12M500 458v-16"/></g>' +
      /* packing tape holding it together */
      '<g fill="#e8dbb4" opacity=".86"><rect x="278" y="436" width="62" height="20" transform="rotate(-5 309 446)"/><rect x="662" y="434" width="64" height="20" transform="rotate(4 694 444)"/><rect x="372" y="398" width="46" height="18" transform="rotate(-82 395 407)"/><rect x="118" y="672" width="70" height="20" transform="rotate(3 153 682)"/></g>' +
      '</g>';
  }
  /* where the flaps sit on the drawing: [x, y, width, height] in drawing units (1000 × 770) */
  var FLAPS = [[189, 318, 72, 102], [464, 196, 72, 102], [739, 318, 72, 102], [300, 518, 66, 92], [467, 366, 66, 84], [634, 518, 66, 92]];
  var DOOR = [440, 470, 120, 222];

  toys.castle = function (p, idx) {
    var K = C.random.castle, rooms = K.rooms.slice(0, FLAPS.length + 1);
    var doorRoom = rooms.length > FLAPS.length ? rooms[rooms.length - 1] : null;
    var winRooms = doorRoom ? rooms.slice(0, -1) : rooms;
    var open = {}, flaps = [];
    var tag = h('div.ctag__card', { 'aria-live': 'polite' });
    var tally = h('p.meta.ctag__tally');
    var shut = h('button.ctag__shut', { type: 'button', onclick: function () { flaps.forEach(function (f) { setOpen(f, false); }); show(null); } }, 'Close them all');

    function pct(v, of) { return (v / of * 100).toFixed(3) + '%'; }
    function flap(room, box, isDoor, n) {
      var inside = h('span.flap__room',
        room.img && SPA.info(room.img) ? SPA.img(room.img, { alt: '' }) : h('b', room.label));
      var b = h('button.flap' + (isDoor ? '.flap--door' : ''), { type: 'button', 'aria-expanded': 'false',
        'aria-label': (isDoor ? 'The door' : 'Window ' + (n + 1)) + '. Open it.',
        style: { left: pct(box[0], 1000), top: pct(box[1], 770), width: pct(box[2], 1000), height: pct(box[3], 770) },
        onclick: function () { var on = !open[n]; setOpen(b, on); show(on ? b : lastOpen()); } },
        inside, h('span.flap__leaf.flap__leaf--l'), h('span.flap__leaf.flap__leaf--r'));
      b._room = room; b._n = n; b._door = isDoor;
      flaps.push(b);
      return b;
    }
    function setOpen(b, on) {
      open[b._n] = on;
      b.classList.toggle('is-open', on);
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
      b.setAttribute('aria-label', (b._door ? 'The door' : 'Window ' + (b._n + 1)) + (on ? ': ' + b._room.label + '. Close it.' : '. Open it.'));
      var n = flaps.filter(function (f) { return open[f._n]; }).length;
      tally.textContent = n + ' / ' + flaps.length + ' open';
      shut.hidden = !n;
    }
    function lastOpen() { var l = flaps.filter(function (f) { return open[f._n]; }); return l[l.length - 1] || null; }
    function show(b) {
      tag.textContent = '';
      tag.classList.remove('is-in'); void tag.offsetWidth;
      if (!b) {
        tag.appendChild(h('p.ctag__empty', 'Nothing open yet. Try a window, or knock on the door.'));
        tag.classList.add('is-in', 'is-blank'); return;
      }
      var r = b._room;
      tag.classList.remove('is-blank');
      tag.appendChild(h('p.meta', b._door ? 'The door' : 'Window ' + pad(b._n + 1)));
      if (r.img && SPA.info(r.img)) tag.appendChild(h('span.ctag__pic' + (SPA.info(r.img).a ? '.ctag__pic--cut' : ''), SPA.img(r.img, { alt: r.label })));
      tag.appendChild(h('h2.ctag__label', r.label));
      if (r.note) tag.appendChild(h('p.ctag__note', r.note));
      if (r.link) tag.appendChild(h('a.go', { href: r.link }, (r.linkLabel || 'Go') + ' ', arrow()));
      tag.classList.add('is-in');
    }

    var castle = h('div.castle', svg(castleArt(), 'castle__art', '0 0 1000 770'),
      winRooms.map(function (r, n) { return flap(r, FLAPS[n], false, n); }),
      doorRoom ? flap(doorRoom, DOOR, true, winRooms.length) : null);
    setOpen(flaps[0], false); show(null);
    return h('div.toy.toy--castle', head(p, idx, K.intro),
      h('div.cs', castle, h('aside.ctag', { 'aria-label': 'What you found' }, h('span.ctag__string', { 'aria-hidden': 'true' }), tag, h('div.ctag__foot', tally, shut))),
      SPA.footer());
  };

  /* ── 05 SHADOWREALM ──────────────────────────────────────────────────────
     A tent drawn in two layers (back and front) with a small canvas in the
     opening. The play is drawn eight times a second and nothing moves in
     between, which is what makes it read as stop-motion. Three short acts:
     the fair, the forest, the sea. The cursor moves the lamp.               */
  function candelabra(x) {
    var c = '', f = '';
    [[-40, 606, 22], [40, 606, 22], [-22, 586, 20], [22, 586, 20], [0, 590, 24]].forEach(function (k, i) {
      c += '<rect x="' + (k[0] - 3) + '" y="' + (k[1] - k[2]) + '" width="6" height="' + k[2] + '" rx="1.5" fill="#efe6d0"/>';
      f += '<circle class="tn-halo" cx="' + k[0] + '" cy="' + (k[1] - k[2] - 8) + '" r="15"/><ellipse class="tn-flame" style="animation-delay:-' + (i * 0.37).toFixed(2) + 's" cx="' + k[0] + '" cy="' + (k[1] - k[2] - 8) + '" rx="3.4" ry="7.5"/>';
    });
    return '<g transform="translate(' + x + ' 0)"><path d="M0 746V590M-32 746H32M-20 746q20-18 40 0M0 640q-40 0-40-34M0 640q40 0 40-34M0 616q-22 0-22-30M0 616q22 0 22-30" fill="none" stroke="#b8923e" stroke-width="4.5" stroke-linecap="round"/>' + c + f + '</g>';
  }
  function scallops(x0, x1, y, drop) {
    var n = Math.round((x1 - x0) / 28), w = (x1 - x0) / n, d = 'M' + x0 + ' 318H' + x1 + 'V' + y;
    for (var i = 0; i < n; i++) d += 'q' + (-w / 2) + ' ' + drop + ' ' + (-w) + ' 0';
    return d + 'Z';
  }
  function tentBack() {
    return '<defs>' +
      '<radialGradient id="tn-glow" cx="500" cy="510" r="500" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffdc94"/><stop offset=".36" stop-color="#f0c88c"/><stop offset=".7" stop-color="#c39b68"/><stop offset="1" stop-color="#6f5333"/></radialGradient>' +
      '<linearGradient id="tn-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d5435"/><stop offset=".7" stop-color="#b9976a"/><stop offset="1" stop-color="#dcbd8c"/></linearGradient>' +
      '<pattern id="tn-folds" width="48" height="10" patternUnits="userSpaceOnUse"><path d="M12 0V10" stroke="#4a2f12" stroke-opacity=".17" stroke-width="3"/><path d="M33 0V10" stroke="#fff" stroke-opacity=".1" stroke-width="6"/></pattern>' +
      '</defs>' +
      '<ellipse cx="500" cy="728" rx="496" ry="44" fill="#e8dfcc" opacity=".13"/>' +
      '<path d="M330 80V14M670 80V14" stroke="#0b0b0b" stroke-width="4" stroke-linecap="round"/>' +
      '<path class="tn-flag" d="M332 16q20-11 38 0t38-2v32q-19 7-38-1t-38 4Z"/><path class="tn-flag" d="M672 16q20-11 38 0t38-2v32q-19 7-38-1t-38 4Z"/>' +
      '<path d="M96 318Q240 262 330 76Q396 252 500 264Q604 252 670 76Q760 262 904 318Z" fill="url(#tn-roof)"/>' +
      '<path d="M330 76Q304 250 214 304M330 76Q350 244 424 296M670 76Q650 244 576 296M670 76Q696 250 786 304" fill="none" stroke="#3d2710" stroke-opacity=".34" stroke-width="2"/>' +
      '<path d="M96 318H904V702Q500 744 96 702Z" fill="url(#tn-glow)"/><path d="M96 318H904V702Q500 744 96 702Z" fill="url(#tn-folds)"/>' +
      /* the shadow of a bird that got in */
      '<path d="M176 470q14-16 26-4q8-14 24-10q-14 4-16 16q16 4 22 18q-14-8-26-4q-4 12-16 14q4-10 0-18q-10-6-14-12Z" fill="#4a2c0e" opacity=".32" filter="blur(2px)"/>' +
      /* the wire frame */
      '<path d="M96 318V706M904 318V706M96 318Q240 262 330 76Q396 252 500 264Q604 252 670 76Q760 262 904 318M96 318H904" fill="none" stroke="#0b0b0b" stroke-width="3.6" stroke-linejoin="round"/>' +
      '<path d="M800 500q-20-22-25 0q5 22 25 0q20-22 25 0q-5 22-25 0M800 500v44" fill="none" stroke="#0b0b0b" stroke-width="3"/>' +
      '<rect x="298" y="336" width="404" height="366" fill="#1a0c04"/>';
  }
  function tentFront() {
    var drape = 'V698q-12.6 10-25.25 0t-25.25 0-25.25 0-25.25 0-25.25 0-25.25 0-25.25 0-25.25 0Z';
    return '<defs><pattern id="tn-drape" width="50" height="10" patternUnits="userSpaceOnUse"><rect width="50" height="10" fill="#e4cfa6"/><rect x="16" width="12" height="10" fill="#c5a97c"/><rect x="36" width="7" height="10" fill="#f4e6c6"/><rect x="2" width="3" height="10" fill="#d3ba8e"/></pattern></defs>' +
      '<g class="tn-curtain tn-curtain--l"><path d="M298 336H500' + drape + '" fill="url(#tn-drape)" stroke="#3d2710" stroke-width="1.5"/></g>' +
      '<g class="tn-curtain tn-curtain--r"><path d="M500 336H702' + drape + '" fill="url(#tn-drape)" stroke="#3d2710" stroke-width="1.5"/></g>' +
      '<path class="tn-tie" d="M318 520q-22-16-22 4q0 18 22-4q26 12 26-6q0-16-26 6M682 520q22-16 22 4q0 18-22-4q-26 12-26-6q0-16 26 6" fill="#e4cfa6" stroke="#3d2710" stroke-width="2"/>' +
      '<path d="M298 318V706M702 318V706" fill="none" stroke="#0b0b0b" stroke-width="4"/>' +
      '<path d="' + scallops(276, 724, 352, 20) + '" fill="#dcc294" stroke="#3d2710" stroke-width="1.6"/>' +
      '<path d="M276 318H724" stroke="#0b0b0b" stroke-width="4"/>' +
      candelabra(52) + candelabra(948);
  }

  function shadowPlay(canvas, onAct) {
    var W = 400, H = 362, ACT = 112, FPS = 8;
    var ctx = canvas.getContext('2d'), off = document.createElement('canvas'), o = off.getContext('2d');
    var STARP = new Path2D(STAR);
    var k = 1, f = 0, t = 0, act = 0, raf = 0, last = 0, open = false;
    var lamp = { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42, held: 0 };
    var FAR = ['#7a3c12', 0.4, 1.5], MID = ['#3a1a08', 0.78, 0.6], NEAR = ['#160a03', 1, 0];

    function rng(seed) {
      return function () { seed = seed + 0x6D2B79F5 | 0; var z = Math.imul(seed ^ seed >>> 15, 1 | seed); z = z + Math.imul(z ^ z >>> 7, 61 | z) ^ z; return ((z ^ z >>> 14) >>> 0) / 4294967296; };
    }
    function size() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!r.width) return;
      canvas.width = off.width = Math.round(r.width * dpr); canvas.height = off.height = Math.round(r.height * dpr);
      k = canvas.width / W;
      draw();
    }

    /* one sheet of cut paper at a given distance from the lamp */
    function layer(depth, tone, fn) {
      var j = rng(f * 131 + Math.round(depth * 10) * 977);
      o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, off.width, off.height);
      var px = (0.5 - lamp.x) * W * 0.12 * (0.25 + depth) + (j() - 0.5) * 1.5, py = (0.42 - lamp.y) * H * 0.1 * (0.25 + depth) + (j() - 0.5) * 1.5;
      o.setTransform(k, 0, 0, k, px * k, py * k); o.rotate((j() - 0.5) * 0.007);
      o.fillStyle = o.strokeStyle = tone[0]; o.lineCap = o.lineJoin = 'round'; o.globalCompositeOperation = 'source-over';
      fn(o);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = tone[1];
      if (tone[2] && 'filter' in ctx) ctx.filter = 'blur(' + (tone[2] * k).toFixed(1) + 'px)';
      ctx.drawImage(off, 0, 0); ctx.restore();
    }
    function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, 6.2832); c.fill(); }
    function poly(c, p) { c.beginPath(); c.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); c.fill(); }
    function path(c, p, w) { c.lineWidth = w; c.beginPath(); c.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.stroke(); }
    function hole(c, fn) { c.globalCompositeOperation = 'destination-out'; fn(); c.globalCompositeOperation = 'source-over'; }
    function at(c, x, y, s, rot, fn) { c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s[0] === undefined ? s : s[0], s[1] === undefined ? s : s[1]); fn(); c.restore(); }

    function tree(c, x, base, tall, seed, spread) {             /* a bare, cut-paper tree */
      var r = rng(seed);
      (function grow(x, y, len, ang, w, depth) {
        var x2 = x + Math.sin(ang) * len, y2 = y - Math.cos(ang) * len;
        path(c, [x, y, x2, y2], w);
        if (depth <= 0 || len < 4) return;
        var n = r() < 0.32 ? 3 : 2;
        for (var i = 0; i < n; i++) grow(x2, y2, len * (0.6 + r() * 0.22), ang + (i - (n - 1) / 2) * spread + (r() - 0.5) * 0.5, Math.max(0.7, w * 0.66), depth - 1);
      })(x, base, tall * 0.36, (r() - 0.5) * 0.12, tall * 0.055, 5);
    }
    function fir(c, x, base, tall, wide) {
      c.fillRect(x - tall * 0.02, base - tall * 0.16, tall * 0.04, tall * 0.16);
      for (var i = 0; i < 5; i++) {
        var top = base - tall + (tall * 0.72 * i) / 5, low = top + tall * 0.34, half = wide * (0.22 + i * 0.07);
        poly(c, [x, top, x + half * 0.5, top + (low - top) * 0.55, x + half * 0.32, top + (low - top) * 0.58, x + half, low, x - half, low, x - half * 0.32, top + (low - top) * 0.58, x - half * 0.5, top + (low - top) * 0.55]);
      }
    }
    function grass(c, y, seed, n, tall, sway) {
      var r = rng(seed);
      for (var i = 0; i < n; i++) { var x = r() * (W + 20) - 10, hh = tall * (0.35 + r() * 0.65), lean = (r() - 0.5) * 12 + sway * (0.5 + r()); poly(c, [x - 2.4, y + 2, x + 2.4, y + 2, x + lean, y - hh]); }
      c.fillRect(-20, y, W + 40, H - y + 20);
    }
    function star(c, x, y, s) { at(c, x - 16 * s, y - 16 * s, s, 0, function () { c.fill(STARP); }); }
    function hang(c, x, len, sway, fn) {
      var ex = x + Math.sin(sway) * len, ey = Math.cos(sway) * len - 6;
      path(c, [x, -8, ex, ey], 0.9); fn(ex, ey, sway);
    }
    function horse(c, x, y, s, dir, gait) {
      at(c, x, y, [s * dir, s], 0, function () {
        ell(c, 0, 0, 21, 10);
        poly(c, [12, -7, 24, -27, 33, -31, 40, -22, 33, -17, 25, -3]);
        poly(c, [27, -28, 29, -38, 33, -29]);
        poly(c, [-20, -4, -34, 4 + gait * 3, -30, -12]);
        path(c, gait ? [14, 6, 25, 14, 31, 22] : [14, 6, 22, 18, 21, 27], 4);
        path(c, gait ? [9, 7, 7, 26] : [9, 7, 15, 24], 4);
        path(c, gait ? [-13, 6, -24, 16, -31, 23] : [-13, 6, -20, 20, -19, 28], 4);
        path(c, gait ? [-8, 7, -10, 26] : [-8, 7, -3, 24], 4);
      });
    }
    function rabbit(c, x, y, s, ear) {
      at(c, x, y, s, 0, function () {
        ell(c, 0, 0, 27, 20); ell(c, -15, -14, 15, 17, 0.3); ell(c, -24, -36, 13, 11);
        ell(c, -19, -60, 5, 19, 0.12 + ear * 0.16); ell(c, -30, -58, 5, 18, -0.2 - ear * 0.1);
        ell(c, 27, 5, 7, 7); ell(c, -22, 17, 11, 5);
      });
      hole(c, function () { at(c, x, y, s, 0, function () { ell(c, -29, -38, 1.8, 1.8); }); });
    }
    function ferris(c, cx, cy, R, ang) {
      c.lineWidth = 2.6; c.beginPath(); c.arc(cx, cy, R, 0, 6.2832); c.stroke();
      c.lineWidth = 1.3; c.beginPath(); c.arc(cx, cy, R * 0.78, 0, 6.2832); c.stroke();
      for (var i = 0; i < 10; i++) {
        var a = ang + (i * 6.2832) / 10, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        path(c, [cx, cy, x, y], 1.3);
        c.fillRect(x - 6, y + 2, 12, 10); poly(c, [x - 8, y + 3, x, y - 4, x + 8, y + 3]);
      }
      ell(c, cx, cy, 6, 6);
      path(c, [cx, cy, cx - R * 0.45, cy + R + 60], 3.4); path(c, [cx, cy, cx + R * 0.45, cy + R + 60], 3.4);
    }
    function carousel(c, cx, base, ang, gait) {
      var i, list = [];
      for (i = 0; i < 5; i++) { var a = ang + (i * 6.2832) / 5; list.push([Math.cos(a), cx + Math.sin(a) * 60, Math.sin(a * 2 + i) * 5, i]); }
      list.sort(function (p, q) { return p[0] - q[0]; });
      list.forEach(function (p) {
        var s = 0.62 + (p[0] + 1) * 0.16;
        path(c, [p[1], base - 104, p[1], base - 8], 1.6);
        horse(c, p[1], base - 44 + p[2], s, p[0] >= 0 ? 1 : -1, (gait + p[3]) % 2);
      });
      c.fillRect(cx - 7, base - 104, 14, 96);
      poly(c, [cx - 78, base, cx + 78, base, cx + 68, base - 10, cx - 68, base - 10]);
      poly(c, [cx - 82, base - 102, cx + 82, base - 102, cx + 14, base - 146, cx - 14, base - 146]);
      for (i = 0; i < 10; i++) ell(c, cx - 73.8 + i * 16.4, base - 101, 8.2, 8.2);
      path(c, [cx, base - 146, cx, base - 170], 1.8); poly(c, [cx, base - 170, cx + 18, base - 164, cx, base - 158]);
    }
    function deer(c, x, y, s, step) {
      at(c, x, y, s, 0, function () {
        ell(c, 0, 0, 25, 10.5); poly(c, [13, -6, 23, -31, 31, -29, 25, -1]); ell(c, 31, -33, 9.5, 5.5, -0.25);
        poly(c, [24, -35, 20, -45, 27, -38]); poly(c, [-23, -5, -31, -10, -26, 2]);
        path(c, [27, -37, 23, -52, 16, -60], 1.9); path(c, [24, -47, 30, -57], 1.7); path(c, [23, -52, 25, -64], 1.6);
        path(c, [31, -38, 37, -52, 46, -57], 1.9); path(c, [35, -46, 42, -45], 1.7); path(c, [37, -52, 38, -64], 1.6);
        var a = step ? 4 : -4;
        path(c, [15, 6, 15 + a, 31], 3.2); path(c, [9, 7, 9 - a, 31], 3.2); path(c, [-15, 6, -15 - a, 31], 3.2); path(c, [-20, 6, -20 + a, 31], 3.2);
      });
    }
    function walker(c, x, y, step) {
      at(c, x, y, 1, 0, function () {
        ell(c, 0, -37, 5.5, 6); poly(c, [-3, -32, 4, -32, 11, -4, -10, -4]); poly(c, [-6, -42, 0, -52, 6, -42]);
        path(c, step ? [-3, -5, -6, 8] : [-3, -5, 0, 8], 3); path(c, step ? [4, -5, 8, 8] : [4, -5, 2, 8], 3);
        path(c, [-3, -24, -14, -17, -14, -9], 2); c.fillRect(-17, -9, 6, 8);
      });
    }
    function bird(c, x, y, s, flap) {
      at(c, x, y, s, 0, function () {
        c.lineWidth = 2.4; c.beginPath();
        if (flap) { c.moveTo(-11, -7); c.quadraticCurveTo(-4, -4, 0, 0); c.quadraticCurveTo(4, -4, 11, -7); }
        else { c.moveTo(-11, 4); c.quadraticCurveTo(-5, -2, 0, 0); c.quadraticCurveTo(5, -2, 11, 4); }
        c.stroke(); ell(c, 0, 0.5, 3.2, 1.8);
      });
    }
    function fish(c, x, y, s, rot) {
      at(c, x, y, s, rot, function () { ell(c, 0, 0, 14, 6.2); poly(c, [-11, 0, -23, -8, -20, 0, -23, 8]); poly(c, [-2, -5, 5, -12, 8, -4]); poly(c, [0, 5, 4, 11, 7, 4]); });
      hole(c, function () { at(c, x, y, s, rot, function () { ell(c, 8, -1.5, 1.4, 1.4); }); });
    }
    function waves(c, y, amp, len, shift) {
      c.beginPath(); c.moveTo(-len * 2 + shift, y);
      for (var x = -len * 2 + shift; x < W + len; x += len) c.quadraticCurveTo(x + len * 0.55, y + amp, x + len, y);
      c.lineTo(W + len, H + 20); c.lineTo(-len * 2, H + 20); c.closePath(); c.fill();
    }
    function boat(c, x, y, tilt) {
      at(c, x, y, 1, tilt, function () {
        poly(c, [-30, -2, 30, -2, 20, 10, -20, 10]); path(c, [0, -2, 0, -52], 2.2);
        poly(c, [3, -50, 3, -8, 27, -8]); poly(c, [-3, -42, -3, -8, -20, -8]); poly(c, [0, -52, 12, -56, 0, -60]);
      });
    }
    function moon(c, x, y, r) { ell(c, x, y, r, r); hole(c, function () { ell(c, x + r * 0.45, y - r * 0.12, r * 0.92, r * 0.92); }); }
    function spark(x, y, r, a) {                                /* a point of real light among the shadows */
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,244,196,' + a + ')'); g.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    }

    var two = function (n) { return Math.floor(t / n); };      /* "shooting on twos": hold a pose for n frames */
    var ACTS = [
      function fair() {
        layer(0, FAR, function (c) {
          ferris(c, 66, 168, 96, two(2) * 0.085); ferris(c, 352, 150, 80, 1 - two(2) * 0.07);
          poly(c, [-20, 304, 50, 268, 120, 294, 200, 276, 286, 296, 352, 270, 420, 292, 420, 380, -20, 380]);
        });
        layer(0.5, MID, function (c) {
          carousel(c, 200, 306, t * 0.105, two(2));
          hang(c, 96, 58, Math.sin(two(2) * 0.6) * 0.14, function (x, y) { star(c, x, y + 8, 0.62); });
          hang(c, 292, 44, Math.sin(two(2) * 0.6 + 2) * 0.16, function (x, y) { moon(c, x, y + 12, 12); });
          hang(c, 246, 26, Math.sin(two(2) * 0.6 + 4) * 0.2, function (x, y) { star(c, x, y + 5, 0.34); });
        });
        layer(1, NEAR, function (c) {
          tree(c, 14, 372, 300, 5, 0.62);
          grass(c, 330, 11, 80, 26, Math.sin(two(2) * 0.9) * 3);
          rabbit(c, 344, 322, 1.45, two(6) % 5 === 0 ? 1 : 0);
          if (t > 34 && t < 100) bird(c, -20 + (t - 34) * 7, 64 + Math.sin(t * 0.5) * 7, 1.15, t % 2);
        });
      },
      function forest() {
        layer(0, FAR, function (c) {
          fir(c, 34, 312, 210, 150); fir(c, 118, 304, 150, 110); fir(c, 214, 300, 118, 90); fir(c, 300, 310, 226, 160); fir(c, 380, 302, 150, 110);
          c.fillRect(-20, 300, W + 40, 90);
        });
        layer(0.5, MID, function (c) {
          tree(c, 136, 318, 250, 21, 0.6); tree(c, 300, 318, 220, 9, 0.56);
          deer(c, -44 + t * 4.3, 286, 1, two(2) % 2);
          poly(c, [-20, 316, 80, 308, 190, 318, 300, 306, 420, 316, 420, 380, -20, 380]);
        });
        layer(1, NEAR, function (c) {
          tree(c, 28, 372, 350, 3, 0.66); tree(c, 384, 372, 320, 14, 0.66);
          grass(c, 334, 5, 90, 30, Math.sin(two(2) * 0.9) * 3);
          walker(c, 430 - t * 2.6, 330, two(2) % 2);
        });
        var r = rng(77), i;
        for (i = 0; i < 9; i++) { var fx = r() * W, fy = 90 + r() * 190, on = (two(3) + i * 3) % 7 < 3; if (on) spark((fx + Math.sin(t * 0.3 + i) * 4) * k, fy * k, 9 * k, 0.9); }
        spark((430 - t * 2.6 - 14) * k, (330 - 5) * k, 22 * k, 0.95);
      },
      function sea() {
        layer(0, FAR, function (c) {
          poly(c, [-20, 246, 40, 196, 96, 232, 150, 168, 214, 228, 270, 190, 330, 236, 380, 204, 420, 240, 420, 380, -20, 380]);
          waves(c, 252, 10, 42, (two(2) * 5) % 42);
        });
        layer(0.5, MID, function (c) {
          hang(c, 84, 84, Math.sin(two(2) * 0.55) * 0.16, function (x, y, a) { fish(c, x, y + 8, 1.15, a * 1.6); });
          hang(c, 322, 60, Math.sin(two(2) * 0.55 + 2.4) * 0.2, function (x, y, a) { fish(c, x, y + 6, 0.8, 3.1416 + a * 1.6); });
          hang(c, 214, 40, Math.sin(two(2) * 0.55 + 4) * 0.18, function (x, y) { moon(c, x, y + 12, 13); });
          boat(c, 196 + Math.sin(t * 0.07) * 34, 266 + Math.sin(two(2) * 0.9) * 3, Math.sin(two(2) * 0.9) * 0.07);
          waves(c, 280, 14, 54, 54 - ((two(2) * 6) % 54));
        });
        layer(0.75, [MID[0], 0.9, 0.3], function (c) {
          var u = (t % 56) / 22;                                   /* a fish jumps now and then */
          if (u < 1) fish(c, 262 + u * 104, 306 - Math.sin(u * 3.1416) * 80, 1.5, -1 + u * 2);
          waves(c, 306, 16, 66, (two(2) * 8) % 66);
        });
        layer(1, NEAR, function (c) { waves(c, 334, 18, 80, 80 - ((two(2) * 9) % 80)); });
      }
    ];

    function draw() {
      if (!canvas.width) return;
      var j = rng(f * 17 + 3), flick = 0.9 + j() * 0.1, cx = lamp.x * W * k, cy = lamp.y * H * k;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = '#2a1204'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      var g = ctx.createRadialGradient(cx, cy, 6 * k, cx, cy, W * 0.8 * k);
      g.addColorStop(0, 'rgba(255,247,214,' + flick + ')'); g.addColorStop(0.28, 'rgba(255,212,128,' + flick + ')');
      g.addColorStop(0.62, 'rgba(222,138,48,' + flick + ')'); g.addColorStop(1, 'rgba(98,46,12,' + flick + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ACTS[act]();
      /* dust on the screen, and the dark creeping in at the edges */
      ctx.fillStyle = 'rgba(40,16,2,0.34)';
      for (var i = 0; i < 3; i++) ctx.fillRect(j() * canvas.width, j() * canvas.height, (1 + j() * 2) * k, (1 + j() * 2) * k);
      var v = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.5, canvas.height * 0.36, canvas.width / 2, canvas.height * 0.5, canvas.height * 0.86);
      v.addColorStop(0, 'rgba(20,8,0,0)'); v.addColorStop(1, 'rgba(20,8,0,0.72)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, canvas.width, canvas.height);
      var fade = t < 3 ? 1 - t / 3 : t > ACT - 4 ? (t - (ACT - 4)) / 3 : 0;      /* lights down between acts */
      if (fade > 0) { ctx.fillStyle = 'rgba(14,6,0,' + Math.min(1, fade) + ')'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    }
    function step() {
      f++; t++;
      if (!lamp.held) { lamp.tx = 0.5 + Math.sin(f * 0.09) * 0.07; lamp.ty = 0.42 + Math.cos(f * 0.07) * 0.03; } else lamp.held--;
      lamp.x += (lamp.tx - lamp.x) * 0.5; lamp.y += (lamp.ty - lamp.y) * 0.5;
      if (t >= ACT) go((act + 1) % ACTS.length);
      draw();
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (!open || now - last < 1000 / FPS) return;
      last = now; step();
    }
    function go(n) { act = n; t = 0; if (onAct) onAct(act); }

    window.addEventListener('resize', size);
    size();
    if (!REDUCE) raf = requestAnimationFrame(loop);
    return {
      open: function (on) { open = on; if (on && REDUCE) { t = 20; draw(); } },
      act: function (n) { go(n); if (REDUCE) t = 20; draw(); },
      next: function () { go((act + 1) % ACTS.length); if (REDUCE) t = 20; draw(); },
      lamp: function (x, y) { lamp.tx = Math.max(0.12, Math.min(0.88, x)); lamp.ty = Math.max(0.12, Math.min(0.8, y)); lamp.held = FPS * 3; },
      stop: function () { cancelAnimationFrame(raf); window.removeEventListener('resize', size); },
      size: size, frame: function (n) { t = n; f = n; draw(); }
    };
  }

  toys.shadowrealm = function (p, idx) {
    var K = C.random.shadow, names = K.acts || [], NUM = ['I', 'II', 'III', 'IV'];
    var canvas = h('canvas.tent__screen', { role: 'img', 'aria-label': 'A shadow play, cut from paper and moved one frame at a time.' });
    var caption = h('p.sr__act', { 'aria-live': 'polite' });
    var dots = names.map(function (n, i) {
      return h('button.sr__dot', { type: 'button', 'aria-label': 'Act ' + NUM[i] + ': ' + n, onclick: function () { pull(true); play.act(i); } });
    });
    var curtain = h('button.btn.sr__pull', { type: 'button', onclick: function () { pull(!tent.classList.contains('is-open')); } });
    var play;
    function label(i) {
      caption.textContent = tent.classList.contains('is-open') ? 'Act ' + NUM[i] + ' · ' + (names[i] || '') : 'The curtain is down.';
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i && tent.classList.contains('is-open')); });
    }
    function pull(on) {
      tent.classList.toggle('is-open', on);
      curtain.textContent = on ? 'Close the curtain' : 'Pull the curtain';
      play.open(on); label(now);
    }
    var now = 0;
    var tent = h('div.tent',
      svg(tentBack(), 'tent__art', '0 0 1000 780'),
      canvas,
      svg(tentFront(), 'tent__art tent__art--front', '0 0 1000 780'),
      h('button.tent__hit', { type: 'button', 'aria-label': 'The tent opening. Press to pull the curtain, or to skip to the next act.',
        onclick: function () { if (!tent.classList.contains('is-open')) pull(true); else play.next(); } }));
    var stage = h('div.sr', tent, h('div.sr__bar', curtain, caption, h('span.sr__dots', dots)));
    stage.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      if (play && r.width) play.lamp((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    });
    requestAnimationFrame(function () {
      if (!stage.isConnected) return;
      play = shadowPlay(canvas, function (i) { now = i; label(i); });
      SPA.onLeave(play.stop);
      SPA.shadow = play;
      pull(false);
    });
    return h('div.toy.toy--shadow', head(p, idx, K.intro), stage, SPA.footer());
  };

  SPA.toys = toys;
})();
