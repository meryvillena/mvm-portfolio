const revealItems = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: .18 });
revealItems.forEach(item => observer.observe(item));

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!window.ScrollTrigger) {
const parallaxItems = document.querySelectorAll('[data-parallax]');
let ticking = false;
function updateParallax() {
  if (reducedMotion.matches) {
    parallaxItems.forEach(item => {
      const target = item.querySelector('[data-parallax-target]') || item.querySelector('img');
      if (target) target.style.removeProperty('transform');
    });
    ticking = false;
    return;
  }
  const center = innerHeight / 2;
  parallaxItems.forEach(item => {
    const rect = item.getBoundingClientRect();
    const speed = Number(item.dataset.parallax || 0);
    const offset = (rect.top + rect.height / 2 - center) * speed;
    const target = item.querySelector('[data-parallax-target]') || item.querySelector('img');
    if (target) target.style.transform = `scale(1.08) translateY(${offset}px)`;
  });
  ticking = false;
}
reducedMotion.addEventListener?.('change', updateParallax);
addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
}, { passive: true });
updateParallax();

const specimenItems = document.querySelectorAll('[data-specimen-parallax]');
let specimenTicking = false;
function updateSpecimenParallax() {
  if (reducedMotion.matches) {
    specimenItems.forEach(item => item.style.removeProperty('--specimen-scroll'));
    specimenTicking = false;
    return;
  }
  const viewportCenter = innerHeight / 2;
  specimenItems.forEach(item => {
    const rect = item.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > innerHeight + 120) return;
    const speed = Number(item.dataset.specimenParallax || 0);
    /* The whole specimen moves at a different depth from the page. The
       multiplier makes the movement legible on large editorial canvases. */
    const rawOffset = (rect.top + rect.height / 2 - viewportCenter) * speed * 2.35;
    const offset = Math.max(-56, Math.min(56, rawOffset));
    item.style.setProperty('--specimen-scroll', `${offset.toFixed(2)}px`);
  });
  specimenTicking = false;
}
reducedMotion.addEventListener?.('change', updateSpecimenParallax);
addEventListener('scroll', () => {
  if (!specimenTicking) {
    requestAnimationFrame(updateSpecimenParallax);
    specimenTicking = true;
  }
}, { passive: true });
addEventListener('resize', updateSpecimenParallax, { passive: true });
updateSpecimenParallax();
}

/* OJO: esto va FUERA del if(!window.ScrollTrigger) de arriba. Metido dentro,
   no se ejecuta nunca, porque ScrollTrigger sí está cargado y ese bloque es
   sólo el motor de repuesto. Me pasó el 21-08-2026. */
/* La foto se amplía dentro de su marco según sube por la pantalla: de 1 a 1.08.
   El marco no se mueve — sólo la imagen, recortada por el overflow de la
   ventana. Se expone en window para poder medirlo con el rAF congelado.
   21-08-2026 */
const specimenWindows = document.querySelectorAll('.specimen-window');
let zoomTicking = false;
function actualizarZoomFotos() {
  zoomTicking = false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    specimenWindows.forEach(w => w.style.removeProperty('--foto-zoom'));
    return;
  }
  specimenWindows.forEach(win => {
    const r = win.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    /* 0 cuando la ventana entra por abajo, 1 cuando sale por arriba */
    const avance = 1 - (r.top + r.height / 2) / (innerHeight + r.height);
    const paso = Math.max(0, Math.min(1, avance));
    win.style.setProperty('--foto-zoom', (1 + paso * 0.08).toFixed(4));
  });
}
window.actualizarZoomFotos = actualizarZoomFotos;
addEventListener('scroll', () => {
  if (!zoomTicking) { zoomTicking = true; requestAnimationFrame(actualizarZoomFotos); }
}, { passive: true });
addEventListener('resize', actualizarZoomFotos, { passive: true });
actualizarZoomFotos();

function bindMagneticButtons(root = document) {
  if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  root.querySelectorAll('.magnetic:not([data-magnetic-ready])').forEach(button => {
    button.dataset.magneticReady = 'true';
    button.addEventListener('pointermove', event => {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      const radius = Math.max(150, rect.width * .62);
      const pull = distance < radius ? Math.pow(1 - distance / radius, 2) : 0;
      button.style.setProperty('--mag-x', `${(dx * pull * .28).toFixed(2)}px`);
      button.style.setProperty('--mag-y', `${(dy * pull * .28).toFixed(2)}px`);
    }, { passive: true });
    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--mag-x', '0px');
      button.style.setProperty('--mag-y', '0px');
    });
  });
}
bindMagneticButtons();

const menuButton = document.querySelector('.menu');
const navLinks = document.querySelector('#nav-links');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('open', !open);
  if (!open) document.querySelector('.nav')?.classList.remove('nav-hidden');
});

const siteNav = document.querySelector('.nav');
const heroSection = document.querySelector('.hero');
let previousNavY = Math.max(0, scrollY);
let navTravel = 0;
let navDirection = 0;
let navTicking = false;
function updateNavVisibility() {
  if (!siteNav || !heroSection) {
    navTicking = false;
    return;
  }
  const currentY = Math.max(0, scrollY);
  const heroLimit = heroSection.offsetTop + heroSection.offsetHeight - siteNav.offsetHeight;
  const insideHero = currentY <= heroLimit;
  const menuOpen = menuButton.getAttribute('aria-expanded') === 'true';
  const delta = currentY - previousNavY;
  const direction = Math.sign(delta);

  siteNav.classList.toggle('nav-scrolled', !insideHero);

  if (insideHero || menuOpen || currentY < 24) {
    siteNav.classList.remove('nav-hidden');
    navTravel = 0;
  } else if (direction) {
    if (direction !== navDirection) navTravel = 0;
    navTravel += delta;
    if (navTravel > 14) siteNav.classList.add('nav-hidden');
    if (navTravel < -8) siteNav.classList.remove('nav-hidden');
  }

  if (direction) navDirection = direction;
  previousNavY = currentY;
  navTicking = false;
}
addEventListener('scroll', () => {
  if (!navTicking) {
    requestAnimationFrame(updateNavVisibility);
    navTicking = true;
  }
}, { passive: true });
addEventListener('resize', updateNavVisibility, { passive: true });
siteNav?.addEventListener('focusin', () => siteNav.classList.remove('nav-hidden'));
navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  navLinks.classList.remove('open');
}));
updateNavVisibility();

/* ---------------------------------------------------------------------------
   Tooltips de términos ("Ki", "tsubo"…)
   Cada botón .term abre la .term-definition que nombra en aria-describedby.
   El Ki lo abren dos sitios —la sección Shiatsu y las tarjetas expandidas, que
   viven en un overlay con z-index 900— y ambos comparten definición. Por eso el tooltip
   cuelga de <body> (si no, queda atrapado detrás del overlay) y se muestra con
   la clase .visible en vez del selector de hermano adyacente del CSS, que
   exigía tener el <span> pegado al botón y sólo funcionaba en la sección.

   Regla de interacción: se abre y SE QUEDA. Antes se cerraba al apartar el
   ratón, y como el tooltip cae debajo del botón, al ir a leerlo salías del
   botón y se cerraba solo. Ahora sólo cierra al clicar fuera, con Escape o al
   abrir otro término.
   --------------------------------------------------------------------------- */
const termButtons = document.querySelectorAll('.term');
const termDefinitions = document.querySelectorAll('.term-definition');
let termAbierto = null;

/* Cada definición cuelga de <body>. Si se queda dentro de su sección, el overlay
   de la tarjeta (z-index 900) la tapa. */
termDefinitions.forEach(def => document.body.appendChild(def));

/* Cada botón dice cuál es la suya con aria-describedby. Varios botones pueden
   apuntar a la misma: los dos Ki comparten definición. */
function definicionDe(btn) {
  return document.getElementById(btn.getAttribute('aria-describedby'));
}

function colocarTerm(btn) {
  const def = definicionDe(btn);
  if (!def || innerWidth <= 800) return;
  const rect = btn.getBoundingClientRect();
  /* Se mide el tooltip en vez de dar por hecho su tamaño: antes iban 326 y 170
     a fuego, que era el ancho y el alto del de "Ki". Con un segundo término de
     texto distinto, aquello lo habría descolocado. */
  const ancho = def.offsetWidth  || 310;
  const alto  = def.offsetHeight || 156;
  const left = Math.min(innerWidth - ancho - 16, Math.max(16, rect.left - 18));
  const top  = Math.min(innerHeight - alto - 14, rect.bottom + 14);
  def.style.setProperty('--term-left', `${left}px`);
  def.style.setProperty('--term-top', `${top}px`);
}
function abrirTerm(btn) {
  const def = definicionDe(btn);
  if (!def) return;
  termAbierto = btn;
  termButtons.forEach(b => b.setAttribute('aria-expanded', String(b === btn)));
  colocarTerm(btn);
  termDefinitions.forEach(d => d.classList.toggle('visible', d === def));
}
function cerrarTerm() {
  termAbierto = null;
  termButtons.forEach(b => b.setAttribute('aria-expanded', 'false'));
  termDefinitions.forEach(d => d.classList.remove('visible'));
}

/* Mientras el ratón esté en la palabra, el tooltip se queda. En cuanto sale, se
   cierra. No hace falta poder pasar el ratón por el tooltip: sale debajo y se
   lee sin moverse de la palabra.
   Los 90ms no son para dar tiempo a nada, son para absorber el temblor de la
   mano en el borde del botón y que no parpadee.
   Sólo con ratón: en táctil no hay hover, y ahí cierra al tocar fuera. */
const TERM_ANTIRREBOTE = 90;
let termCierre = null;
function cancelarCierreTerm() { clearTimeout(termCierre); termCierre = null; }
function programarCierreTerm(event) {
  if (event && event.pointerType && event.pointerType !== 'mouse') return;
  cancelarCierreTerm();
  termCierre = setTimeout(() => {
    /* Si se abrió con el teclado manda el foco, no el ratón. */
    if (termAbierto && termAbierto.matches(':focus-visible')) return;
    cerrarTerm();
  }, TERM_ANTIRREBOTE);
}

termButtons.forEach(btn => {
  btn.addEventListener('pointerenter', () => { cancelarCierreTerm(); abrirTerm(btn); });
  btn.addEventListener('pointerleave', programarCierreTerm);
  btn.addEventListener('focus', () => { cancelarCierreTerm(); abrirTerm(btn); });
  btn.addEventListener('blur', () => programarCierreTerm());
  /* El click SIEMPRE abre, nunca alterna. Esto es lo que arregló el parpadeo:
     el hover ya lo había abierto y un toggle lo cerraba en el mismo gesto. */
  btn.addEventListener('click', event => {
    event.stopPropagation();
    cancelarCierreTerm();
    abrirTerm(btn);
  });
});

document.addEventListener('click', event => {
  if (!termAbierto) return;
  if ([...termButtons].some(b => b.contains(event.target))) return;
  if ([...termDefinitions].some(d => d.contains(event.target))) return;
  cerrarTerm();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') cerrarTerm();
});

/* Al hacer scroll el botón se mueve y el tooltip es position:fixed, así que lo
   recolocamos. No lo cerramos aunque el botón salga de pantalla: colocarTerm
   acota la posición al viewport, y cerrarlo ahí era justo lo que hacía que
   desapareciera solo (el Ki de la tarjeta cae en la parte baja del panel).
   El panel de la tarjeta scrollea por su cuenta y no dispara el scroll de la
   ventana, así que lo escuchamos aparte. */
function recolocarTermAlScroll() {
  if (!termAbierto) return;
  colocarTerm(termAbierto);
}
addEventListener('scroll', recolocarTermAlScroll, { passive: true });
document.querySelectorAll('.option-detail-scroll').forEach(panel => {
  panel.addEventListener('scroll', recolocarTermAlScroll, { passive: true });
});

const guideData = {
  /* Reescritas el 21-08-2026. El orientador ya no recomienda sesiones ni dice
     precios: explica cómo se lee un cuerpo. Las sesiones, duraciones y precios
     viven sólo en el carrusel. `service` ya no es el nombre de una sesión, es
     la zona que se trabaja; `details`, las condiciones prácticas. */
  tension: {
    count: '01 / 04', caption: 'Lectura · Cuerpo', kicker: 'Cuando una zona pide espacio',
    title: 'Equilibrio para el cuerpo.',
    lead: 'Cuello con sensación de rigidez, hombros elevados desde primera hora, una espalda que pierde comodidad al final del día. La sesión atiende esa tensión para favorecer un movimiento más libre y equilibrado.',
    body: 'La presión se aplica de forma estable y precisa, combinada con movilizaciones y estiramientos suaves. El objetivo es acompañar al cuerpo hacia una mayor amplitud de movimiento y una sensación renovada de bienestar.',
    service: 'Cuello, hombros, espalda y caderas', details: 'Con ropa cómoda · Sin agujas',
    benefits: ['Presión manual consciente','Movilidad más fluida','Atención adaptada a cada cuerpo']
  },
  equilibrio: {
    count: '02 / 04', caption: 'Lectura · Ritmo', kicker: 'Cuando el cuerpo no consigue bajar',
    title: 'Restablece tu ritmo.',
    lead: 'Cuando el descanso no resulta reparador, la mandíbula permanece activa y la mente no desconecta, el cuerpo pide un cambio de ritmo. Esta sesión está pensada para favorecer calma, presencia y descanso profundo.',
    body: 'La práctica se vuelve entonces más lenta y envolvente: espalda, abdomen, respiración y estiramientos encadenados. Un recorrido amplio para regular el ritmo interno y recuperar una sensación de equilibrio.',
    service: 'Abdomen, respiración y espalda', details: 'Recorrido amplio · Ritmo lento',
    /* La `note` de los 90 minutos se eliminó: hablaba de duración, y la
       duración vive ahora sólo en la tarjeta 02 del carrusel. */
    benefits: ['Escucha integral del cuerpo','Un ritmo que favorece la calma','Un cierre para integrar la experiencia']
  },
  rostro: {
    count: '03 / 04', caption: 'Lectura · Rostro', kicker: 'Rostro, cuello y expresión',
    title: 'Bienestar que se refleja en el rostro.',
    lead: 'La expresión de cansancio suele estar vinculada a la tensión de mandíbula, cuello y hombros. Al atender esta relación, el rostro recupera serenidad y una apariencia más descansada.',
    body: 'El facial japonés trabaja rostro, mandíbula, sienes y cuello mediante maniobras manuales rítmicas y precisas. Una práctica que devuelve armonía a la expresión y bienestar al conjunto del rostro.',
    service: 'Rostro, mandíbula, sienes y cuello', details: 'Solo manos · Sin marcas',
    benefits: ['Equilibrio en mandíbula y sienes','El cuello acompaña al rostro','Respeto por la expresión natural']
  },
  metodo: {
    count: '04 / 04', caption: 'Lectura · Método', kicker: 'Antes de empezar',
    title: 'Cada sesión parte de ti.',
    lead: 'La práctica Shiatsu no responde a una secuencia fija. Cada sesión comienza con una escucha atenta para decidir el recorrido, la presión y el ritmo que mejor acompañan cómo estás ese día.',
    qa: [
      ['¿Y si no sé explicarlo?','No necesitas llegar con un diagnóstico ni saber nombrar la técnica. Basta con contar cómo estás y qué notas. La sesión se va construyendo desde ahí.'],
      ['¿Siempre se hace lo mismo?','No. Dos personas con una misma molestia pueden necesitar sesiones distintas. Se adapta el recorrido, la presión y el tiempo a cada cuerpo y a cada día.'],
      ['¿Con una sesión basta?','Una primera sesión permite experimentar el enfoque Shiatsu: un cuerpo más disponible, una mente más serena y una sensación renovada de bienestar. La continuidad se valora después, desde esa experiencia.']
    ],
    /* La bisagra hacia el carrusel: es la única ficha que lo presenta. */
    cierre: 'Una práctica que se adapta a tu momento.'
  }
};

const guideSelection = document.querySelector('[data-guide-selection]');
const guideResult = document.querySelector('[data-guide-result]');
const guideCaption = document.querySelector('[data-guide-caption]');
const archiveStage = document.querySelector('[data-archive-stage]');
const archiveStatus = document.querySelector('[data-archive-status]');
const archiveTabs = document.querySelector('.archive-tabs');
const archiveSheet = document.querySelector('.archive-sheet');
const archiveOrder = ['tension', 'equilibrio', 'rostro', 'metodo'];
const guideVisual = document.querySelector('[data-guide-visual]');
const guideVisuals = {
  default: {
    src: 'assets/mapa-facial.jpeg',
    alt: 'Diagrama japonés histórico del rostro',
    caption: 'Archivo facial · Fig. 02'
  },
  tension: {
    src: 'assets/orientador-cuerpo.jpeg',
    alt: 'Silueta corporal con el recorrido de los meridianos',
    caption: 'Lectura · Cuerpo'
  },
  equilibrio: {
    src: 'assets/orientador-ritmo.jpeg',
    alt: 'Ramas y sombras proyectadas sobre una pared de mortero',
    caption: 'Lectura · Ritmo'
  },
  rostro: {
    src: 'assets/mapa-facial.jpeg',
    alt: 'Diagrama japonés histórico del rostro',
    caption: 'Lectura · Rostro'
  },
  metodo: {
    src: 'assets/orientador-metodo.jpeg',
    alt: 'Lámina histórica del cuerpo con puntos y recorridos',
    caption: 'Lectura · Método'
  }
};
let activeGuideKey = null;
let activeGuideTrigger = null;
let archiveTimeline = null;
let guideVisualTimeline = null;
let activeVisualKey = 'default';

function resetArchiveMotion() {
  archiveTimeline?.kill();
  archiveTimeline = null;
  archiveSheet?.querySelectorAll('.archive-outgoing-view').forEach(view => view.remove());
  archiveStage?.classList.remove('is-animating');
  if (window.gsap && archiveSheet) {
    gsap.set(archiveSheet, { clearProps: 'height,minHeight,overflow,paddingTop,paddingBottom,borderTopWidth,borderBottomWidth,opacity,transform' });
    gsap.set(archiveTabs.querySelectorAll('[data-guide-choice]'), { clearProps: 'transform' });
  }
}

function transitionGuideVisual(nextKey) {
  if (!guideVisual) return;
  const visualData = guideVisuals[nextKey] || guideVisuals.default;
  const currentImage = guideVisual.querySelector('[data-guide-image]');
  if (!currentImage || (activeVisualKey === nextKey && currentImage.getAttribute('src') === visualData.src)) {
    if (guideCaption) guideCaption.textContent = visualData.caption;
    return;
  }

  guideVisualTimeline?.kill();
  guideVisual.querySelectorAll('img:not([data-guide-image])').forEach(image => image.remove());
  if (window.gsap) gsap.set(currentImage, { clearProps: 'transform,opacity,filter,zIndex' });

  const previousIndex = activeVisualKey === 'default' ? 2 : archiveOrder.indexOf(activeVisualKey);
  const nextIndex = nextKey === 'default' ? 2 : archiveOrder.indexOf(nextKey);
  const direction = nextIndex >= previousIndex ? 1 : -1;
  const nextImage = document.createElement('img');
  nextImage.src = visualData.src;
  nextImage.alt = visualData.alt;
  nextImage.dataset.guideImage = '';
  nextImage.dataset.visualKey = nextKey;
  nextImage.style.zIndex = '2';
  currentImage.removeAttribute('data-guide-image');
  currentImage.style.zIndex = '1';
  guideVisual.append(nextImage);
  guideVisual.dataset.visualKey = nextKey;
  activeVisualKey = nextKey;
  if (guideCaption) guideCaption.textContent = visualData.caption;

  const finish = () => {
    if (!nextImage.isConnected) return;
    currentImage.remove();
    nextImage.style.removeProperty('z-index');
    if (window.gsap) gsap.set(nextImage, { clearProps: 'transform,opacity,filter,zIndex,clipPath' });
    guideVisualTimeline = null;
  };
  if (!window.gsap || matchMedia('(prefers-reduced-motion:reduce)').matches) {
    finish();
    return;
  }

  const startVisualTransition = () => {
    if (!nextImage.isConnected || activeVisualKey !== nextKey) return;
    gsap.set(nextImage, {
      clipPath: direction > 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)',
      yPercent: direction * 2,
      scale: 1.018,
      opacity: 1,
      filter: 'saturate(.28) sepia(.14)'
    });
    guideVisualTimeline = gsap.timeline({ onComplete: finish });
    guideVisualTimeline
      .to(currentImage, {
        scale: .985,
        opacity: .35,
        duration: .58,
        ease: 'power2.inOut'
      }, 0)
      .to(nextImage, {
        clipPath: 'inset(0% 0 0 0)',
        yPercent: 0,
        scale: 1,
        filter: 'saturate(.35) sepia(.12)',
        duration: .78,
        ease: 'power3.inOut'
      }, 0);
    if (guideCaption) gsap.fromTo(guideCaption, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: .34, delay: .3, ease: 'power2.out' });
  };
  if (nextImage.complete) startVisualTransition();
  else nextImage.decode().catch(() => {}).then(startVisualTransition);
}

/* Orientador como un archivador (25-oct-2026).
   Al pulsar una pestaña: la ficha que estaba abierta se pliega, la hoja pasa a colocarse justo
   debajo de la pestaña pulsada y se despliega; las pestañas que quedan por debajo bajan y las
   de arriba no se mueven. Es una animación de alto real (no de transformaciones), así que las
   pestañas nunca se cruzan ni cambian de color por el camino. */
const ARCHIVE_SHEET_PROPS = 'height,minHeight,overflow,paddingTop,paddingBottom,borderTopWidth,borderBottomWidth,opacity,transform';
function beginArchiveTransition(nextKey, updateContent) {
  if (!archiveStage || !archiveTabs || !archiveSheet) return;
  resetArchiveMotion();
  const folderItems = [...archiveTabs.querySelectorAll('[data-guide-choice]')];
  const targetFolder = archiveOrder.includes(nextKey)
    ? archiveTabs.querySelector(`[data-guide-choice="${nextKey}"]`)
    : null;
  const place = () => { if (targetFolder) targetFolder.after(archiveSheet); else archiveTabs.append(archiveSheet); };

  if (!window.gsap || matchMedia('(prefers-reduced-motion:reduce)').matches) {
    updateContent?.();
    place();
    return;
  }

  archiveStage.classList.add('is-animating');
  folderItems.forEach(button => button.setAttribute('aria-pressed', 'false'));   /* todas cerradas mientras se pliega */

  /* la pestaña pulsada se queda donde está aunque la ficha de arriba se pliegue */
  const anchorTop = targetFolder ? targetFolder.getBoundingClientRect().top : null;
  const keepTarget = () => {
    if (anchorTop === null) return;
    const drift = targetFolder.getBoundingClientRect().top - anchorTop;
    if (Math.abs(drift) <= .5) return;
    const lenis = window.lenisShiatsu;   /* con scroll con inercia, el salto se le da a Lenis para que no lo pelee */
    if (lenis) lenis.scrollTo(window.scrollY + drift, { immediate: true, force: true });
    else window.scrollBy(0, drift);
  };
  const finish = () => {
    gsap.set(archiveSheet, { clearProps: ARCHIVE_SHEET_PROPS });
    archiveSheet.querySelectorAll('.guide-view > *').forEach(el => gsap.set(el, { clearProps: 'transform,opacity' }));
    archiveStage.classList.remove('is-animating');
    archiveTimeline = null;
  };

  gsap.set(archiveSheet, { overflow: 'hidden', minHeight: 0, height: archiveSheet.offsetHeight });
  archiveTimeline = gsap.timeline({ defaults: { overwrite: 'auto' } });
  archiveTimeline.to(archiveSheet, {
    height: 0, paddingTop: 0, paddingBottom: 0, borderTopWidth: 0, borderBottomWidth: 0, opacity: 0,
    duration: .38, ease: 'power3.inOut', onUpdate: keepTarget
  });
  archiveTimeline.add(() => {
    /* la hoja está plegada del todo: se cambia de sitio y de contenido sin que se vea */
    place();
    updateContent?.();
    gsap.set(archiveSheet, { clearProps: 'height,minHeight,paddingTop,paddingBottom,borderTopWidth,borderBottomWidth,opacity' });
    const cs = getComputedStyle(archiveSheet);
    const full = {
      height: archiveSheet.offsetHeight,
      paddingTop: parseFloat(cs.paddingTop), paddingBottom: parseFloat(cs.paddingBottom),
      borderTopWidth: parseFloat(cs.borderTopWidth), borderBottomWidth: parseFloat(cs.borderBottomWidth)
    };
    gsap.set(archiveSheet, { overflow: 'hidden', minHeight: 0, height: 0, paddingTop: 0, paddingBottom: 0, borderTopWidth: 0, borderBottomWidth: 0, opacity: 1 });
    const incoming = [...archiveSheet.querySelectorAll('.guide-view:not([hidden]) > *')];
    archiveTimeline = gsap.timeline({ onComplete: finish });
    archiveTimeline.to(archiveSheet, { ...full, duration: .62, ease: 'power3.out' }, 0);
    if (incoming.length) archiveTimeline.fromTo(incoming, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .4, stagger: .02, ease: 'power2.out' }, .22);
  });
}

function showGuideView(view) {
  [guideSelection, guideResult].forEach(item => { if (item) item.hidden = item !== view; });
}

function renderGuideResult(key) {
  const data = guideData[key];
  if (!data || !guideResult) return;
  activeGuideKey = key;
  const content = data.qa
    ? `<ul class="guide-qa">${data.qa.map(item => `<li><strong>${item[0]}</strong><p>${item[1]}</p></li>`).join('')}</ul>`
    : `<p class="guide-result-body">${data.body}</p><div class="guide-recommendation"><small>Se trabaja</small><strong>${data.service}</strong><span>${data.details}</span></div>${data.note ? `<p class="guide-note">${data.note}</p>` : ''}<ol class="guide-benefits">${data.benefits.map((benefit,index) => `<li><span>0${index + 1}</span>${benefit}</li>`).join('')}</ol>`;
  beginArchiveTransition(key, () => {
    document.querySelectorAll('[data-guide-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.guideChoice === key)));
    if (archiveStatus) archiveStatus.textContent = `Ficha ${data.count.slice(0,2)} · Abierta`;
    archiveSheet.dataset.ficha = key;
    guideResult.innerHTML = `<div class="guide-topline"><span>Ficha ${data.count.slice(0,2)} · Lectura</span><span>${data.count}</span></div><p class="kicker">${data.kicker}</p><h2>${data.title}</h2><p class="guide-result-lead">${data.lead}</p>${content}${data.cierre ? `<p class="guide-cierre">${data.cierre}</p>` : ''}<div class="guide-actions"><a class="btn btn--fill magnetic guide-primary" href="#sesiones"><span>Ver las sesiones</span><b><i class="ico ico--ne" aria-hidden="true"></i></b></a><button class="btn btn--ghost magnetic guide-back" type="button" data-guide-back><span>Cerrar ficha</span><b>×</b></button></div>`;
    bindMagneticButtons(guideResult);
    showGuideView(guideResult);
    guideResult.querySelector('h2')?.focus({ preventScroll: true });
  });
  transitionGuideVisual(key);
}

function closeGuide() {
  activeGuideTrigger?.focus({ preventScroll: true });
  beginArchiveTransition(null, () => {
    if (archiveStatus) archiveStatus.textContent = 'Archivo · 04 fichas';
    document.querySelectorAll('[data-guide-choice]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    showGuideView(guideSelection);
    delete archiveSheet.dataset.ficha;
  });
  transitionGuideVisual('default');
}

document.querySelectorAll('[data-guide-choice]').forEach(button => button.addEventListener('click', () => {
  if (button.getAttribute('aria-pressed') === 'true') { closeGuide(); return; }
  activeGuideTrigger = button;
  renderGuideResult(button.dataset.guideChoice);
}));

guideResult?.addEventListener('click', event => {
  if (event.target.closest('[data-guide-back]')) closeGuide();
});

const directBookingName = document.querySelector('[data-direct-booking-name]');
const directBookingPrice = document.querySelector('[data-direct-booking-price]');
const directBookingSelect = document.querySelector('[data-direct-booking-select]');
const directBookingOptions = {
  'corporal-60': { key: 'corporal-60', name: 'Shiatsu corporal · 60\u00a0min', price: '55 € · Madrid', type: 'corporal', duration: '60' },
  'corporal-90': { key: 'corporal-90', name: 'Shiatsu corporal · 90\u00a0min', price: '75 € · Madrid', type: 'corporal', duration: '90' },
  facial: { key: 'facial', name: 'Facial japonés · 50\u00a0min', price: '50 € · Madrid', type: 'facial' }
};
let activeDirectBooking = directBookingOptions['corporal-60'];

function updateDirectBooking(selection) {
  activeDirectBooking = selection;
  if (directBookingName) directBookingName.textContent = selection.name;
  if (directBookingPrice) directBookingPrice.textContent = selection.price;
  if (directBookingSelect && directBookingSelect.value !== selection.key) directBookingSelect.value = selection.key;
}

document.querySelectorAll('[data-service-book]').forEach(link => link.addEventListener('click', () => {
  const requested = link.dataset.serviceBook;
  if (requested === 'facial') {
    updateDirectBooking(directBookingOptions.facial);
    return;
  }
  if (requested === 'corporal') {
    /* Antes preguntaba al selector de duración del capítulo 06. Ese capítulo se
       apagó el 18-08 y se borró el 22-08, así que ahora cae en la de 60 min,
       que es la corporal por defecto. */
    updateDirectBooking(directBookingOptions['corporal-60']);
  }
}));

directBookingSelect?.addEventListener('change', () => {
  const selection = directBookingOptions[directBookingSelect.value];
  if (!selection) return;
  updateDirectBooking(selection);
  if (selection.type !== 'corporal') return;
});

const directBookingForm = document.querySelector('[data-direct-booking-form]');
const directBookingConfirmation = document.querySelector('[data-direct-booking-confirmation]');
const directBookingWhatsApp = document.querySelector('[data-whatsapp-link]');
const confirmationPreference = document.querySelector('[data-confirmation-preference]');
const confirmationPreferenceRow = document.querySelector('[data-confirmation-preference-row]');
const confirmationContact = document.querySelector('[data-confirmation-contact]');
const whatsappNumber = String(document.body.dataset.whatsappNumber || '').replace(/\D/g, '');
directBookingForm?.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(directBookingForm);
  const name = String(formData.get('name') || '').trim();
  const contact = String(formData.get('contact') || '').trim();
  const preference = String(formData.get('preference') || '').trim();
  const messageLines = [
    `Hola, Eme. Soy ${name}.`,
    `Me gustaría pedir cita para ${activeDirectBooking.name} (${activeDirectBooking.price}).`,
  ];
  if (preference) messageLines.push(`Mi preferencia es: ${preference}.`);
  messageLines.push(`Puedes responderme en: ${contact}.`);
  const message = messageLines.join('\n');
  if (confirmationPreference) confirmationPreference.textContent = preference;
  if (confirmationPreferenceRow) confirmationPreferenceRow.hidden = !preference;
  if (confirmationContact) confirmationContact.textContent = contact;
  if (directBookingWhatsApp && whatsappNumber) {
    directBookingWhatsApp.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    directBookingWhatsApp.target = '_blank';
    directBookingWhatsApp.removeAttribute('aria-disabled');
  } else if (directBookingWhatsApp) {
    directBookingWhatsApp.href = '#cita';
    directBookingWhatsApp.removeAttribute('target');
    directBookingWhatsApp.setAttribute('aria-disabled', 'true');
  }
  directBookingForm.hidden = true;
  if (directBookingConfirmation) directBookingConfirmation.hidden = false;
  directBookingConfirmation?.querySelector('a')?.focus({ preventScroll: true });
});
document.querySelector('[data-direct-booking-reset]')?.addEventListener('click', () => {
  directBookingForm?.reset();
  if (directBookingSelect) directBookingSelect.value = activeDirectBooking.key;
  if (directBookingForm) directBookingForm.hidden = false;
  if (directBookingConfirmation) directBookingConfirmation.hidden = true;
  directBookingForm?.querySelector('input')?.focus({ preventScroll: true });
});
directBookingWhatsApp?.addEventListener('click', event => {
  if (directBookingWhatsApp.getAttribute('aria-disabled') === 'true') event.preventDefault();
});

/* El tooltip de .service-term se borró el 22-08-2026 con su sección. */

/* Fallback scroll narrative for environments where ScrollTrigger is unavailable. */
if (!window.ScrollTrigger) {
const scrollSceneElements = {
  hero: document.querySelector('.hero'),
  heroTitle: document.querySelector('.hero-title'),
  heroIntro: document.querySelector('.hero-intro'),
  heroArt: document.querySelector('.hero-art'),
  heroNote: document.querySelector('.hero-note'),
  scrollMark: document.querySelector('.scroll-mark'),
  bridge: document.querySelector('.bridge'),
  bridgeHeading: document.querySelector('.bridge-heading'),
  bridgeCopy: document.querySelector('.bridge-copy'),
  pressureStage: document.querySelector('.pressure-stage'),
  sensory: document.querySelector('.sensory'),
  guide: document.querySelector('.guide'),
  guideArt: document.querySelector('.guide-art'),
  guidePanel: document.querySelector('.guide-panel'),
  servicesIntro: document.querySelector('.services-intro'),
  servicesIntroItems: [...document.querySelectorAll('.services-intro>.kicker,.services-intro>h2,.services-intro>p:last-child')],
  firstVisit: document.querySelector('.first-visit'),
  firstHeading: document.querySelector('.first-visit-heading'),
  firstArchive: document.querySelector('.first-visit-archive'),
  servicesClosing: document.querySelector('.services-closing'),
};

const scrollChapterSections = [
  ['hero', scrollSceneElements.hero], ['shiatsu', scrollSceneElements.bridge],
  ['pausa', scrollSceneElements.sensory], ['orientador', scrollSceneElements.guide],
  ['sesiones', scrollSceneElements.servicesIntro],   ['primera-sesion', scrollSceneElements.firstVisit],
  ['cierre', scrollSceneElements.servicesClosing], ['reserva', document.querySelector('.direct-booking')],
].filter(([, element]) => element);

const sceneMetrics = new Map();
const scrollSceneTarget = {
  heroExit: 0, bridgeEnter: 0, bridgePin: 0, sensoryEnter: 0, guideEnter: 0,
  servicesEnter: 0, firstEnter: 0, closingEnter: 0,
};
const scrollSceneCurrent = { ...scrollSceneTarget };
let scrollSceneFrame = 0;

const clamp01 = value => Math.max(0, Math.min(1, value));
const mix = (from, to, progress) => from + (to - from) * progress;
function layoutTop(element) {
  let top = 0;
  for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}
function refreshSceneMetrics() {
  scrollChapterSections.forEach(([, element]) => {
    sceneMetrics.set(element, { top: layoutTop(element), height: element.offsetHeight });
  });
}
function entranceProgress(element, start = .96, end = .28) {
  if (!element) return 1;
  const metric = sceneMetrics.get(element) || { top: layoutTop(element) };
  return clamp01((scrollY + innerHeight * start - metric.top) / (innerHeight * (start - end)));
}

function calculateScrollSceneTargets() {
  const motionOff = reducedMotion.matches || innerWidth <= 800;
  if (motionOff) {
    Object.keys(scrollSceneTarget).forEach(key => { scrollSceneTarget[key] = key === 'heroExit' || key === 'bridgePin' ? 0 : 1; });
    return;
  }
  const heroMetric = sceneMetrics.get(scrollSceneElements.hero);
  scrollSceneTarget.heroExit = heroMetric ? clamp01((scrollY - heroMetric.top) / Math.max(innerHeight * .68, heroMetric.height * .68)) : 0;
  scrollSceneTarget.bridgeEnter = entranceProgress(scrollSceneElements.bridge, .96, .42);
  if (scrollSceneElements.bridge) {
    const bridgeMetric = sceneMetrics.get(scrollSceneElements.bridge) || { top: layoutTop(scrollSceneElements.bridge) };
    scrollSceneTarget.bridgePin = clamp01((scrollY + 104 - bridgeMetric.top) / 180);
  }
  scrollSceneTarget.sensoryEnter = entranceProgress(scrollSceneElements.sensory, 1.02, .22);
  scrollSceneTarget.guideEnter = entranceProgress(scrollSceneElements.guide, .98, .26);
  scrollSceneTarget.servicesEnter = entranceProgress(scrollSceneElements.servicesIntro, .94, .3);
  scrollSceneTarget.firstEnter = entranceProgress(scrollSceneElements.firstVisit, .96, .3);
  scrollSceneTarget.closingEnter = entranceProgress(scrollSceneElements.servicesClosing, 1.02, .24);
}

function setMotion(element, x, y, opacity = 1, scale = 1) {
  if (!element) return;
  element.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;
  element.style.opacity = opacity.toFixed(3);
}
function renderScrollScenes() {
  const s = scrollSceneCurrent;

  if (scrollSceneElements.heroArt) {
    scrollSceneElements.heroArt.style.setProperty('--specimen-scene', `${(-24 * s.heroExit).toFixed(2)}px`);
    scrollSceneElements.heroArt.style.setProperty('--specimen-scale', mix(1, .975, s.heroExit).toFixed(4));
  }
  if (scrollSceneElements.scrollMark) scrollSceneElements.scrollMark.style.opacity = (1 - Math.min(1, s.heroExit * 2.2)).toFixed(3);

  const bridgeLift = (1 - s.bridgeEnter) * 56;
  setMotion(scrollSceneElements.bridgeHeading, 0, bridgeLift + s.bridgePin * 40, mix(.28, 1, s.bridgeEnter));
  setMotion(scrollSceneElements.bridgeCopy, 0, bridgeLift * 1.22, mix(.18, 1, s.bridgeEnter));
  setMotion(scrollSceneElements.pressureStage, 0, (1 - s.bridgeEnter) * 72, mix(.42, 1, s.bridgeEnter), mix(.965, 1, s.bridgeEnter));

  if (scrollSceneElements.sensory) {
    const hidden = (1 - s.sensoryEnter) * 24;
    const radius = (1 - s.sensoryEnter) * 34;
    scrollSceneElements.sensory.style.clipPath = `inset(${hidden.toFixed(2)}% 0 0 round ${radius.toFixed(2)}px ${radius.toFixed(2)}px 0 0)`;
    scrollSceneElements.sensory.style.transform = `translate3d(0,${((1 - s.sensoryEnter) * 90).toFixed(2)}px,0) scale(${mix(.982, 1, s.sensoryEnter).toFixed(4)})`;
  }

  setMotion(scrollSceneElements.guideArt, -(1 - s.guideEnter) * 64, 0, mix(.34, 1, s.guideEnter));
  setMotion(scrollSceneElements.guidePanel, (1 - s.guideEnter) * 64, 0, mix(.28, 1, s.guideEnter));

  scrollSceneElements.servicesIntroItems.forEach((item, index) => {
    const local = clamp01((s.servicesEnter - index * .1) / Math.max(.01, 1 - index * .1));
    setMotion(item, 0, (1 - local) * (54 + index * 12), mix(.18, 1, local));
  });

  setMotion(scrollSceneElements.firstHeading, -(1 - s.firstEnter) * 58, 0, mix(.3, 1, s.firstEnter));
  setMotion(scrollSceneElements.firstArchive, (1 - s.firstEnter) * 58, 0, mix(.3, 1, s.firstEnter));

  if (scrollSceneElements.servicesClosing) {
    const hidden = (1 - s.closingEnter) * 20;
    const radius = (1 - s.closingEnter) * 34;
    scrollSceneElements.servicesClosing.style.clipPath = `inset(${hidden.toFixed(2)}% 0 0 round ${radius.toFixed(2)}px ${radius.toFixed(2)}px 0 0)`;
    scrollSceneElements.servicesClosing.style.transform = `translate3d(0,${((1 - s.closingEnter) * 84).toFixed(2)}px,0)`;
  }
}

function updateActiveScrollChapter() {
  let active = scrollChapterSections[0]?.[0] || '';
  scrollChapterSections.forEach(([name, section]) => {
    const metric = sceneMetrics.get(section) || { top: layoutTop(section) };
    if (metric.top <= scrollY + innerHeight * .46) active = name;
  });
  if (active) document.body.dataset.scrollChapter = active;
}

function animateScrollScenes(snap = false) {
  calculateScrollSceneTargets();
  let moving = false;
  Object.keys(scrollSceneCurrent).forEach(key => {
    const difference = scrollSceneTarget[key] - scrollSceneCurrent[key];
    scrollSceneCurrent[key] = snap ? scrollSceneTarget[key] : scrollSceneCurrent[key] + difference * .105;
    if (!snap && Math.abs(difference) > .002) moving = true;
  });
  renderScrollScenes();
  updateActiveScrollChapter();
  if (moving) scrollSceneFrame = requestAnimationFrame(() => animateScrollScenes(false));
  else scrollSceneFrame = 0;
}
function queueScrollScenes() {
  calculateScrollSceneTargets();
  if (!scrollSceneFrame) scrollSceneFrame = requestAnimationFrame(() => animateScrollScenes(false));
}
function resetScrollSceneStyles() {
  const inlineMotion = [scrollSceneElements.heroTitle,scrollSceneElements.heroIntro,scrollSceneElements.heroNote,scrollSceneElements.bridgeHeading,scrollSceneElements.bridgeCopy,scrollSceneElements.pressureStage,scrollSceneElements.sensory,scrollSceneElements.guideArt,scrollSceneElements.guidePanel,...scrollSceneElements.servicesIntroItems,scrollSceneElements.firstHeading,scrollSceneElements.firstArchive,scrollSceneElements.servicesClosing];
  inlineMotion.filter(Boolean).forEach(element => { element.style.removeProperty('transform'); element.style.removeProperty('opacity'); element.style.removeProperty('clip-path'); });
}

document.body.classList.add('scroll-motion-ready');
refreshSceneMetrics();
addEventListener('scroll', queueScrollScenes, { passive: true });
addEventListener('resize', () => { resetScrollSceneStyles(); refreshSceneMetrics(); animateScrollScenes(true); }, { passive: true });
reducedMotion.addEventListener?.('change', () => { resetScrollSceneStyles(); refreshSceneMetrics(); animateScrollScenes(true); });
animateScrollScenes(true);
document.fonts?.ready.then(() => { refreshSceneMetrics(); animateScrollScenes(true); });
addEventListener('load', () => { refreshSceneMetrics(); animateScrollScenes(true); }, { once: true });
setTimeout(() => { refreshSceneMetrics(); animateScrollScenes(true); }, 320);
}

/* ==========================================================================
   05 · ELEGIR SESIÓN — carrusel en rueda
   Cuatro sesiones reservables. La del centro se ve grande, las de los lados
   asoman más pequeñas. Al elegir una, la reserva del final se pone en ella.
   Va al final del archivo, FUERA del bloque de repuesto de la línea 645.
   ========================================================================== */

/* Sesión completa = corporal de 60 min + facial de 50 min, en la misma cita.
   110 minutos. Por separado serían 55 + 50 = 105 €; juntas, 95 €.
   Para cambiar precio o duración: aquí y en el <option value="completa">. */
directBookingOptions.completa = {
  key: 'completa',
  name: 'Sesión completa · 110 min',
  price: '95 € · Madrid',
  type: 'completa'
};

const optionCards = [...document.querySelectorAll('[data-option]')];

function marcarOpcion(clave) {
  optionCards.forEach(card => card.setAttribute('aria-current', String(card.dataset.option === clave)));
}

document.querySelectorAll('[data-option-book]').forEach(enlace => {
  enlace.addEventListener('click', () => {
    const opcion = directBookingOptions[enlace.dataset.optionBook];
    if (!opcion) return;
    marcarOpcion(opcion.key);
    updateDirectBooking(opcion);
  });
});

directBookingSelect?.addEventListener('change', () => marcarOpcion(directBookingSelect.value));
marcarOpcion(null);   /* al cargar no hay nada elegido: la elección es del cliente */

/* --- La rueda ------------------------------------------------------------
   El desplazamiento es scroll nativo con imán (scroll-snap), así que funciona
   con dedo, trackpad, rueda y teclado sin código propio. Lo único que añade
   el JS es el énfasis: cuánto de centrada está cada tarjeta, de 1 a 0. Si el
   JS no llega, las tarjetas se ven todas a tamaño normal y se siguen pudiendo
   deslizar: no se esconde información en ningún caso. */
const carouselTrack = document.querySelector('[data-carousel-track]');
if (carouselTrack && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const tarjetas = [...carouselTrack.children];
  const puntos = [...document.querySelectorAll('[data-carousel-dots] li')];
  const anterior = document.querySelector('[data-carousel-prev]');
  const siguiente = document.querySelector('[data-carousel-next]');
  let pintando = false;

  function pintarRueda() {
    pintando = false;
    const centro = carouselTrack.scrollLeft + carouselTrack.clientWidth / 2;
    let masCentrada = 0, menorDistancia = Infinity;

    tarjetas.forEach((tarjeta, i) => {
      const medio = tarjeta.offsetLeft - carouselTrack.offsetLeft + tarjeta.offsetWidth / 2;
      const distancia = Math.abs(medio - centro) / tarjeta.offsetWidth;
      tarjeta.style.setProperty('--card-focus', Math.max(0, 1 - distancia).toFixed(3));
      if (distancia < menorDistancia) { menorDistancia = distancia; masCentrada = i; }
    });

    tarjetas.forEach((t, i) => i === masCentrada ? t.setAttribute('data-focused', '') : t.removeAttribute('data-focused'));
    /* aria-disabled y no disabled: el botón tiene que seguir recibiendo el clic
       para que éste llegue a la tarjeta y la centre. */
    tarjetas.forEach((t, i) => {
      const b = t.querySelector('[data-option-detail]');
      if (b) b.setAttribute('aria-disabled', String(i !== masCentrada));
    });
    puntos.forEach((p, i) => i === masCentrada ? p.setAttribute('data-on', '') : p.removeAttribute('data-on'));
    if (anterior) anterior.disabled = carouselTrack.scrollLeft <= 2;
    if (siguiente) siguiente.disabled = carouselTrack.scrollLeft >= carouselTrack.scrollWidth - carouselTrack.clientWidth - 2;
  }

  function pedirPintado() {
    if (pintando) return;
    pintando = true;
    requestAnimationFrame(pintarRueda);
  }

  const salto = () => tarjetas[0].offsetWidth + parseFloat(getComputedStyle(carouselTrack).columnGap || 0);
  anterior?.addEventListener('click', () => carouselTrack.scrollBy({ left: -salto(), behavior: 'smooth' }));
  siguiente?.addEventListener('click', () => carouselTrack.scrollBy({ left: salto(), behavior: 'smooth' }));

  /* Arranca centrado en la segunda tarjeta: así se ve una a cada lado desde
     el principio y se entiende que la fila sigue en las dos direcciones.
     Empezando en la primera quedaba medio lienzo vacío a la izquierda. */
  function centrar(indice, suave) {
    const t = tarjetas[indice];
    if (!t) return;
    const objetivo = t.offsetLeft - carouselTrack.offsetLeft + t.offsetWidth / 2 - carouselTrack.clientWidth / 2;
    carouselTrack.scrollTo({ left: Math.max(0, objetivo), behavior: suave ? 'smooth' : 'auto' });
  }

  carouselTrack.addEventListener('scroll', pedirPintado, { passive: true });
  addEventListener('resize', pintarRueda, { passive: true });
  document.fonts?.ready.then(() => { centrar(1, false); pintarRueda(); });

  /* Clic en una tarjeta lateral → la centra */
  tarjetas.forEach((tarjeta, i) => {
    tarjeta.addEventListener("click", () => centrar(i, true));
  });
  centrar(1, false);
  pintarRueda();
}

/* --- Tarjeta expandible (overlay desde la card) -------------------------
   Cada botón "Conocer la técnica" abre el panel .option-detail que vive
   dentro de esa misma tarjeta. Al abrir, el panel se mueve a <body> para
   escapar del contexto de transform de la card (si no, position:fixed
   se comporta como absolute). Al cerrar, vuelve a su sitio. */
;(function(){
  const btns = document.querySelectorAll('[data-option-detail]');
  if (!btns.length) return;

  // Guardar la tarjeta padre original de cada panel
  const panelOrigenes = new Map();

  function abrir(panel){
    // Guardar de dónde viene y mover a body para escapar del transform
    if(!panelOrigenes.has(panel)){
      panelOrigenes.set(panel, panel.parentElement);
    }
    document.body.appendChild(panel);
    // Forzar reflow para que la transición arranque
    panel.offsetHeight;
    panel.setAttribute('aria-hidden','false');
    document.body.classList.add('detail-open');
    const scroll = panel.querySelector('.option-detail-scroll');
    if(scroll) scroll.scrollTop = 0;
  }

  function cerrar(panel){
    panel.setAttribute('aria-hidden','true');
    document.body.classList.remove('detail-open');
    // Devolver al padre original después de la transición
    const origen = panelOrigenes.get(panel);
    if(origen) setTimeout(() => origen.appendChild(panel), 420);
  }

  btns.forEach(btn => {
    const key = btn.getAttribute('data-option-detail');
    const panel = document.querySelector('[data-detail-for="'+key+'"]');
    if(!panel) return;

    // Abrir — pero sólo si la tarjeta ya está centrada
    btn.addEventListener('click', e => {
      const tarjeta = btn.closest('.option-card');
      /* hayFoco: si el carrusel no está marcando ninguna tarjeta (movimiento
         reducido, o aún no ha pintado), no se bloquea nada. Si no, el botón de
         una tarjeta que no está centrada NO abre: se deja que el clic burbujee
         hasta la tarjeta, que es quien la centra. Un clic selecciona, el
         siguiente abre. */
      const hayFoco = !!document.querySelector('.option-card[data-focused]');
      if (hayFoco && tarjeta && !tarjeta.hasAttribute('data-focused')) return;
      e.stopPropagation(); // ya centrada: no hace falta volver a centrarla
      abrir(panel);
    });

    // Cerrar con botón ✕
    const closeBtn = panel.querySelector('.option-detail-close');
    if(closeBtn) closeBtn.addEventListener('click', () => {
      cerrar(panel);
      btn.focus();
    });

    // Cerrar al hacer clic en el fondo oscuro (fuera del panel)
    panel.addEventListener('click', e => {
      if(e.target === panel) {
        cerrar(panel);
        btn.focus();
      }
    });
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      const abierto = document.querySelector('.option-detail[aria-hidden="false"]');
      if(abierto){
        cerrar(abierto);
        const key = abierto.getAttribute('data-detail-for');
        const btn = document.querySelector('[data-option-detail="'+key+'"]');
        if(btn) btn.focus();
      }
    }
  });
})();
