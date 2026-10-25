/* Shiatsu · movimiento (25-oct-2026). Ver motion.css. Si falta este archivo, la página funciona igual. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('mo');
  const fine = matchMedia('(pointer:fine)').matches;

  /* ---- 1 · Titulares palabra a palabra ---- */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    let n = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.append(document.createTextNode(p)); return; }
            const w = document.createElement('span'); w.className = 'mw';
            const i = document.createElement('span'); i.className = 'mw-i';
            i.textContent = p; i.style.setProperty('--i', Math.min(n++, 12));
            w.append(i); frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') walk(child);
      });
    };
    walk(el);
  }
  const titles = [...document.querySelectorAll('.hero h1,.bridge h2,.services-intro h2,.perfil h2,#first-visit-title,#services-closing-title,#direct-booking-title,.first-visit-notes-head h3')];
  titles.forEach(splitWords);
  const hero = document.querySelector('.hero h1');
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: .3 });
  titles.forEach(t => { if (t === hero) return; io.observe(t); });
  const startHero = () => requestAnimationFrame(() => requestAnimationFrame(() => hero?.classList.add('is-in')));
  if (document.fonts?.ready) document.fonts.ready.then(startHero); else startHero();
  /* red de seguridad: si algo falla, a los 4 s todo se ve */
  setTimeout(() => titles.forEach(t => t.classList.add('is-in')), 4000);

  /* ---- 3 · Progreso de lectura ---- */
  const bar = document.createElement('div');
  bar.className = 'mo-progress'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>';
  document.body.append(bar);
  let pt = false;
  const progress = () => {
    pt = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? Math.min(1, Math.max(0, scrollY / max)).toFixed(4) : 0);
  };
  addEventListener('scroll', () => { if (!pt) { pt = true; requestAnimationFrame(progress); } }, { passive: true });
  addEventListener('resize', progress, { passive: true });
  progress();


  /* ---- 7 · Solo móvil y pantallas estrechas (≤ 800 px): la página «respira» al bajar ---- */
  if (matchMedia('(max-width:800px)').matches) {
    root.classList.add('mo-m');
    const up = '.bridge-copy,.bridge-lead,.perfil-lead,.perfil-texto>p,.perfil-cita,.first-visit-heading>p,.first-visit-notes-head,.services-closing-copy>p,.direct-booking-heading>p,.direct-booking-first,.direct-booking-summary,.direct-booking-form,.services-intro>p:last-child';
    const groups = '.bridge-facts,.first-visit-steps,.first-visit-note-list,.direct-booking-assurance,.perfil-ficha';
    const imgs = '.sensory-image,.perfil .specimen-window,.first-visit .specimen-window';
    const mio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add('m-in'); mio.unobserve(e.target); }
    }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll(up).forEach(el => { el.classList.add('m-up'); mio.observe(el); });
    document.querySelectorAll(groups).forEach(g => [...g.children].forEach((el, i) => {
      el.classList.add('m-up'); el.style.setProperty('--md', Math.min(i, 6) * 90 + 'ms'); mio.observe(el);
    }));
    document.querySelectorAll(imgs).forEach(el => { el.classList.add('m-img'); mio.observe(el); });
    setTimeout(() => document.querySelectorAll('.m-up:not(.m-in),.m-img:not(.m-in)').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add('m-in');
    }), 4500);

    /* la frase grande sobre la foto se ilumina palabra a palabra con el scroll */
    const quote = document.querySelector('.sensory blockquote');
    if (quote) {
      const words = [];
      const wrap = node => [...node.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) frag.append(document.createTextNode(p));
            else { const s = document.createElement('span'); s.className = 'qw'; s.textContent = p; words.push(s); frag.append(s); }
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1) wrap(c);
      });
      wrap(quote);
      let qt = false;
      const scrub = () => {
        qt = false;
        const r = quote.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (innerHeight * .88 - r.top) / (innerHeight * .5 + r.height * .35)));
        const n = words.length;
        words.forEach((w, i) => w.style.opacity = (.2 + .8 * Math.max(0, Math.min(1, (p * (n + 3) - i) / 3))).toFixed(3));
      };
      addEventListener('scroll', () => { if (!qt) { qt = true; requestAnimationFrame(scrub); } }, { passive: true });
      addEventListener('resize', scrub, { passive: true });
      scrub();
    }
  }

  if (!fine) return;

  /* ---- 6 · Scroll con inercia (Lenis, assets/vendor/lenis.min.js) ---- */
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: .1, smoothWheel: true, anchors: { offset: -(parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 0) } });
    window.lenisShiatsu = lenis;
    const tick = t => { lenis.raf(t); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    /* zonas con su propio scroll o gesto: Lenis no las toca */
    const protect = () => document.querySelectorAll('.atlas-viewport,.option-detail-scroll,.option-detail,textarea,select').forEach(el => el.setAttribute('data-lenis-prevent', ''));
    protect();
    /* con un panel de sesión abierto, la página de detrás no se mueve */
    new MutationObserver(() => {
      protect();
      if (document.body.classList.contains('detail-open')) lenis.stop(); else lenis.start();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'], childList: true });
  }

  /* ---- 4 · Tarjetas: inclinación y brillo ---- */
  const bindCards = () => document.querySelectorAll('.option-card:not([data-tilt])').forEach(card => {
    card.dataset.tilt = '1';
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--tilt-y', ((x - .5) * 7).toFixed(2) + 'deg');
      card.style.setProperty('--tilt-x', ((.5 - y) * 5).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--tilt-x', '0deg'); card.style.setProperty('--tilt-y', '0deg');
    });
  });
  bindCards();

  /* ---- 5 · Cursor ---- */
  const ring = document.createElement('div');
  ring.className = 'mo-cursor'; ring.setAttribute('aria-hidden', 'true');
  document.body.append(ring);
  let tx = 0, ty = 0, cx = 0, cy = 0, run = false, seen = false;
  const hot = 'a,button,[role="button"],select,label,summary,.option-card';
  const loop = () => {
    cx += (tx - cx) * .2; cy += (ty - cy) * .2;
    ring.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
    if (Math.abs(tx - cx) > .1 || Math.abs(ty - cy) > .1) requestAnimationFrame(loop); else run = false;
  };
  addEventListener('pointermove', e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY;
    if (!seen) { seen = true; cx = tx; cy = ty; }
    const el = e.target instanceof Element ? e.target : null;
    const own = el?.closest('.atlas-viewport,input,textarea,.option-detail');
    ring.classList.toggle('is-on', !own);
    ring.classList.toggle('is-hot', !!el?.closest(hot));
    if (!run) { run = true; requestAnimationFrame(loop); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => ring.classList.remove('is-on'));
})();
