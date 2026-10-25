/* ATLAS DE PUNTOS — la lámina se coloca según dónde esté el ratón,
   se frena al acercarte a un punto, y cada punto abre su ficha.
   Aislado a propósito en su propio archivo: design.js no se toca.
   v2 · 19-08-2026 — sustituye el arrastre, que resultaba ortopédico. */
(function () {
  'use strict';

  var viewport = document.querySelector('[data-atlas-viewport]');
  if (!viewport) return;

  var canvas = viewport.querySelector('[data-atlas-canvas]');
  var plate  = viewport.querySelector('.atlas-plate');
  var cursor = viewport.querySelector('[data-atlas-cursor]');
  var points = Array.prototype.slice.call(viewport.querySelectorAll('[data-atlas-point]'));

  var mqCoarse = window.matchMedia('(max-width:800px)');
  var mqQuieto = window.matchMedia('(prefers-reduced-motion: reduce)');
  /* Sin recorrido: móvil, o quien ha pedido menos movimiento. La lámina se ve
     entera y quieta, y los puntos se tocan directamente. */
  function estatico() { return mqCoarse.matches || mqQuieto.matches; }

  var MARGEN   = 0.03;   // holgura en los bordes. Ojo: cada punto de margen es zona muerta,
                         // donde mueves el ratón y la lámina ya está en su tope. Con 0.10 eran
                         // 126px de los 628 de alto (20% de la caja) y se notaba como atasco.
  var SUAVIDAD = 0.09;   // cuánto se acerca por fotograma a su sitio
  var FRENO    = 70;     // a esta distancia de un punto la lámina se espesa (no se congela)
  var PEGUE    = 0.10;   // cuánto queda de respuesta justo encima del punto: 0 sería congelarla
  var TOQUE    = 26;     // a esta distancia, el punto se considera tocado

  var mx = 0.5, my = 0.5;       // dónde está el ratón, de 0 a 1
  var tx = 0,   ty = 0;         // dónde está la lámina
  var dentro = false, abierta = null, corriendo = false;
  /* fijada: tras pinchar un punto, su ficha se queda abierta y la lámina deja de moverse,
     para poder llevar el ratón a la ficha y leerla sin que se escape. Se suelta al pinchar
     fuera, con Escape o al salir de la lámina. sobreFicha: el ratón está encima de una ficha. */
  var fijada = false, sobreFicha = false;
  var graciaHasta = 0;   /* al apartarte de un punto, su ficha espera 0,3 s con la lámina quieta: tiempo de llegar a ella */

  function limites() {
    var vw = viewport.clientWidth, vh = viewport.clientHeight;
    var cw = canvas.offsetWidth,   ch = canvas.offsetHeight;
    return { vw: vw, vh: vh, cw: cw, ch: ch,
             minX: Math.min(0, vw - cw), minY: Math.min(0, vh - ch) };
  }

  function enPantalla(point, L) {
    return { x: tx + parseFloat(point.style.getPropertyValue('--x')) / 100 * L.cw,
             y: ty + parseFloat(point.style.getPropertyValue('--y')) / 100 * L.ch };
  }

  function colocarFicha(point, card, L) {
    if (estatico()) return;                    // en móvil la ficha va fija al pie
    var s = enPantalla(point, L);
    var cw = card.offsetWidth, ch = card.offsetHeight, hueco = 28;
    var x = s.x + hueco;
    if (x + cw > L.vw - 16) x = s.x - hueco - cw;   // se voltea si no cabe a la derecha
    x = Math.max(16, Math.min(x, Math.max(16, L.vw - cw - 16)));
    var y = Math.max(16, Math.min(s.y - ch / 2, Math.max(16, L.vh - ch - 16)));
    card.style.setProperty('--px', x + 'px');
    card.style.setProperty('--py', y + 'px');
  }

  function cerrar() {
    if (!abierta) return;
    abierta.card.classList.remove('visible');
    abierta.point.classList.remove('is-active');
    abierta = null;
    fijada = false;
    sobreFicha = false;
    graciaHasta = 0;
  }

  function abrir(point) {
    var card = document.getElementById(point.getAttribute('aria-describedby'));
    if (!card) return;
    if (abierta && abierta.card === card) return;
    cerrar();
    abierta = { point: point, card: card };
    point.classList.add('is-active');
    card.classList.add('visible');
    colocarFicha(point, card, limites());
  }

  /* ---------- el bucle: colocar la lámina y ver qué punto queda debajo ---------- */
  function bucle() {
    if (estatico()) { corriendo = false; return; }
    var L = limites();
    var objX = tx, objY = ty, frenando = false;

    if (dentro && (fijada || sobreFicha || (graciaHasta && performance.now() < graciaHasta))) {
      objX = tx; objY = ty;           /* congelada: la ficha no se escapa del ratón */
    } else if (dentro) {
      var k = function (v) {
        return Math.max(0, Math.min(1, (v - MARGEN) / (1 - 2 * MARGEN)));
      };
      objX = k(mx) * L.minX;
      objY = k(my) * L.minY;

      /* Cerca de un punto la lámina se espesa, para que el punto no huya justo
         cuando vas a tocarlo. Antes se congelaba del todo, y con 7 puntos eso
         dejaba el 23% de la caja muerta: parecía que se atascaba. Ahora frena
         de forma progresiva y nunca llega a pararse. */
      var cx = mx * L.vw, cy = my * L.vh, resp = 1;
      for (var i = 0; i < points.length; i++) {
        var s = enPantalla(points[i], L);
        var d = Math.hypot(s.x - cx, s.y - cy);
        /* Encima del punto la lámina se para del todo: estás leyendo la ficha y
           si repta, el punto se escapa y la ficha se cierra sola. Acercándote,
           sólo se espesa, para que no dé la sensación de atasco. */
        if (d < TOQUE) resp = 0;
        else if (d < FRENO) resp = Math.min(resp, PEGUE + (1 - PEGUE) * (d / FRENO));
      }
      if (resp < 1) {
        objX = tx + (objX - tx) * resp;
        objY = ty + (objY - ty) * resp;
        frenando = resp < 0.55;
      }
    }

    tx += (Math.max(L.minX, Math.min(0, objX)) - tx) * SUAVIDAD;
    ty += (Math.max(L.minY, Math.min(0, objY)) - ty) * SUAVIDAD;
    canvas.style.setProperty('--tx', tx.toFixed(1) + 'px');
    canvas.style.setProperty('--ty', ty.toFixed(1) + 'px');
    viewport.classList.toggle('is-braking', frenando);

    if (dentro) {
      var cx2 = mx * L.vw, cy2 = my * L.vh, encima = null;
      points.forEach(function (p) {
        var s = enPantalla(p, L);
        if (Math.hypot(s.x - cx2, s.y - cy2) < TOQUE) encima = p;
      });
      var ahora = performance.now();
      if (fijada || sobreFicha) { graciaHasta = 0; }              /* la ficha fijada, o con el ratón encima, se queda */
      else if (encima) { graciaHasta = 0; abrir(encima); }
      else if (abierta && !abierta.point.matches(':focus')) {
        if (!graciaHasta) graciaHasta = ahora + 320;
        else if (ahora >= graciaHasta) cerrar();
      }
      if (abierta) colocarFicha(abierta.point, abierta.card, L);
    }

    requestAnimationFrame(bucle);
  }

  function arrancar() {
    if (estatico() || corriendo) return;
    corriendo = true;
    var L = limites();
    tx = 0; ty = L.minY * 0.30;          // arranca mirando el torso, no la coronilla
    requestAnimationFrame(bucle);
  }

  /* ---------- ratón ---------- */
  viewport.addEventListener('pointerenter', function () {
    dentro = true;
    viewport.classList.add('is-hovered', 'has-moved');
    arrancar();
  });
  viewport.addEventListener('pointerleave', function () {
    dentro = false;
    viewport.classList.remove('is-hovered', 'is-pressing', 'is-braking');
    cerrar();
  });
  viewport.addEventListener('pointermove', function (e) {
    var r = viewport.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width;
    my = (e.clientY - r.top) / r.height;
    cursor.style.setProperty('--cx', (e.clientX - r.left) + 'px');
    cursor.style.setProperty('--cy', (e.clientY - r.top) + 'px');
  });
  viewport.addEventListener('pointerdown', function () { viewport.classList.add('is-pressing'); });
  viewport.addEventListener('pointerup',   function () { viewport.classList.remove('is-pressing'); });

  /* ---------- puntos: click, teclado ---------- */
  points.forEach(function (point) {
    point.addEventListener('click', function (e) {
      e.preventDefault();
      /* Igual que el tooltip del Ki: el click siempre abre, nunca alterna. */
      abrir(point);
      if (!estatico()) fijada = true;     /* con ratón, el click además la fija */
    });
    point.addEventListener('focus', function () { abrir(point); });
    point.addEventListener('blur',  function () { if (!dentro) cerrar(); });
  });

  Array.prototype.forEach.call(viewport.querySelectorAll('[data-atlas-card]'), function (card) {
    card.addEventListener('pointerenter', function () { sobreFicha = true; });
    card.addEventListener('pointerleave', function () { sobreFicha = false; });
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
  document.addEventListener('click', function (e) { if (!viewport.contains(e.target)) cerrar(); });
  /* Pinchar dentro de la lámina pero fuera de un punto (o de su ficha) también cierra la ficha.
     En táctil no hay bucle que la cierre al apartar el dedo, así que esto es lo que la cierra. */
  viewport.addEventListener('click', function (e) {
    if (e.target.closest('.atlas-point') || e.target.closest('.atlas-card')) return;
    if (abierta) { abierta.point.blur(); cerrar(); }
  });

  /* ---------- cambios de tamaño y de preferencias ---------- */
  var espera;
  window.addEventListener('resize', function () {
    clearTimeout(espera);
    espera = setTimeout(function () {
      cerrar();
      if (estatico()) { corriendo = false; canvas.style.removeProperty('--tx'); canvas.style.removeProperty('--ty'); }
      else if (!corriendo && dentro) arrancar();
    }, 120);
  });
  if (mqQuieto.addEventListener) mqQuieto.addEventListener('change', function () { cerrar(); });

  if (plate && !plate.complete) plate.addEventListener('load', function () { if (dentro) arrancar(); }, { once: true });
})();
