/* ════════════════════════════════════════════════════════════════════════
   projects.js — the Projects page: sidebar index, scattered folders and one
   bespoke panel per category (layouts follow Ema's Figma artboards).
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SPA = window.SPA, C = SPA.C, h = SPA.h, pad = SPA.pad;

  /* Where each folder sits on the desk (left %, top %) — from the Figma file. */
  var FOLDER_POS = [[12, 4], [74, 3], [36, 19], [62, 18], [18, 37], [80, 33], [46, 50], [70, 57], [16, 66], [52, 73]];

  SPA.views.projects = function (parts) {
    var slug = parts[0];
    var index = -1;
    C.categories.forEach(function (c, i) { if (c.slug === slug) index = i; });

    var list = h('ol.index');
    C.categories.forEach(function (cat, i) {
      list.appendChild(h('li',
        h('a.index__link' + (i === index ? '.is-open' : ''), {
          href: '#/projects/' + cat.slug, 'data-i': i,
          'aria-current': i === index ? 'page' : null },
          h('span.index__num', (i + 1) + '.'), cat.title)));
    });

    var side = h('aside.side',
      h('h1.side__title', h('a', { href: '#/projects' }, 'Projects')),
      list,
      h('div.side__foot',
        h('a', { href: '#/' }, 'Home'),
        h('a', { href: '#/about' }, 'About'),
        h('a', { href: '#/contact' }, 'Contact'),
        h('p', C.site.name + ' © ' + C.site.year)));

    var stage;
    if (index < 0) stage = folders(list);
    else {
      var cat = C.categories[index];
      stage = h('section.stage.stage--' + cat.layout, { 'aria-label': cat.title });
      stage.appendChild(SPA.panels[cat.layout](cat, index));
    }
    return h('div.projects' + (index < 0 ? '.projects--desk' : '.projects--open'), side, stage);
  };

  /* ── the desk of folders ─────────────────────────────────────────────── */
  function folders(list) {
    var desk = h('section.stage.desk', { 'aria-label': 'Project folders' });
    C.categories.forEach(function (cat, i) {
      var pos = FOLDER_POS[i % FOLDER_POS.length];
      var f = h('a.folder', { href: '#/projects/' + cat.slug, 'data-i': i,
        style: { left: pos[0] + '%', top: pos[1] + '%' } },
        h('span.folder__icon', SPA.img('fig/folder', { alt: '', eager: true })),
        h('span.folder__label', h('b', pad(i + 1)), ' ', cat.title));
      desk.appendChild(f);
    });
    /* hovering a folder lights up its line in the index, and vice versa */
    function link(a, b) {
      a.addEventListener('mouseover', function (e) { toggle(e, true); });
      a.addEventListener('mouseout', function (e) { toggle(e, false); });
      a.addEventListener('focusin', function (e) { toggle(e, true); });
      a.addEventListener('focusout', function (e) { toggle(e, false); });
      function toggle(e, on) {
        var t = e.target.closest('[data-i]'); if (!t) return;
        var twin = b.querySelector('[data-i="' + t.getAttribute('data-i') + '"]');
        if (twin) twin.classList.toggle('is-hot', on);
      }
    }
    link(desk, list); link(list, desk);
    return desk;
  }

  function head(cat, lines) {
    var t = h('h2.panel__title');
    (lines || [cat.title]).forEach(function (l, i) { if (i) t.appendChild(h('br')); t.appendChild(document.createTextNode(l)); });
    return t;
  }

  /* ── 1. EVENTS — sideways timeline of columns ────────────────────────── */
  SPA.panels.events = function (cat) {
    var track = h('div.rail__track');
    track.appendChild(h('div.rail__lead',
      h('p.eyebrow', 'Folder 01'),
      head(cat),
      h('p.lede', cat.intro),
      h('p.hint', 'Scroll sideways →')));
    cat.events.forEach(function (ev, i) {
      var items = SPA.asPosts(ev.images, { title: ev.title, category: ev.tag, text: ev.text.slice(0, 1) });
      var pics = h('div.event__pics' + (ev.images.length > 1 ? '.event__pics--many' : ''));
      ev.images.forEach(function (k, n) { pics.appendChild(SPA.shot(k, items, n)); });
      var col = h('article.event',
        h('div.event__no', { 'aria-hidden': 'true' }, pad(i + 1)),
        h('div.event__body',
          h('h3.event__title', ev.title),
          h('p.event__tag', ev.tag),
          ev.images.length ? pics : null,
          ev.text.map(function (p) { return h('p.event__text', p); }),
          ev.bullets.length ? h('ul.event__list', ev.bullets.map(function (b) { return h('li', b); })) : null,
          ev.cta ? h('a.btn', { href: '#/contact' }, ev.cta) : null));
      track.appendChild(col);
    });
    var rail = h('div.rail', track);
    return h('div.panel.panel--rail', rail, SPA.sideways(rail));
  };

  /* ── 2. INSTALLATIONS — cut-out objects, grain lifts on hover ────────── */
  SPA.panels.installations = function (cat) {
    var canvas = h('div.objects__canvas');
    canvas.appendChild(h('div.objects__head',
      head(cat, cat.heading),
      h('p.objects__index', cat.index),
      h('p.lede', cat.intro),
      h('p.meta', cat.meta)));
    var items = cat.items.map(function (it) {
      return { img: it.img, title: it.title, category: cat.heading.join(' '), text: it.desc };
    });
    cat.items.forEach(function (it, i) {
      var pic = h('span.object__pic',
        SPA.img(it.img, { alt: it.title, thumb: false }),
        SPA.img(it.img, { alt: '', thumb: false, cls: 'object__grain' }));
      var o = h('button.object' + (it.photo ? '.object--photo' : '') + '.object--card-' + it.card, {
        type: 'button', 'aria-label': it.title,
        style: { left: it.x + '%', top: it.y + '%', width: it.w + '%' },
        onclick: function () {
          /* first tap on touch screens reveals, second opens */
          if (window.matchMedia('(hover: none)').matches && !o.classList.contains('is-lit')) {
            canvas.querySelectorAll('.is-lit').forEach(function (n) { n.classList.remove('is-lit'); });
            o.classList.add('is-lit'); return;
          }
          SPA.openPost(items, i);
        } },
        pic,
        h('span.object__card',
          h('b', it.title),
          it.desc ? h('span', it.desc) : null,
          h('i', 'Click to open')));
      canvas.appendChild(o);
    });
    /* SVG grain: the speckled, switched-off look from the artboards */
    var svg = h('div', { html:
      '<svg class="objects__defs" aria-hidden="true" width="0" height="0"><defs>' +
      '<filter id="grain" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/>' +
      '<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 11 -6.3" result="specks"/>' +
      '<feColorMatrix in="SourceGraphic" type="matrix" values="0.42 0.06 0.02 0 0  0.04 0.36 0.04 0 0  0.04 0.06 0.44 0 0  0 0 0 1 0" result="dark"/>' +
      '<feComposite in="specks" in2="SourceGraphic" operator="in" result="cut"/>' +
      '<feMerge><feMergeNode in="dark"/><feMergeNode in="cut"/></feMerge>' +
      '</filter></defs></svg>' }).firstChild;
    return h('div.panel.panel--objects', svg, canvas);
  };

  /* ── 3. UX/UI — grid of screens with a detail strip ──────────────────── */
  SPA.panels.uxui = function (cat) {
    var items = cat.items.map(function (it) {
      return { img: it.img, title: it.title, category: it.meta, text: cat.body[0] };
    });
    var grid = h('div.ux__grid');
    var strip = h('div.ux__strip');
    function select(i) {
      var it = cat.items[i];
      grid.querySelectorAll('.ux__card').forEach(function (c, n) { c.classList.toggle('is-on', n === i); });
      strip.textContent = '';
      strip.appendChild(SPA.shot(it.img, items, i, { cls: 'ux__feature', thumb: false }));
      strip.appendChild(h('div.ux__about',
        h('h3', it.title), h('p.meta', it.meta),
        cat.body.map(function (p) { return h('p', p); }),
        h('button.btn', { type: 'button', onclick: function () { SPA.openPost(items, i); } }, 'View full size →')));
      strip.appendChild(h('dl.facts', cat.facts.map(function (f) { return [h('dt', f[0]), h('dd', f[1])]; })));
    }
    cat.items.forEach(function (it, i) {
      grid.appendChild(h('button.ux__card', { type: 'button', onclick: function () { select(i); } },
        h('span.ux__thumb', SPA.img(it.img, { alt: it.title })),
        h('b', it.title), h('span', it.meta)));
    });
    select(0);
    return h('div.panel.panel--scroll.ux',
      h('header.panel__head', head(cat), h('p.lede', cat.intro)),
      grid, strip);
  };

  /* ── 4. GRAPHIC DESIGN — sideways columns, one per project ───────────── */
  SPA.panels.columns = function (cat) {
    var track = h('div.cols__track');
    track.appendChild(h('div.cols__lead',
      h('div', h('p.eyebrow', cat.eyebrow + ' / ' + pad(cat.columns.length)), head(cat, cat.heading)),
      h('p.hint', cat.hint)));
    cat.columns.forEach(function (col, ci) {
      var items = SPA.asPosts(col.images, { title: col.name, category: col.kind, text: col.summary });
      track.appendChild(h('section.col',
        h('header.col__head',
          h('div.col__row', h('span', '(' + pad(ci + 1, 3) + ')'), h('span', col.year)),
          h('h3.col__name', col.name),
          h('p.col__kind', col.kind),
          h('p.col__sum', col.summary),
          h('p.col__scope', col.scope)),
        col.images.map(function (k, n) {
          return h('article.col__item', SPA.shot(k, items, n), h('p', pad(n + 1) + ' / ' + pad(col.images.length)));
        })));
    });
    var rail = h('div.cols', track);
    return h('div.panel.panel--rail', rail, SPA.sideways(rail));
  };

  /* ── 5. 3D — numbered rows with a spec box and a filmstrip ───────────── */
  SPA.panels.threed = function (cat) {
    var wrap = h('div.td');
    wrap.appendChild(h('header.td__head', h('h2.td__title', cat.heading), h('p.eyebrow', cat.sub), h('p.lede', cat.intro)));
    cat.rows.forEach(function (row, ri) {
      var items = SPA.asPosts(row.images, { title: row.title, category: row.kind, text: row.text });
      var current = 0;
      var hero = h('button.td__hero', { type: 'button', 'aria-label': 'Open ' + row.title,
        onclick: function () { SPA.openPost(items, current); } });
      var strip = h('div.td__strip');
      function show(n) {
        current = n;
        hero.textContent = '';
        hero.appendChild(SPA.img(row.images[n], { thumb: false, alt: row.title, eager: ri === 0 }));
        hero.appendChild(h('span.td__count', pad(n + 1) + ' / ' + pad(row.images.length)));
        strip.querySelectorAll('button').forEach(function (b, k) { b.classList.toggle('is-on', k === n); });
      }
      row.images.forEach(function (k, n) {
        strip.appendChild(h('button', { type: 'button', 'aria-label': row.title + ' image ' + (n + 1),
          onclick: function () { show(n); } }, SPA.img(k, { alt: '' })));
      });
      show(0);
      wrap.appendChild(h('article.td__row',
        h('div.td__no', '(' + pad(ri + 1, 3) + ')'),
        h('div.td__main', hero,
          h('div.td__spec',
            h('p.td__kind', row.kind),
            h('h3', row.title),
            h('dl', h('dt', 'What it is'), h('dd', row.what)),
            h('p.td__text', row.text))),
        row.images.length > 1 ? strip : null));
    });
    if (cat.sims) wrap.appendChild(h('aside.td__note', h('h3', cat.sims.title), h('p', cat.sims.text)));
    return h('div.panel.panel--scroll', wrap);
  };

  /* ── 6. VIDEO & MOTION — polaroid stills + a VHS television ──────────── */
  var POLAROIDS = [[54, 2, 2.2], [2, 20, -3], [57, 36, 1.5], [1, 60, -2.2], [34, 66, 1], [68, 68, -1.6]];

  SPA.panels.video = function (cat) {
    var vids = cat.videos.filter(function (v) { return SPA.videoInfo(v.video); });
    var screen = h('video.tv__video', { playsinline: true, loop: true, preload: 'none' });
    var label = h('span.tv__tape-name');
    var osd = h('span.tv__osd', 'PLAY ▶');
    var time = h('span.tv__time', '00:00:00');
    var info = h('div.video__info');
    var pile = h('div.video__pile');
    var selected = -1;

    function select(i, play) {
      var v = vids[i], meta = SPA.videoInfo(v.video);
      selected = i;
      screen.poster = SPA.posterSrc(v.video);
      screen.src = SPA.videoSrc(v.video);
      label.textContent = pad(i + 1) + '_' + v.title.toUpperCase();
      pile.querySelectorAll('.polaroid').forEach(function (p, n) { p.classList.toggle('is-on', n === i); });
      info.textContent = '';
      info.appendChild(h('img.video__still', { src: SPA.posterSrc(v.video), alt: '' }));
      info.appendChild(h('div', h('h3', pad(i + 1) + '_' + v.title), h('p.meta', SPA.clock(meta.d) + '  |  ' + v.kind)));
      info.appendChild(h('dl.facts', h('dt', 'Format'), h('dd', meta.w + ' × ' + meta.h),
        h('dt', 'Made by'), h('dd', C.site.name)));
      info.appendChild(h('button.btn', { type: 'button', onclick: function () {
        screen.pause(); SPA.openPost(vids.map(function (x) { return { video: x.video, title: x.title, category: x.kind }; }), i);
      } }, 'View full size →'));
      if (play) { screen.play().catch(function () {}); } else { osd.textContent = 'PLAY ▶'; }
    }
    function toggle() { if (screen.paused) screen.play().catch(function () {}); else screen.pause(); }
    screen.addEventListener('play', function () { osd.textContent = ''; });
    screen.addEventListener('pause', function () { osd.textContent = 'PAUSE ❙❙'; });
    screen.addEventListener('timeupdate', function () { time.textContent = '00:' + SPA.clock(screen.currentTime); });
    SPA.onLeave(function () { screen.pause(); screen.removeAttribute('src'); });

    vids.forEach(function (v, i) {
      var p = POLAROIDS[i % POLAROIDS.length];
      pile.appendChild(h('button.polaroid', { type: 'button', 'aria-label': 'Play ' + v.title,
        style: { left: p[0] + '%', top: p[1] + '%', '--tilt': p[2] + 'deg' },
        onclick: function () { select(i, true); } },
        h('img', { src: SPA.posterSrc(v.video), alt: '', loading: 'lazy' }),
        h('span.polaroid__cap', h('span', pad(i + 1) + '_' + v.title), h('span', SPA.clock(SPA.videoInfo(v.video).d)))));
    });

    var tv = h('div.tv',
      h('div.tv__box',
        h('button.tv__screen', { type: 'button', 'aria-label': 'Play or pause', onclick: toggle },
          screen, h('span.tv__lines'), h('span.tv__brand', 'SP/VIDEO'), osd, time)),
      h('div.tv__deck',
        h('div.tv__slot', h('div.tv__tape', label, h('span', 'VHS'))),
        h('button.tv__eject', { type: 'button', onclick: function () { select((selected + 1) % vids.length, true); } }, 'NEXT'),
        h('span.tv__led')),
      h('p.hint', '↑ Click a still to play'));

    if (vids.length) select(0, false);
    return h('div.panel.panel--video',
      h('div.video__top',
        h('div.video__left', h('header', head(cat), h('p.lede', cat.intro)), pile),
        h('div.video__right', tv)),
      info);
  };

  /* ── 7. PROJECTION — contact strip + a monitor ───────────────────────── */
  SPA.panels.projection = function (cat) {
    var items = cat.items.filter(function (it) { return it.img || SPA.videoInfo(it.video); });
    var view = h('div.monitor__view');
    var title = h('p.monitor__title'), sub = h('p.meta');
    var bar = h('div.monitor__bar'), fill = h('div'), clock = h('span', '0:00');
    var playBtn = h('button.monitor__play', { type: 'button', 'aria-label': 'Play or pause' }, '▶');
    bar.appendChild(fill);
    var thumbs = h('div.proj__thumbs');
    var video = null, selected = 0;

    function select(i, play) {
      var it = items[i]; selected = i;
      if (video) { video.pause(); video = null; }
      view.textContent = '';
      if (it.video) {
        var meta = SPA.videoInfo(it.video);
        video = h('video', { src: SPA.videoSrc(it.video), poster: SPA.posterSrc(it.video), playsinline: true, loop: true, preload: 'metadata' });
        video.addEventListener('timeupdate', function () {
          fill.style.width = (video.duration ? video.currentTime / video.duration * 100 : 0) + '%';
          clock.textContent = SPA.clock(video.currentTime).slice(1) + ' / ' + SPA.clock(meta.d).slice(1);
        });
        video.addEventListener('play', function () { playBtn.textContent = '❙❙'; });
        video.addEventListener('pause', function () { playBtn.textContent = '▶'; });
        view.appendChild(video);
        clock.textContent = '0:00 / ' + SPA.clock(meta.d).slice(1);
        if (play) video.play().catch(function () {});
      } else {
        view.appendChild(SPA.img(it.img, { thumb: false, alt: it.title }));
        clock.textContent = 'STILL';
      }
      fill.style.width = '0%'; playBtn.textContent = '▶';
      playBtn.disabled = !it.video;
      title.textContent = it.title;
      sub.textContent = pad(i + 1) + ' / ' + pad(items.length) + ' · ' + (it.video ? 'Video' : 'Photo');
      thumbs.querySelectorAll('button').forEach(function (b, n) { b.classList.toggle('is-on', n === i); });
    }
    function toggle() { if (!video) return; if (video.paused) video.play().catch(function () {}); else video.pause(); }
    playBtn.addEventListener('click', toggle);
    bar.addEventListener('click', function (e) {
      if (!video || !video.duration) return;
      var r = bar.getBoundingClientRect();
      video.currentTime = (e.clientX - r.left) / r.width * video.duration;
    });
    SPA.onLeave(function () { if (video) video.pause(); });

    items.forEach(function (it, i) {
      thumbs.appendChild(h('button', { type: 'button', 'aria-label': it.title, onclick: function () { select(i, true); } },
        it.video ? h('img', { src: SPA.posterSrc(it.video), alt: '', loading: 'lazy' }) : SPA.img(it.img, { alt: '' }),
        h('span', pad(i + 1) + (it.video ? ' ▶' : ''))));
    });
    select(0, false);

    var frame = h('div.monitor',
      h('button.monitor__screen', { type: 'button', 'aria-label': 'Play or pause', onclick: toggle },
        view, h('span.monitor__lines'), h('span.monitor__rec', 'LIVE / REC')),
      h('div.monitor__ctrl', playBtn, clock, bar,
        h('button.monitor__full', { type: 'button', 'aria-label': 'Open full size', onclick: function () {
          if (video) video.pause();
          SPA.openPost(items.map(function (x) { return { img: x.img, video: x.video, title: x.title, category: cat.title, text: cat.intro }; }), selected);
        } }, '⤢')));
    return h('div.panel.panel--proj',
      h('div.vlabel', 'Projection'),
      thumbs,
      h('div.proj__main', frame, h('div.proj__cap', h('div', title, sub), h('p.meta', cat.meta))),
      h('div.proj__text', head(cat), h('p.lede', cat.intro)));
  };

  /* ── 8. DIGITAL ART — pictures pinned to a dot field, plus a quiet stack ─ */
  SPA.panels.digital = function (cat) {
    var field = h('div.field');
    var items = SPA.asPosts(cat.field, { title: 'Digital art', category: cat.title, text: cat.intro });
    /* three loose columns; each picture nudged off the grid */
    var cols = [0, 0, 0], lefts = [3, 36, 68], z = 1;
    cat.field.forEach(function (k, i) {
      var c = cols.indexOf(Math.min.apply(null, cols));
      var w = 24 + ((i * 7) % 5);                       /* 24–28 % wide */
      var hgt = w / SPA.ratio(k);                       /* in % of field width */
      var dx = ((i * 13) % 7) - 3, top = cols[c] + 2 + ((i * 5) % 4);
      cols[c] = top + hgt + 3;
      var pin = h('button.pin', { type: 'button', 'aria-label': 'Open study ' + (i + 1),
        style: { left: (lefts[c] + dx) + '%', top: top + 'cqw', width: w + '%' } },
        SPA.img(k, { alt: 'Digital art study ' + (i + 1) }), h('span', pad(i + 1, 3)));
      draggable(pin, function () { SPA.openPost(items, i); }, function () { pin.style.zIndex = ++z; });
      field.appendChild(pin);
    });
    field.style.height = (Math.max.apply(null, cols) + 6) + 'cqw';

    var stackItems = SPA.asPosts(cat.stack, { title: cat.stackTitle, category: cat.title, text: cat.stackText });
    var stack = h('div.stack', cat.stack.map(function (k, i) {
      return h('div.stack__row', h('span', '(' + pad(i + 1, 3) + ')'), SPA.shot(k, stackItems, i));
    }));
    return h('div.panel.panel--digital',
      h('div.vlabel', 'Digital art'),
      h('section.digital__field',
        h('div.field__scroll', h('div.field__wrap', field)),
        h('footer.digital__foot', h('b', 'Dot field'), h('p', cat.fieldNote),
          h('div.tags', h('span', 'Study'), h('span', 'Collage'), h('span', 'Painting')))),
      h('section.digital__stack',
        h('header', head(cat), h('p.lede', cat.intro)),
        stack,
        h('footer.digital__foot', h('b', cat.stackTitle), h('p', cat.stackText), h('div.tags', h('span', 'Sequence')))));
  };

  /* drag with the mouse / finger; a press without movement counts as a click */
  function draggable(el, onClick, onGrab) {
    var start = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      start = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop, moved: false, touch: e.pointerType !== 'mouse' };
      if (!start.touch) { el.setPointerCapture(e.pointerId); onGrab(); }
    });
    el.addEventListener('pointermove', function (e) {
      if (!start || start.touch) return;                /* touch keeps native scrolling */
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!start.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
      start.moved = true; el.classList.add('is-dragging');
      el.style.left = (start.left + dx) + 'px'; el.style.top = (start.top + dy) + 'px';
    });
    function end() { if (start) { var moved = start.moved; start = null; el.classList.remove('is-dragging'); return moved; } return true; }
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', function (e) { if (el._dragged) { e.preventDefault(); el._dragged = false; return; } onClick(); });
    el.addEventListener('pointerup', function () { el._dragged = end() === true; });
  }

  /* ── 9. PHOTOGRAPHY — masonry wall ───────────────────────────────────── */
  SPA.panels.photography = function (cat) {
    var items = SPA.asPosts(cat.photos, { title: cat.title, category: 'Film + digital', text: cat.intro });
    return h('div.panel.panel--scroll.photos',
      h('header.panel__head', h('h2.panel__title.panel__title--xl', cat.title), h('p.lede', cat.intro)),
      h('div.photos__wall', cat.photos.map(function (k, i) { return SPA.shot(k, items, i); })));
  };

  /* ── 10. MARKETING — pin-board columns of cards ──────────────────────── */
  SPA.panels.marketing = function (cat) {
    var track = h('div.board__track');
    track.appendChild(h('div.rail__lead', h('p.eyebrow', 'Folder 10'), head(cat), h('p.lede', cat.intro), h('p.hint', 'Scroll sideways →')));
    cat.projects.forEach(function (proj) {
      var pics = proj.cards.filter(function (c) { return c.img; });
      var items = pics.map(function (c) { return { img: c.img, title: proj.name, category: proj.tags.join(' / '), text: c.caption }; });
      var a = h('div.board__sub'), b = h('div.board__sub.board__sub--low');
      proj.cards.forEach(function (card, i) {
        var tilt = ((i * 37) % 9 - 4) * 0.28;
        var el = card.img
          ? h('figure.note', { style: { '--tilt': tilt + 'deg' } }, SPA.shot(card.img, items, pics.indexOf(card)), card.caption ? h('figcaption', card.caption) : null)
          : h('div.note.note--text', { style: { '--tilt': tilt + 'deg' } }, h('p', card.text));
        (i % 2 ? b : a).appendChild(el);
      });
      track.appendChild(h('section.board__col',
        h('div.board__wall', a, b),
        h('footer.board__foot',
          h('div', h('b', proj.name), h('span', proj.year)),
          h('div.tags', proj.tags.map(function (t) { return h('span', t); })))));
    });
    var rail = h('div.rail', track);
    return h('div.panel.panel--rail', rail, SPA.sideways(rail));
  };
})();
