/* ════════════════════════════════════════════════════════════════════════
   pages.js — Home (orbiting works), Highlights (pin-board of photo stacks),
   Vocabulary, About and Contact.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SPA = window.SPA, C = SPA.C, h = SPA.h, pad = SPA.pad;

  /* ── HOME ────────────────────────────────────────────────────────────────
     1. the sphere of selected works   2. the statement + 3D knot
     3. four kinds of work, each with flying pictures and an Explore link
     4. featured pieces                5. a closing invitation              */
  SPA.views.home = function () {
    var D = C.home;
    var floor = h('canvas.floor', { 'aria-hidden': 'true' });
    var knot = h('canvas.knot', { 'aria-label': '3D knot. Drag to carry it around and turn it, click to change its material.', role: 'img' });
    var root = h('div.home', floor, orbit(), manifesto(knot), D.sections.map(category), featured(), outro());
    requestAnimationFrame(function () {
      if (!root.isConnected) return;
      SPA.onLeave(SPA.fx.floor(floor));
      SPA.onLeave(SPA.fx.flyers(root));
      SPA.onLeave(SPA.fx.knot(knot));
    });
    return root;
  };

  /* one flying picture: effect version on top, the real one underneath */
  function flyer(f, items, n) {
    var info = SPA.info(f.img) || {};
    var kids = [SPA.img(f.img, { alt: items[n].title })];
    if (f.fx) kids.push(h('img.fly__fx', { src: SPA.fxSrc(f.img, f.fx), alt: '', loading: 'lazy', draggable: 'false' }));
    return h('button.fly' + (info.a ? '.fly--cut' : ''), { type: 'button', 'aria-label': 'Open ' + items[n].title,
      'data-d': f.d, 'data-r': f.r, style: { left: f.x + '%', top: f.y + '%', width: f.w + '%' },
      onclick: function () { SPA.openPost(items, n); } }, kids);
  }
  function stage(list, meta, cls) {
    list = list.filter(function (f) { return SPA.info(f.img); });
    var items = list.map(function (f) { return { img: f.img, title: meta.title, category: meta.category, text: meta.text }; });
    return h('div.sky' + (cls ? '.' + cls : ''), list.map(function (f, n) { return flyer(f, items, n); }));
  }
  function arrow() { return h('span.arrow', { 'aria-hidden': 'true' }, '——>'); }

  function manifesto(knot) {
    var M = C.home.manifesto;
    return h('section.manifesto',
      stage(M.flyers, { title: C.site.name, category: C.site.tagline, text: C.site.statement }, 'manifesto__stage'),
      h('div.manifesto__copy',
        h('div.manifesto__lockup',
          h('h2.manifesto__big', M.lines.map(function (l, i) { return [i ? h('br') : null, l]; })),
          h('div.manifesto__knot', h('div.knot-move', knot, h('p.manifesto__hint', M.hint)))),
        h('p.manifesto__say', C.site.statement)));
  }

  function category(s, i) {
    var id = 'cat-' + s.link;
    return h('section.cat' + (i % 2 ? '.cat--flip' : ''), { 'aria-labelledby': id },
      h('div.cat__text',
        h('span.cat__no', { 'aria-hidden': 'true' }, s.no),
        h('h2.cat__title' + (s.title.length > 16 ? '.cat__title--long' : ''), { id: id }, s.title),
        h('div.cat__card',
          h('p', s.text),
          h('a.go', { href: '#/projects/' + s.link }, 'Explore ', arrow()))),
      stage(s.flyers, { title: s.title, category: s.no + ' / ' + s.title, text: s.text }));
  }

  function featured() {
    var F = C.home.featured;
    function stackItems(label) {                                 /* the matching Highlights stack */
      var found = null;
      C.highlights.columns.forEach(function (col) { col.stacks.forEach(function (st) { if (st.label === label) found = st; }); });
      return found ? SPA.asPosts(found.images.filter(function (k) { return SPA.info(k); }),
        { title: found.label, category: found.category, text: found.text }) : null;
    }
    return h('section.featured',
      stage(F.flyers, { title: F.title, category: 'Highlights', text: '' }, 'featured__stage'),
      h('header.featured__head', h('p.eyebrow', F.eyebrow), h('h2.script', F.title)),
      h('div.featured__grid', F.items.filter(function (f) { return SPA.info(f.img); }).map(function (f) {
        var items = stackItems(f.stack) || [{ img: f.img, title: f.title, category: f.kind }];
        return h('button.feat', { type: 'button', 'aria-label': 'Open ' + f.title, onclick: function () { SPA.openPost(items, 0); } },
          SPA.img(f.img, { thumb: false, alt: f.title }),
          h('span.feat__cap', h('i', f.title), h('span', f.kind)));
      })),
      h('p.featured__more', h('a.go', { href: '#/highlights' }, 'All highlights ', arrow())));
  }

  function outro() {
    var O = C.home.outro;
    return h('section.outro',
      h('h2.script', O.title),
      h('p.outro__text', O.text),
      h('p.outro__links',
        h('a.go', { href: '#/contact' }, 'Write to me ', arrow()),
        h('a.go', { href: '#/projects' }, 'See my projects ', arrow())),
      footer());
  }

  /* the turning sphere of selected works */
  function orbit() {
    var works = C.home.works.filter(function (w) { return SPA.info(w.img); });
    var cloud = h('div.orbit__cloud', { 'aria-label': 'Selected work image cloud' });
    var status = h('span', 'Select an image to focus · drag any way to spin');
    var caption = h('div.orbit__caption', { hidden: true, 'aria-live': 'polite' });
    var crumb = h('p.orbit__crumb', { hidden: true });
    var el;
    var golden = Math.PI * (3 - Math.sqrt(5));
    var spin = 0.00016, selected = -1, raf = 0, last = performance.now();
    var reduce = SPA.fx.reduce;
    /* The sphere's orientation is a 3x3 rotation matrix, so it can turn in every direction. */
    var R = [1, 0, 0, 0, 1, 0, 0, 0, 1], vx = 0, vy = 0;
    function turnY(a) { var c = Math.cos(a), s = Math.sin(a), i, p, q;
      for (i = 0; i < 3; i++) { p = R[i]; q = R[6 + i]; R[i] = c * p + s * q; R[6 + i] = -s * p + c * q; } }
    function turnX(a) { var c = Math.cos(a), s = Math.sin(a), i, p, q;
      for (i = 0; i < 3; i++) { p = R[3 + i]; q = R[6 + i]; R[3 + i] = c * p - s * q; R[6 + i] = s * p + c * q; } }

    var nodes = works.map(function (w, i) {
      var r = SPA.ratio(w.img);
      var b = h('button.orbit__item' + (r >= 1 ? '.is-wide' : '.is-tall'), { type: 'button',
        'aria-label': w.title + ', ' + w.category, 'aria-pressed': 'false',
        onclick: function () { if (!dragged) pick(selected === i ? -1 : i); } },
        h('span.orbit__pic', SPA.img(w.img, { alt: '', eager: true })),
        h('span.orbit__name', pad(i + 1) + ' / ' + w.title));
      cloud.appendChild(b);
      return b;
    });

    function catTitle(slug) {
      var c = C.categories.filter(function (x) { return x.slug === slug; })[0];
      return c ? c.title : 'Projects';
    }
    function pick(i) {
      selected = i;
      nodes.forEach(function (n, k) {
        n.classList.toggle('is-selected', k === i);
        n.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      });
      cloud.classList.toggle('has-selection', i >= 0);
      el.classList.toggle('has-selection', i >= 0);
      caption.hidden = i < 0;
      crumb.hidden = i < 0;
      if (i >= 0) {
        var w = works[i];
        /* swap in the large file once a work is focused */
        var im = nodes[i].querySelector('img'); im.src = SPA.src(w.img, false);
        var href = '#/projects/' + (w.link || '');
        caption.textContent = '';
        caption.appendChild(h('p.meta', pad(i + 1) + ' / ' + pad(works.length)));
        caption.appendChild(h('h2.orbit__title', w.title));
        caption.appendChild(h('p.orbit__cat', [w.category, w.year].filter(Boolean).join(' · ')));
        if (w.desc) caption.appendChild(h('p.orbit__desc', w.desc));
        caption.appendChild(h('a.orbit__more', { href: href }, 'See more ', arrow()));
        crumb.textContent = '';
        crumb.appendChild(h('a', { href: '#/projects' }, 'Projects'));
        crumb.appendChild(document.createTextNode(' / '));
        crumb.appendChild(h('a', { href: href }, catTitle(w.link)));
        status.textContent = 'Click the image again or press esc to release';
        if (window.scrollY > 40) window.scrollTo({ top: 0, behavior: 'smooth' });
      } else status.textContent = 'Select an image to focus · drag any way to spin';
      layout();
    }

    function layout() {
      var W = cloud.clientWidth, H = cloud.clientHeight;
      var portrait = H > W;
      var rx = W * (portrait ? 0.34 : 0.36), ry = H * (portrait ? 0.31 : 0.32), cy = H * (portrait ? 0.56 : 0.57);
      var base = Math.max(86, Math.min(190, Math.min(W, H) * 0.24));
      /* scrolling away: the sphere bursts outward and the pictures rush past you */
      var away = selected >= 0 ? 0 : Math.max(0, Math.min(1.4, window.scrollY / (H * 0.8)));
      nodes.forEach(function (n, i) {
        if (i === selected) { n.style.transform = ''; n.style.zIndex = 200; n.style.opacity = 1; n.style.width = ''; return; }
        var by = 1 - (i / (nodes.length - 1)) * 2;
        var ring = Math.sqrt(1 - by * by), a = golden * i;
        var bx = Math.cos(a) * ring, bz = Math.sin(a) * ring;
        var x = R[0] * bx + R[1] * by + R[2] * bz, y = R[3] * bx + R[4] * by + R[5] * bz;
        var z = R[6] * bx + R[7] * by + R[8] * bz, depth = (z + 1) / 2;
        var push = 1 + away * (0.5 + depth * 2.4);
        var s = (0.5 + depth * 0.5) * (1 + away * depth * 1.3);
        n.style.width = base + 'px';
        n.style.transform = 'translate3d(' + (W / 2 + x * rx * push) + 'px,' + (cy + y * ry * push) + 'px,0) translate(-50%,-50%) scale(' + s.toFixed(3) + ')';
        n.style.zIndex = Math.round(depth * 100);
        var o = selected >= 0 ? 0.04 + depth * 0.12 : 0.22 + depth * 0.78;
        n.style.opacity = (o * Math.max(0, 1 - away * 0.85)).toFixed(2);
        var tone = depth > 0.66 ? 'near' : depth > 0.33 ? 'mid' : 'far';
        if (n.getAttribute('data-tone') !== tone) n.setAttribute('data-tone', tone);
      });
    }
    function tick(now) {
      var dt = Math.min(now - last, 40); last = now;
      raf = requestAnimationFrame(tick);
      if (window.scrollY > cloud.clientHeight * 1.5) return;      /* out of sight: rest */
      if (!dragging) {                                   /* idle drift + momentum after a throw */
        turnY(dt * spin + vx); turnX(vy);
        vx *= 0.94; vy *= 0.94;
      }
      layout();
    }

    /* drag to spin the sphere (a finger spins it sideways and still scrolls the page) */
    var dragging = null, dragged = false;
    cloud.addEventListener('pointerdown', function (e) {
      dragging = { x: e.clientX, y: e.clientY, far: 0, touch: e.pointerType === 'touch' }; dragged = false; vx = vy = 0;
    });
    function move(e) {
      if (!dragging) return;
      var dx = e.clientX - dragging.x, dy = dragging.touch ? 0 : e.clientY - dragging.y;
      dragging.x = e.clientX; dragging.y = e.clientY;
      dragging.far += Math.abs(dx) + Math.abs(dy);
      if (dragging.far > 6) dragged = true;
      vx = dx * 0.006; vy = -dy * 0.006;
      turnY(vx); turnX(vy);
      if (reduce) layout();
    }
    function up() { dragging = null; setTimeout(function () { dragged = false; }, 0); }
    function key(e) { if (e.key === 'Escape' && selected >= 0) pick(-1); }
    function onScroll() { if (reduce) layout(); }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key);
    window.addEventListener('resize', layout);
    window.addEventListener('scroll', onScroll, { passive: true });
    SPA.onLeave(function () {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up); window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', key); window.removeEventListener('resize', layout);
    });

    el = h('section.orbit',
      h('div.orbit__intro', h('p.eyebrow', C.home.eyebrow), h('p.orbit__sub', C.home.sub)),
      h('div.orbit__motto', SPA.img('logo/swissknifelogotext', { alt: C.site.tagline, eager: true })),
      cloud,
      h('div.orbit__status', h('i.dot'), status),
      crumb,
      caption,
      h('a.orbit__down', { href: '#/', onclick: function (e) {
        e.preventDefault();
        window.scrollTo({ top: el.offsetHeight * 0.92, behavior: reduce ? 'auto' : 'smooth' });
      } }, 'Scroll ', h('span', { 'aria-hidden': 'true' }, '↓')));
    requestAnimationFrame(function () { layout(); if (!reduce) raf = requestAnimationFrame(tick); });
    return el;
  }

  /* ── HIGHLIGHTS — columns of taped photo stacks ──────────────────────── */
  SPA.views.highlights = function () {
    var H = C.highlights;
    var track = h('div.wall__track');
    H.columns.forEach(function (col, ci) {
      var column = h('section.wall__col', h('h2.wall__name', h('span', pad(ci + 1)), col.name));
      col.stacks.forEach(function (st, si) {
        var keys = st.images.filter(function (k) { return SPA.info(k); });
        if (!keys.length) return;
        var items = SPA.asPosts(keys, { title: st.label, category: st.category, text: st.text });
        var tilt = (((ci * 3 + si * 5) % 7) - 3) * 0.7;
        var stack = h('button.pile', { type: 'button', 'aria-label': 'Open ' + st.label + ', ' + keys.length + ' image' + (keys.length > 1 ? 's' : ''),
          style: { '--tilt': tilt + 'deg' }, onclick: function () { SPA.openPost(items, 0); } });
        keys.slice(1, 3).reverse().forEach(function (k, n) {
          stack.appendChild(h('span.pile__under.pile__under--' + (keys.slice(1, 3).length - n), SPA.img(k, { alt: '' })));
        });
        stack.appendChild(h('span.pile__top', SPA.img(keys[0], { alt: st.label }),
          h('span.pile__cap', h('span', st.category), h('span', keys.length > 1 ? keys.length + ' photos' : '1 photo'))));
        stack.appendChild(h('span.tape', st.label));
        column.appendChild(stack);
      });
      track.appendChild(column);
    });
    var rail = h('div.wall', track);
    return h('div.highlights',
      h('header.page__head',
        h('p.eyebrow', '— highlights —'), h('h1.page__title', H.title), h('p.lede', H.intro),
        h('p.wall__hint', H.columns.length + ' boards · scroll sideways →')),
      rail, SPA.sideways(rail));
  };

  /* ── VOCABULARY ──────────────────────────────────────────────────────── */
  SPA.views.vocabulary = function () {
    var V = C.vocabulary;
    var items = V.entries.map(function (e) { return { img: e.img, title: e.letter + ' — ' + e.word, category: 'Vocabulary', text: e.def }; });
    return h('div.page.vocab',
      h('header.page__head', h('p.eyebrow', '— glossary —'), h('h1.page__title', V.title), h('p.lede', V.intro)),
      V.entries.map(function (e, i) {
        return h('article.entry' + (i % 2 ? '.entry--flip' : ''),
          h('div.entry__letter', { 'aria-hidden': 'true' }, e.letter),
          SPA.shot(e.img, items, i, { cls: 'entry__pic', thumb: false }),
          h('div.entry__copy', h('p.meta', '(' + pad(i + 1, 3) + ')'), h('h2', e.word), h('p', e.def)));
      }),
      h('p.vocab__outro', V.outro),
      footer());
  };

  /* ── ABOUT ───────────────────────────────────────────────────────────────
     Dark opening with the portrait: letters scatter from the cursor and
     embers drift toward it. Then lists, the knife loop and the film strip.  */
  SPA.views.about = function () {
    var A = C.about, S = C.site;
    var knife = knifeLoop(S.statement);
    var socials = Object.keys(S.socials).filter(function (k) { return S.socials[k]; });
    var embers = h('canvas.about__embers', { 'aria-hidden': 'true' });
    var words = h('div.about__words',
      h('h1.about__title', { 'data-disperse': '' }, A.title.toUpperCase()),
      h('p.about__sub', { 'data-disperse': '' }, A.sub),
      A.body.map(function (p, i) { return h('p.about__say' + (i ? '' : '.about__say--lead'), { 'data-disperse': '' }, p); }));
    var hero = h('section.about__hero',
      h('div.about__bg', { 'aria-hidden': 'true' }),
      embers,
      h('div.about__inner',
        SPA.info('about/hi-trim') ? SPA.img('about/hi-trim', { thumb: false, alt: 'Hi! I’m Ema', cls: 'about__hi', eager: true }) : null,
        words,
        h('div.about__card',
          h('p.about__card-name', S.owner),
          h('a', { href: 'mailto:' + S.email }, S.email),
          socials.length ? h('p.about__card-links', socials.map(function (k) {
            return h('a', { href: S.socials[k], target: '_blank', rel: 'me noopener' }, k);
          })) : null,
          S.cv ? h('a.go', { href: S.cv, download: true }, 'Download CV (PDF) ↓') : null)));
    var page = h('div.about',
      hero,
      h('div.about__rest',
        h('div.about__lists',
          h('div', h('h2.meta', 'Disciplines'), h('ul', A.disciplines.map(function (d) { return h('li', d); }))),
          h('div', h('h2.meta', 'Places'), h('ul', A.places.map(function (d) { return h('li', d); })))),
        h('section.about__knife', knife,
          SPA.img('logo/swissknifelogotext', { alt: S.tagline, cls: 'about__tagline' })),
        SPA.info('about/imagestrip') ? h('div.about__strip', SPA.img('about/imagestrip', { thumb: false, alt: 'Film strip of recent work' })) : null,
        footer()));
    requestAnimationFrame(function () {
      if (!page.isConnected) return;
      SPA.onLeave(SPA.fx.disperse(words));
      SPA.onLeave(SPA.fx.embers(embers));
    });
    return page;
  };

  /* the statement travelling round the Swiss-knife outline */
  function knifeLoop(text) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'knife'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', text);
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('id', 'knife-path'); path.setAttribute('d', window.SPA_KNIFE_PATH || '');
    path.setAttribute('fill', 'none');
    var t = document.createElementNS(NS, 'text');
    var tp = document.createElementNS(NS, 'textPath');
    tp.setAttribute('href', '#knife-path');
    t.appendChild(tp); svg.appendChild(path); svg.appendChild(t);
    var raf = 0;
    requestAnimationFrame(function () {
      if (!svg.isConnected) return;
      var box = path.getBBox(), len = path.getTotalLength();
      var m = Math.max(box.width, box.height) * 0.06;
      svg.setAttribute('viewBox', (box.x - m) + ' ' + (box.y - m) + ' ' + (box.width + m * 2) + ' ' + (box.height + m * 2));
      t.setAttribute('font-size', len / 175);
      t.setAttribute('letter-spacing', len / 2600);
      var unit = text.toUpperCase() + '  ✦  ';
      tp.textContent = unit;
      var one = t.getComputedTextLength() || len / 3;
      var n = Math.ceil(len / one) + 2, s = '';
      for (var i = 0; i < n; i++) s += unit;
      tp.textContent = s;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var off = 0, last = performance.now();
      (function loop(now) {
        off = (off + (now - last) * len / 60000) % one; last = now;
        tp.setAttribute('startOffset', -off);
        raf = requestAnimationFrame(loop);
      })(last);
    });
    SPA.onLeave(function () { cancelAnimationFrame(raf); });
    return svg;
  }

  /* ── CONTACT — the Post-it ───────────────────────────────────────────── */
  SPA.views.contact = function () {
    var S = C.site, K = C.contact;
    var status = h('p.postit__status', { role: 'status', 'aria-live': 'polite' });
    var send = h('button.btn.btn--solid', { type: 'submit' }, 'Send');
    function field(label, name, type, required) {
      var input = type === 'textarea'
        ? h('textarea', { name: name, rows: 5, required: required })
        : h('input', { type: type, name: name, required: required, autocomplete: name === 'subject' ? 'off' : name });
      return h('label.postit__field', h('span', label), input);
    }
    var form = h('form.postit', { novalidate: true, onsubmit: submit },
      h('span.postit__paper', { 'aria-hidden': 'true' }),
      h('span.postit__tape', { 'aria-hidden': 'true' }),
      field('Name', 'name', 'text', true),
      field('Email', 'email', 'email', true),
      field('Subject', 'subject', 'text', false),
      field('Message', 'message', 'textarea', true),
      h('div.postit__row', send, h('a', { href: 'mailto:' + S.email }, 'or just email me')),
      status);

    function submit(e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = String(d.get('name') || '').trim(), email = String(d.get('email') || '').trim();
      var subject = String(d.get('subject') || '').trim() || 'Hello from ' + S.name;
      var message = String(d.get('message') || '').trim();
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
        status.textContent = 'Please fill in your name, a valid email and a message.'; status.className = 'postit__status is-error'; return;
      }
      function viaMail() {
        location.href = 'mailto:' + S.email + '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent('From: ' + name + ' <' + email + '>\n\n' + message);
        status.textContent = 'Your mail app should open with the message ready to send.'; status.className = 'postit__status';
      }
      if (!S.web3formsKey) return viaMail();
      send.disabled = true; send.textContent = 'Sending…';
      fetch('https://api.web3forms.com/submit', { method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: S.web3formsKey, name: name, email: email, subject: subject, message: message }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); status.textContent = '✓ Thanks — I’ll get back to you soon.'; status.className = 'postit__status'; })
        .catch(viaMail)
        .then(function () { send.disabled = false; send.textContent = 'Send'; });
    }

    return h('div.page.contact',
      h('div.contact__copy',
        h('p.eyebrow', '— contact —'),
        h('h1.page__title', K.title),
        h('p.lede', K.intro),
        h('p.contact__mail', h('a', { href: 'mailto:' + S.email }, S.email))),
      form,
      SPA.info('contact/layer-1-star') ? SPA.img('contact/layer-1-star', { alt: '', cls: 'contact__star' }) : null,
      footer());
  };

  function footer() {
    return h('footer.foot', h('span', C.site.name + ' © ' + C.site.year), h('a', { href: 'mailto:' + C.site.email }, C.site.email));
  }
})();
