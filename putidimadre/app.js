/* ============================================================
   PUTI DI MADRE — Interfaz
   ------------------------------------------------------------
   Todo el criterio de negocio vive en horno.js. Aquí solo se
   pinta y se recogen clics. Sin diseño a propósito: la capa
   visual es un trabajo aparte.
   ============================================================ */

/* Encapsulado: al ser scripts planos, sin esto los nombres internos
   (guardar, render, mulberry32…) chocan entre archivos. */
(function () {
'use strict';
const H = window.Horno;
const $ = (sel) => document.querySelector(sel);

const S = {
  vista: 'home',
  heroIdx: 0,
  carrito: [],
  franjas: [],
  franjaId: null,
  pedido: null,
  productoAbierto: null,
  vueltaCarta: 0,          // dónde estaba el scroll al abrir una ficha
  avisoFranja: null,
  incidencia: null,
  cliente: { nombre: '', telefono: '', nota: '', consiente: false },
  demo: {
    /* El mundo simulado —día, hora, semilla, pausa— sale de `demo.js`,
       que es el mismo estado que usa el panel del local y que recuerda
       lo que dejaste puesto al saltar de una pantalla a la otra. Su
       punto de partida es `Horno.DEMO`. */
    ...window.Demo.estado(),
    /* Nada de `pausado: false` debajo del spread: la pausa viene de
       arriba y una línea aquí la pisaba en silencio. El local podía
       estar en pausa en la cocina y la web seguir ofreciendo franjas,
       que es justo lo que este módulo venía a arreglar. */
    agotados: [],
    errorTecnico: false, sinConexion: false, franjaSeLlena: false,
  },
};

const ctx = () => ({ ahora: S.demo.ahora, pausado: S.demo.pausado });
const coste = () => H.costeCarrito(S.carrito);
const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
/* UNA SOLA PALABRA, Y ES «HUECO» (auditoría de Mery, 13/10/2026).

 * La web llamaba a la misma cosa de cuatro maneras: hueco en la llama y
 * en la confirmación, BANDEJA en la caja, «ud. de horno» en las líneas
 * del carrito y «unidades» en el panel. Cuatro nombres para un número
 * que es el corazón del modelo.
 *
 * Gana «hueco» y no «bandeja» —que era la palabra elegida el 21/08— por
 * dos razones. Una, que ya era la que más se decía: está en los cuatro
 * niveles de la llama («quedan pocos huecos»), en el aviso de franja
 * perdida («ese hueco acaba de volar») y en la confirmación («tienes
 * hueco a las 21:15»). Cambiar tres sitios es menos trabajo y menos
 * riesgo que cambiar uno, pero sobre todo: la palabra que ya usa la
 * interfaz en sus momentos de verdad es la que el cliente aprende.
 * Dos, que lo que se reserva ES un hueco. La bandeja es lo que se
 * entrega, y mezclaba la capacidad con el producto.
 *
 * «Unidades» se queda, pero SOLO EN EL PANEL. Allí es correcta: el
 * pizzero sí lleva una contabilidad, y panel.css existe precisamente
 * porque las dos interfaces pueden —y deben— hablar distinto.
 *
 * Y NADA DE DECIMALES DE CARA AL CLIENTE. `costeCarrito` redondea a
 * medias, así que solo hay enteros y mitades y caben todas escritas:
 *
 *   0,5 → medio hueco        1,5 → hueco y medio
 *   1   → 1 hueco            2,5 → 2 huecos y medio
 */
const uds = (n) => {
  if (!n) return 'nada';
  const enteros = Math.floor(n);
  const media = n % 1 !== 0;
  if (enteros === 0) return 'medio hueco';
  if (enteros === 1) return media ? 'hueco y medio' : '1 hueco';
  return enteros + (media ? ' huecos y medio' : ' huecos');
};

/* Lo que queda libre en una franja, con el verbo concordado. Antes era
   `cifra()` y salía «quedan 1,5 de 3 bandejas»: el decimal desnudo, y
   un plural que fallaba en cuanto quedaba uno. */
const quedan = (n) => {
  if (!n) return 'no queda ninguno';
  const singular = n === 1 || (n > 0 && n < 1) || (n > 1 && n < 2);
  return (singular ? 'queda ' : 'quedan ') + uds(n);
};

// La carta vigente lleva ya aplicados los precios y los agotados
// que ha puesto el local desde el panel (negocio.js).
const carta = () => window.Negocio.cartaVigente();

/* Una ilustración por categoría, como los grabados de una carta impresa.
   Va por ID de categoría y no por índice: antes se repartían con
   `i % longitud`, así que añadir o mover un grupo en carta.js barajaba
   todos los dibujos, y a "Algo dulce" le tocaba la mascota del logo.

   Las tres últimas están dibujadas para su categoría —bebidas, postre y
   pan— y por eso van fijas. Las de arriba son de Freepik; la atribución
   del pie distingue unas de otras. */
const ILUSTRACIONES = {
  siempre:   'ilus-6.png',
  casa:      'ilus-3.png',
  calzones:  'ilus-1.png',
  sincarne:  'ilus-5.png',
  acompanar: 'ilus-acompanar.png',
  dulce:     'ilus-dulce.png',
  bebidas:   'ilus-bebidas.png',
};
const ILUS_RESERVA = 'ilus-2.png';   // por si aparece una categoría nueva

/* ============================================================
   COMPONENTE · FILA DE PRODUCTO
   La misma para la carta y para el merchan. Si algún día hay que
   cambiar cómo se ve un producto, se cambia AQUÍ y cambia en los
   dos sitios. Antes estaba duplicada en pintarCarta y pintarTienda.
   ============================================================ */
/* Todos los productos llevan retrato, bebidas incluidas. Antes las
   bebidas se pintaban en tarjeta compacta sin foto, y quedaban como
   una lista distinta pegada al final de la carta en vez de parte de
   la misma carta. */
/* ============================================================
   LA FILA DE PRODUCTO YA NO VIVE AQUÍ
   ------------------------------------------------------------
   Se ha mudado a `componentes/filaProducto.js`, que cargan la web Y el
   capítulo 08 del sistema de diseño. Con ella se fueron el panel
   desplegable, la acción de la derecha y el aviso de las tocadas: son
   la misma pieza y estaban en cuatro funciones sueltas.

   Lo que cambió al mudarla, y es el motivo de mudarla: **el componente
   ya no pregunta qué llevas en la caja.** Se lo decimos nosotros, que
   para eso lo sabemos. Antes llamaba por dentro a `unidadesEnCaja()` y
   por eso no se podía enseñar fuera de esta web.
   ============================================================ */

/* Envoltorios: aquí es donde el estado de la caja se convierte en datos
   para el componente. Es la única costura entre los dos y va junta, para
   que se vea de un vistazo qué es lo que la fila necesita saber. */
function filaProducto(p, agotado, opts = {}) {
  return FilaProducto.crear(p, Object.assign({}, opts, {
    agotado,
    unidades: unidadesEnCaja(p.id),
    tocadas: unidadesTocadas(p.id),
  }));
}

function accionFila(p, agotado, opts = {}) {
  return FilaProducto.accion(p, Object.assign({}, opts, {
    agotado, unidades: unidadesEnCaja(p.id),
  }));
}

const panelFila = (p) => FilaProducto.panel(p);
const avisoTocadas = (p) => FilaProducto.aviso(unidadesTocadas(p.id));

/* Repinta solo los contadores de las filas visibles. Se llama al añadir
   o quitar desde la carta: cambiar solo este trozo evita reconstruir la
   lista entera, que es lo que haría perder el sitio al scroll. */
function refrescarFilas() {
  document.querySelectorAll('#lista-carta .pz, #lista-tienda .pz').forEach((art) => {
    const boton = art.querySelector('[data-prod], [data-quita]');
    if (!boton) return;                                   // fila agotada
    const id = boton.dataset.prod || boton.dataset.quita;
    const p = productoPorId(id);
    const hueco = art.querySelector('.pz__accion');
    if (!p || !hueco) return;
    hueco.innerHTML = accionFila(p, false);   // el panel no se toca: vive fuera de .pz__accion
    const viejo = art.querySelector('.pz__tocadas');
    if (viejo) viejo.remove();
    hueco.insertAdjacentHTML('afterend', avisoTocadas(p));
  });
}

/* Abre o cierra el panel de una fila. Solo uno abierto a la vez: con
   dos o tres desplegados la carta deja de leerse como una lista. */
function alternarPanel(fila) {
  const panel = fila.querySelector('.pz__panel');
  if (!panel) return;
  const abierto = !panel.hidden;

  document.querySelectorAll('.pz__panel').forEach((x) => {
    x.hidden = true;
    const f = x.closest('.pz');
    f.removeAttribute('data-abierta');
    marcarBotonPanel(f, false);
  });
  if (abierto) return;                       // se pulsó la que ya estaba

  const p = productoPorId(fila.dataset.fila);
  if (!p) return;

  /* Los manejadores se enganchan UNA vez, al panel —no a lo que hay
     dentro—, así que sobreviven a que se repinte el contenido. */
  if (!panel.dataset.conectado) {
    panel.dataset.conectado = '1';
    panel.addEventListener('change', () => { refrescarAlergenos(fila); refrescarTotal(fila); });
    /* Los +/− de cantidad viven dentro del panel, así que su clic se
       atrapa aquí y NO llega al manejador de la lista, que lo tomaría
       por "pulsar la fila" y cerraría el panel en la cara. */
    panel.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-cant]');
      if (!b) return;
      ev.stopPropagation();
      const caja = fila.querySelector('[data-n]');
      const ahora = +caja.textContent || 1;
      caja.textContent = Math.min(20, Math.max(1, ahora + (+b.dataset.cant)));
      refrescarTotal(fila);
    });
  }

  /* EL PANEL SE REPINTA CADA VEZ QUE SE ABRE, y esto se arregló el
     06/09/2026 porque estaba mal. Antes solo se pintaba la PRIMERA vez
     —`if (!panel.innerHTML)`— para no montar el panel de las doce pizzas
     de golpe. Lo de no montarlo hasta abrirlo estaba bien; lo de no
     reiniciarlo al reabrirlo, no:

       abrías, marcabas miel y sin albahaca, ponías 2 y metías
       reabrías  →  seguía todo marcado y en 2
       pulsabas «meter» sin tocar nada  →  metía otras 2

     Cuatro pizzas en la caja habiendo pulsado dos veces. Y quien lo veía
     no tenía forma de saber por qué: el panel se abre como si fuera
     nuevo, así que nadie sospecha que recuerda la vez anterior.

     Repintarlo cuesta lo que montar UNA pizza, no doce, que era lo que
     de verdad se quería evitar. */
  panel.innerHTML = panelFila(p);
  panel.hidden = false;
  fila.dataset.abierta = '1';
  marcarBotonPanel(fila, true);
}

/* El "+" de la fila es un INTERRUPTOR: abre el panel y, pulsado otra vez,
   lo cierra. Mientras estaba abierto seguía diciendo "+", que es mentira
   —lo que hace ahí es cerrar— y encima competía en coral con "Meterla en
   la caja", que es la acción de verdad una vez abierto.

   Se marca con `aria-expanded`, que es lo que un lector de pantalla
   necesita para anunciar "contraído/expandido", y de paso le da al CSS
   con qué girar el signo. La etiqueta también cambia: dejarla en "elegir
   opciones" cuando ya están a la vista no ayuda a nadie. */
function marcarBotonPanel(fila, abierto) {
  const b = fila.querySelector('.mas');
  if (!b) return;
  b.setAttribute('aria-expanded', String(abierto));
  const p = productoPorId(fila.dataset.fila);
  const nombre = p ? p.nombre : '';
  b.setAttribute('aria-label', abierto ? `Cerrar las opciones de ${nombre}`
                                       : `Elegir opciones de ${nombre}`);
}

/* Los alérgenos del panel se recalculan igual que en la ficha: si se
   quita el único ingrediente que aporta uno, deja de anunciarse. */
function refrescarAlergenos(fila) {
  const p = productoPorId(fila.dataset.fila);
  const caja = fila.querySelector('[data-alerg]');
  if (!p || !caja) return;
  const fuera = [...fila.querySelectorAll('[data-quitable]:checked')]
    .map((i) => (i.dataset.alergeno || '').toLowerCase()).filter(Boolean);
  const quedan = (p.alergenos || '').split(',').map((x) => x.trim()).filter(Boolean)
    .filter((al) => !fuera.includes(al.toLowerCase()));
  caja.innerHTML = quedan.length ? '<strong>Alérgenos:</strong> ' + quedan.join(', ') : '';
}

/* El precio que enseña el botón: el producto, más lo que se le haya
   puesto, por la cantidad elegida. Se recalcula al marcar un extra y al
   tocar la cantidad, porque un total que no se mueve mientras cambias
   cosas es peor que no ponerlo: parece que no te está escuchando. */
function refrescarTotal(fila) {
  const p = productoPorId(fila.dataset.fila);
  const caja = fila.querySelector('[data-total]');
  if (!p || !caja) return;
  const extras = [...fila.querySelectorAll('[data-extra]:checked')]
    .map((i) => CARTA.extras.find((e) => e.id === i.value)).filter(Boolean);
  const suelto = p.precio + extras.reduce((t, e) => t + e.precio, 0);
  const n = +(fila.querySelector('[data-n]')?.textContent) || 1;
  caja.textContent = eur(suelto * n);
  /* Y la frase del botón, que va con la cifra: «Meterla» para una,
     «Meter 3 en la caja» para tres. */
  const verbo = fila.querySelector('[data-verbo]');
  if (verbo) verbo.textContent = FilaProducto.verbo(p, n);
}

/* Mete en la caja lo que hay marcado en el panel y lo cierra. */
function meterDesdePanel(fila) {
  const p = productoPorId(fila.dataset.fila);
  if (!p) return;

  /* Lo obligatorio se exige AQUÍ igual que en la ficha. Una camiseta sin
     talla no es un pedido, es un problema para quien lo prepara. */
  const elegidas = {};
  let falta = null;
  (p.opciones || []).forEach((o) => {
    const sel = fila.querySelector(`[data-opcion="${o.id}"]:checked`);
    if (!sel) falta = o; else elegidas[o.id] = sel.value;
  });
  const err = fila.querySelector('.pzp__error');
  if (falta) {
    if (err) {
      err.textContent = `Elige ${falta.nombre.toLowerCase()} antes de añadirlo.`;
      err.hidden = false;
    }
    const primero = fila.querySelector(`[data-opcion="${falta.id}"]`);
    if (primero) primero.focus();
    return;
  }
  if (err) err.hidden = true;

  const extras = [...fila.querySelectorAll('[data-extra]:checked')]
    .map((i) => CARTA.extras.find((e) => e.id === i.value)).filter(Boolean);
  const sin = [...fila.querySelectorAll('[data-quitable]:checked')].map((i) => {
    const q = (p.quitables || []).find((x) => x.id === i.value);
    return q ? q.nombre : i.value;
  });
  const cuantas = +(fila.querySelector('[data-n]')?.textContent) || 1;
  anadir(p, cuantas, extras, elegidas, false, sin);
  const panel = fila.querySelector('.pz__panel');
  if (panel) { panel.hidden = true; fila.removeAttribute('data-abierta'); }
}

/* Quita una unidad de un producto desde la carta. Va por la ÚLTIMA
   línea que lo contenga: si hay una margarita sola y otra con miel,
   el "−" de la fila descuenta de la que se añadió después, que es la
   que la persona acaba de tocar. */
function quitarUnidad(id) {
  for (let i = S.carrito.length - 1; i >= 0; i--) {
    if (S.carrito[i].id !== id || !esSimple(S.carrito[i])) continue;
    if (S.carrito[i].cantidad > 1) S.carrito[i].cantidad -= 1;
    else S.carrito.splice(i, 1);
    S.franjaId = null;
    guardar();
    pintarCaja(true);
    pintarHero();
    pintarEstadoLocal();
    refrescarFilas();
    return;
  }
}

// Asterisco de 8 puntas del sistema (SISTEMA-DE-DISENO.html §04).
// Va inline para que herede los tokens de color.
const ASTERISCO =
  '<svg class="ast" viewBox="0 0 100 100" aria-hidden="true">' +
  '<path d="M50 2 L56.5 34.3 L83.9 16.1 L65.7 43.5 L98 50 L65.7 56.5 L83.9 83.9 ' +
  'L56.5 65.7 L50 98 L43.5 65.7 L16.1 83.9 L34.3 56.5 L2 50 L34.3 43.5 L16.1 16.1 ' +
  'L43.5 34.3 Z"/></svg>';

function productoPorId(id) {
  const v = carta();
  for (const c of v.categorias) {
    const p = c.productos.find((x) => x.id === id);
    if (p) return p;
  }
  return v.tienda.find((x) => x.id === id) || null;
}

// Un pedido solo de tienda no ocupa horno: cambia lo que hay que contarle.
const soloTienda = () => S.carrito.length > 0 && S.carrito.every((i) => i.tipo === 'merch');

const totalCarrito = () =>
  S.carrito.reduce((t, i) =>
    t + (i.precio + i.extras.reduce((e, x) => e + x.precio, 0)) * i.cantidad, 0);

// Promos aplicadas al carrito y a la franja elegida. Sin franja
// todavía no se promete ningún descuento de hora: se anuncia,
// pero no se descuenta hasta que se elige.
const cuenta = () => window.Promos.calcular(S.carrito, S.franjaId);

/* ---------- persistencia ---------- */

function guardar() {
  try {
    localStorage.setItem('pdm', JSON.stringify({ carrito: S.carrito, cliente: S.cliente }));
  } catch (e) { /* modo privado: seguimos sin persistir */ }
}
function cargar() {
  try {
    const d = JSON.parse(localStorage.getItem('pdm') || '{}');
    if (Array.isArray(d.carrito)) S.carrito = d.carrito;
    if (d.cliente) S.cliente = d.cliente;
  } catch (e) { /* nada */ }
}

/* Ir a la carta de verdad, no al principio de la home.
   `ir()` ya recibe la altura a la que dejar la página y hace el scroll él
   mismo, así que se le pasa la de la carta y se acabó. Se intentó primero
   con un `scrollIntoView` suave en el frame siguiente y no se movía nada:
   `ir()` hace su propio `scrollTo(0)` y los dos se pisaban. Menos listo y
   funciona. */
function irALaCarta() {
  ir('home');
  const carta = document.getElementById('carta');
  /* Salto seco, no suave. Un desplazamiento suave desde el carrito
     recorrería la home entera —hero, manifiesto— delante de alguien que
     acaba de pedir explícitamente ir a la carta: es hacerle mirar tres
     pantallas que no ha pedido ver. Y encima aquí no era fiable, porque
     al pulsar todavía se está en la vista corta del carrito. */
  if (carta) {
    window.scrollTo({ top: carta.getBoundingClientRect().top + window.scrollY });
  }
}

/* ---------- franjas ---------- */

function regenerar() {
  S.franjas = H.generarFranjas(S.demo.dia, S.demo.semilla);
  if (S.franjaId && !S.franjas.some((f) => f.inicio === S.franjaId)) S.franjaId = null;
}

const franjaElegida = () => S.franjas.find((f) => f.inicio === S.franjaId) || null;

/* ---------- navegación ---------- */

/* `altura` es dónde dejar el scroll al llegar. Por defecto arriba, que
   es lo correcto al cambiar de pantalla; pero al cerrar la ficha de un
   producto hay que devolver a la persona AL SITIO DE LA CARTA donde
   estaba. Mandarla al principio de la página después de mirar una pizza
   la obliga a volver a bajar a mano cada vez. */
function ir(vista, altura = 0) {
  S.vista = vista;
  S.incidencia = null;
  render();
  window.scrollTo({ top: altura });
}

function incidencia(tipo) {
  S.incidencia = tipo;
  S.vista = 'incidencia';
  render();
  window.scrollTo({ top: 0 });
}

/* ---------- carrito ---------- */

/* `saltar` decide si además se navega al carrito. Desde la ficha sí, que
   es el final de ese recorrido; desde el "+" de una fila NO, porque ahí
   estás recorriendo la carta y echarte al carrito en cada clic impide
   añadir dos cosas seguidas. El aviso de que ha entrado lo da el
   contador de la cabecera. */
/* Dos líneas del carrito son "la misma" si coinciden producto, extras y
   opciones. Una margarita con miel y una sin son cosas distintas y no
   deben sumarse; dos margaritas idénticas sí. */
const claveItem = (id, extras, opciones, sin) => [
  id,
  (extras || []).map((e) => e.id).sort().join(','),
  JSON.stringify(opciones || {}),
  (sin || []).slice().sort().join(','),
].join('|');

/* Una línea es "simple" si no se ha tocado: sin extras, sin quitados y
   sin opciones. Es la que añade el "+" de la fila. */
const esSimple = (i) =>
  !(i.extras || []).length && !(i.sin || []).length && !Object.keys(i.opciones || {}).length;

/* El contador de la fila cuenta SOLO las simples, y el "−" quita de
   esas. Antes sumaba todas las variantes, así que con una margarita
   normal y otra con miel la fila decía 2 y el "−" te borraba la
   personalizada: quitabas algo que no habías pedido quitar.
   Las personalizadas se gestionan en el carrito, que es donde se ven
   enteras con lo que llevan. */
function unidadesEnCaja(id) {
  return S.carrito.filter((i) => i.id === id && esSimple(i))
    .reduce((t, i) => t + i.cantidad, 0);
}

function unidadesTocadas(id) {
  return S.carrito.filter((i) => i.id === id && !esSimple(i))
    .reduce((t, i) => t + i.cantidad, 0);
}

function anadir(prod, cantidad, extras, opciones, saltar = true, sin = []) {
  /* Si ya está exactamente lo mismo en la caja, se suma a esa línea en
     vez de crear otra. Sin esto, tres clics en el "+" de la misma pizza
     dejaban tres líneas de una unidad en vez de una línea de tres. */
  const k = claveItem(prod.id, extras, opciones, sin);
  const ya = S.carrito.find((it) => claveItem(it.id, it.extras, it.opciones, it.sin) === k);
  if (ya) ya.cantidad += cantidad;
  else S.carrito.push({
    uid: 'i' + Date.now() + Math.floor(Math.random() * 1000),
    id: prod.id, nombre: prod.nombre, tipo: prod.tipo,
    precio: prod.precio, cantidad, extras, opciones: opciones || {}, sin: sin || [],
  });
  S.franjaId = null;       // cambiar el carrito invalida la franja elegida
  guardar();
  if (saltar) { ir('carrito'); return; }

  /* Sin salto de vista se actualiza SOLO lo que ha cambiado. Llamar a
     render() aquí reconstruía #lista-carta entera y la página pegaba un
     brinco de unos 260 px, que es peor que no dar respuesta ninguna.
     Lo que cambia al meter algo en la caja es el contador, y el hero y
     la cabecera porque la primera hora depende del coste del pedido. */
  pintarCaja(true);
  pintarHero();
  pintarEstadoLocal();
  refrescarFilas();
}

/**
 * Cablea los dos botones de una lista de productos. Son cosas DISTINTAS
 * y antes hacían lo mismo: los dos abrían la ficha, así que el "+"
 * mandaba a la foto en grande en vez de meter nada en la caja.
 *
 *   foto  [data-abrir]  → siempre abre la ficha. Es para mirar.
 *   +     [data-prod]   → mete el producto en la caja y te deja donde
 *                         estabas. Salvo que el producto tenga opciones
 *                         obligatorias (la talla de una camiseta): eso
 *                         no se puede decidir por el cliente, así que
 *                         entonces sí abre la ficha para que elija.
 */
function conectarLista(cont, lista) {
  const abrirFicha = (id) => {
    S.productoAbierto = id;
    S.listaAbierta = lista;
    S.vueltaCarta = window.scrollY;   // para poder devolverla aquí al cerrar
    ir('producto');
  };

  /* Delegación, no un listener por botón: el "+" de una fila se
     reemplaza por el contador − n + en cuanto añades algo, y con
     listeners sueltos ese contador nacería muerto.

     Y SOLO UNA VEZ. El contenedor sobrevive a los repintados, así que
     sin esta guarda cada render() apilaba otro manejador encima y un
     solo clic acababa añadiendo tres unidades. */
  if (cont.dataset.cableado === '1') return;
  cont.dataset.cableado = '1';

  cont.addEventListener('click', (ev) => {
    const foto = ev.target.closest('[data-abrir]');
    if (foto) { abrirFicha(foto.dataset.abrir); return; }

    const menos = ev.target.closest('[data-quita]');
    if (menos) { quitarUnidad(menos.dataset.quita); return; }

    const mas = ev.target.closest('[data-prod]');
    if (mas) {
      const p = productoPorId(mas.dataset.prod);
      if (!p) return;
      /* Si el producto se puede tocar —extras, quitables o una talla
         obligatoria— el "+" DESPLIEGA en vez de meterlo
         directa: así ves qué le puedes poner y quitar antes de decidir.
         Lo que no tiene nada que tocar —una cerveza, un tiramisú— se
         mete de una vez, porque desplegar un panel vacío sería una
         vuelta de más por nada. */
      /* Solo despliega el "+" grande, el de una fila sin nada en la caja.
         El "+" del contador − n + suma otra: un contador que despliega
         en vez de sumar deja de ser un contador. */
      const fila = mas.closest('.pz[data-fila]');
      if (mas.classList.contains('mas') && fila && panelFila(p)) {
        alternarPanel(fila); return;
      }
      anadir(p, 1, [], {}, false);
      return;
    }

    /* Meter en la caja desde el panel desplegado, con lo marcado. */
    const meter = ev.target.closest('[data-meter]');
    if (meter) { meterDesdePanel(meter.closest('.pz')); return; }

    /* Pulsar la fila DESPLIEGA el panel aquí mismo; no abre la ficha.
       La ficha entera se reserva para la foto, que es cuando alguien
       quiere mirar la pizza y no configurarla. Son dos vistas de la
       carta y cada una sirve para una cosa. */
    const fila = ev.target.closest('.pz[data-fila]');
    if (!fila) return;
    if (ev.target.closest('.pz__pie') || ev.target.closest('.pz__panel')) return;
    alternarPanel(fila);
  });
}

function quitar(uid) {
  S.carrito = S.carrito.filter((i) => i.uid !== uid);
  S.franjaId = null;
  guardar();
  render();
}

function cambiarCantidad(uid, delta) {
  const it = S.carrito.find((i) => i.uid === uid);
  if (!it) return;
  it.cantidad = Math.max(1, it.cantidad + delta);
  S.franjaId = null;
  guardar();
  render();
}

const hayAgotadoEnCarrito = () =>
  S.carrito.some((i) => S.demo.agotados.includes(i.id) || window.Negocio.estaAgotado(i.id));

/* ============================================================
   RENDER
   ============================================================ */

/**
 * El contador de la caja. `salta` enciende el aviso visual: sin él,
 * añadir desde el "+" de una fila no se nota, porque lo único que
 * cambia es una cifra pequeña en la cabecera.
 *
 * Estaba definido en SISTEMA-DE-DISENO §10 ("escala 1,9 → 1 con
 * destello coral") y marcado como pendiente en §11 junto al aria-live.
 * Esto es lo que faltaba.
 */
function pintarCaja(salta) {
  const el = $('#n-caja');
  const n = S.carrito.reduce((t, i) => t + i.cantidad, 0);
  const caja = $('.cab__caja');
  /* El encendido va SIEMPRE, aunque la cifra no haya cambiado: se vuelve
     de otra pantalla, se recarga la página con el carrito guardado, se
     vacía la caja… y el botón tiene que decir la verdad en todas. */
  if (caja) caja.classList.toggle('cab__caja--llena', n > 0);
  if (el.textContent === String(n) && !salta) return;
  el.textContent = n;
  if (!salta) return;
  if (!caja) return;
  caja.classList.remove('cab__caja--salta');
  void caja.offsetWidth;              // reinicia la animación si se pulsa rápido
  caja.classList.add('cab__caja--salta');
}

function render() {
  document.querySelectorAll('.vista').forEach((v) => (v.hidden = true));
  const activa = $('#v-' + S.vista);
  if (activa) activa.hidden = false;

  pintarCaja();
  pintarEstadoLocal();
  pintarDemo();

  ({
    home: pintarHome,
    producto: pintarProducto,
    carrito: pintarCarrito,
    franjas: pintarFranjas,
    datos: pintarDatos,
    confirmacion: pintarConfirmacion,
    seguimiento: pintarSeguimiento,
    incidencia: pintarIncidencia,
  }[S.vista] || (() => {}))();
}

function pintarEstadoLocal() {
  const el = $('#estado-local');
  const cfg = H.dias()[S.demo.dia];
  if (!cfg) { el.textContent = 'CERRADO — hoy el horno descansa'; return; }
  if (S.demo.pausado) { el.textContent = 'PEDIDOS EN PAUSA'; return; }
  const abierto = S.demo.ahora >= cfg.abre && S.demo.ahora <= cfg.ultimaFranja;
  const prim = H.primeraOfrecible(S.franjas, coste(), ctx());
  el.textContent = abierto
    ? 'ABIERTO · ' + (prim ? 'Primera recogida: ' + H.formatoHora(prim.inicio) : 'sin franjas libres')
    : 'CERRADO · Abrimos a las ' + H.formatoHora(cfg.abre);
}

/* ============================================================
   HOME — los siete bloques de §7
   ============================================================ */

function pintarHome() {
  pintarHero();
  pintarCarta();
  pintarTienda();
  pintarResenas();
  pintarHistoria();
  pintarHorarios();
  pintarRecalentar();
  pintarFAQ();
}

/* 05-bis · Quiénes somos.
   Cada beat sostiene una decisión de negocio: el local pequeño,
   el nombre, por qué se abandonó el agregador y qué se le pide
   al barrio a cambio. La historia es el argumento en versión
   humana, no un adorno. */
function pintarHistoria() {
  const h = CONTENIDO.historia;
  $('#historia-titulo').textContent = h.titulo;
  $('#historia-entradilla').textContent = h.entradilla;
  // Numerados y desplegables. <details> nativo, no divs con JS: así
  // funcionan con teclado y con lector de pantalla sin escribir nada.
  // El primero abierto, para que se entienda que los demás se abren.
  $('#historia-beats').innerHTML = h.beats.map((b, i) =>
    `<li>
       <details class="beat"${i === 0 ? ' open' : ''}>
         <summary class="beat__cab">
           <span class="beat__n">${String(i + 1).padStart(2, '0')}</span>
           <span class="beat__tit">${b.t}</span>
           <span class="beat__mas" aria-hidden="true"></span>
         </summary>
         <p class="beat__txt">${b.p}</p>
       </details>
     </li>`).join('');
  $('#historia-cierre').textContent = h.cierre;
}

/* 06-ter · Cómo recalentarla.
   Post-compra: el momento en que el cliente necesita esto no es
   mientras elige con hambre, sino al día siguiente con media pizza
   en la nevera. Por eso vive abajo en el scroll y se enlaza además
   desde la pantalla de "lista para recoger". */
function pintarRecalentar() {
  const r = CONTENIDO.recalentar;
  $('#recalentar-titulo').textContent = r.titulo;
  $('#recalentar-entradilla').textContent = r.entradilla;
  $('#recalentar-antes').textContent = r.antes;

  $('#lista-metodos').innerHTML = r.metodos.map((m) => `
    <div class="metodo${m.mejor ? ' metodo--mejor' : ''}">
      <div class="metodo__cab">
        <h3 class="metodo__nom">${m.nombre}</h3>
        <span class="metodo__tiempo">${m.tiempo}</span>
        ${m.mejor ? '<span class="metodo__rec">Recomendado</span>' : ''}
      </div>
      <p class="metodo__por">${m.porque}</p>
      <ol class="metodo__pasos">${m.pasos.map((p) => `<li>${p}</li>`).join('')}</ol>
    </div>`).join('');

  $('#recalentar-extra').innerHTML = `
    <div class="recal__micro">
      <h3 class="recal__micro-t">${r.microondas.t}</h3>
      <p class="recal__micro-p">${r.microondas.p}</p>
    </div>
    <p class="recal__guardar">${r.guardar}</p>`;
}

/* Enlaces a los agregadores.
   `desde` identifica el punto de la web desde el que se sale, para
   poder medirlo después en el panel. `prominente` decide si es un
   bloque o una línea: prominente SOLO donde el canal propio no
   puede servir. */
function bloqueAgregadores(desde, prominente) {
  const a = CONTENIDO.agregadores;
  const botones = a.enlaces.map((e) =>
    `<a href="${e.url}" target="_blank" rel="noopener"
        data-salida="${e.id}" data-desde="${desde}"><button type="button">${e.nombre}</button></a>`).join(' ');

  return prominente
    ? `<div class="bloque">
         <h3>${a.titulo}</h3>
         <p>${a.entradilla} <span class="nota">${a.honestidad}</span></p>
         <p>${botones}</p>
         <p class="nota">${a.nota}</p>
       </div>`
    : `<p class="nota">${a.titulo} ${botones} <br>${a.nota}</p>`;
}

/* ------------------------------------------------------------
   LA CORTINA DEL AGREGADOR
   ------------------------------------------------------------
   Pulsar «Just Eat» no te saca de la web: te para y te dice que la
   pizzería es inventada. El chiste es el argumento del proyecto —el
   manifiesto entero te pide que bajes andando y el botón que te pilla
   es el de la moto—, y de paso resuelve que esos enlaces llevaban a
   una ficha que no existe.

   Y CAMBIA LO QUE MIDE EL PANEL. Antes se contaba el CLIC; ahora se
   cuenta la SALIDA DE VERDAD, la de quien, después de que le digan
   que es una maqueta, sigue teniendo hambre. Es un número más pequeño
   y mucho más honesto: el panel pregunta «cuánta gente se nos va», no
   «cuánta gente tiene curiosidad».
   ------------------------------------------------------------ */
function abrirCortina(id, desde, url, nombre) {
  const c = $('#cortina');
  if (!c || !c.showModal) {        // sin <dialog>, que el enlace haga lo suyo
    window.Negocio.contarSalida(id, desde);
    return false;
  }
  const t = CONTENIDO.agregadores.cortina;
  c.querySelector('.cortina__tit').textContent = t.titulo;
  c.querySelector('.cortina__txt').textContent = t.texto;
  c.querySelector('.cortina__pie').textContent = t.pie;
  const no = $('#cortina-no'), si = $('#cortina-si');
  no.textContent = t.volver;
  si.textContent = t.seguir + ' · ' + nombre + ' →';
  si.href = url;
  /* Se reemplaza el manejador en vez de acumularlo: la cortina es una
     sola y la abren dos botones distintos. */
  si.onclick = () => { window.Negocio.contarSalida(id, desde); c.close(); };
  no.onclick = () => c.close();
  c.showModal();
  return true;
}

// Se conecta después de pintar, allá donde haya salidas.
function conectarSalidas(raiz) {
  (raiz || document).querySelectorAll('[data-salida]').forEach((el) =>
    el.addEventListener('click', (ev) => {
      const nombre = (CONTENIDO.agregadores.enlaces
        .find((e) => e.id === el.dataset.salida) || {}).nombre || '';
      if (abrirCortina(el.dataset.salida, el.dataset.desde, el.href, nombre)) {
        ev.preventDefault();
      }
    }));
}

/* 06-bis · Preguntas frecuentes.
   El mismo array alimenta esta sección y el FAQPage JSON-LD. */
function pintarFAQ() {
  $('#lista-faq').innerHTML = CONTENIDO.faq.map((f) =>
    `<details class="faq">
       <summary class="faq__cab">
         <span class="faq__q">${f.q}</span>
         <span class="faq__mas" aria-hidden="true"></span>
       </summary>
       <p class="faq__a">${f.a}</p>
     </details>`).join('');
}

/* 03-bis · La tienda */
function pintarTienda() {
  const cont = $('#lista-tienda');
  cont.innerHTML = '';
  // Mismo patrón que la carta: es el mismo pedido, así que se lee igual.
  const rej = document.createElement('div');
  rej.className = 'cat__rej';

  carta().tienda.forEach((p) => {
    const agotado = p.agotado || S.demo.agotados.includes(p.id);
    rej.appendChild(filaProducto(p, agotado,
      { etiquetaAgotado: 'Agotado', notaAgotado: 'Vuelve la semana que viene' }));
  });

  cont.appendChild(rej);
  conectarLista(cont, 'tienda');
}

/* 01 · Hero: personalidad arriba, utilidad justo debajo.
   La primera hora disponible sale del motor, no de un texto fijo:
   el bloque más emocional de la página está conectado al horno. */
/**
 * Carga del horno, de 0 a 1: la franja MÁS llena de las próximas dos horas.
 *
 * Se probó primero con la media de toda la noche y no servía: las franjas
 * tardías, casi vacías, aplastaban el dato y la llama se quedaba siempre
 * igual (0,22 a 0,34 entre escenarios muy distintos). El pico de las
 * próximas dos horas sí discrimina (0,67 a 1,00) y además es lo que de
 * verdad significa "el horno ahora".
 *
 * Solo LEE de horno.js; no decide nada de negocio.
 */
const VENTANA_CALOR_MIN = 120;

function cargaDelHorno() {
  const cerca = S.franjas.filter((f) =>
    f.inicio >= S.demo.ahora && f.inicio <= S.demo.ahora + VENTANA_CALOR_MIN);
  if (!cerca.length) return 1;                       // no queda turno por delante
  return Math.max(...cerca.map((f) => Math.min(1, f.ocupadas / f.cuota)));
}

/**
 * En qué nivel está el horno ahora mismo. Devuelve una entrada de
 * CONTENIDO.horno, que es donde vive el vocabulario y el copy.
 *
 * El orden importa y no es arbitrario: primero los dos niveles que
 * son un HECHO (cerrado, y sin ninguna franja que admita el pedido)
 * y solo después se mira el porcentaje. Un horno puede estar al 100 %
 * las próximas dos horas y seguir teniendo hueco a las 23:00: eso es
 * "a tope", no es "no da más".
 */
function nivelDelHorno() {
  const N = CONTENIDO.horno;
  const cfg = H.dias()[S.demo.dia];
  if (!cfg || S.demo.pausado) return N.apagado;

  const prim = H.primeraOfrecible(S.franjas, coste(), ctx());
  if (!prim) return N.noDaMas;

  /* Aquí está la diferencia entre las dos formas de "no da más".
     Esta hornada está llena pero el turno no ha terminado: puedes
     pedir, solo que recoges más tarde. No es un muro, es una espera,
     y se dice distinto. El muro de verdad es el 'prim' vacío de arriba.

     RETIRADO el 23/08/2026. Aquí vivía un nivel más, 'siguiente-hornada',
     que saltaba cuando había franjas llenas por delante y la espera
     pasaba de 40 minutos. Se quitó por una razón de copy, no de código:
     con el horno a tope, "entras en la siguiente hornada" es contarle al
     cliente lo que acaba de deducir solo. Ahora ese caso cae en el nivel
     que le toque por carga —que será 'llama-viva'— y la hora concreta la
     sigue diciendo "Primera recogida" justo debajo, que es el dato útil.
     Ver contenido.js → horno. */
  const carga = cargaDelHorno();
  return N.niveles.find((n) => carga < n.hasta) || N.niveles[N.niveles.length - 1];
}

/** La llama es un indicador, no un adorno. Ver SISTEMA-DE-DISENO.html §04. */
function pintarLlama() {
  const fuego = $('#llama-fuego');
  if (!fuego) return;
  const nivel = nivelDelHorno();

  /* EL TAMAÑO LO DA EL NIVEL, no la carga exacta (23/08/2026).

     Hasta hoy esta llama se escalaba con una fórmula sobre la ocupación
     —`0.55 + carga * 0.36`— mientras las del selector de hora saltaban por
     nivel. Dos escalas distintas para el mismo indicador, y la avería que
     eso causaba era concreta: había un nivel que solo salía aquí, así que
     su tamaño no dependía de él sino del porcentaje que tocara, y acababa
     idéntico a `llama-viva`. Un nivel que no se puede ver no es un nivel
     — de hecho aquel acabó retirándose, ver contenido.js → horno.

     El recorrido no cambia: la fórmula iba de (0.55, 0.30) a (0.91, 0.885)
     y la escala por nivel va de (0.50, 0.22) a (0.91, 0.885). Lo que cambia
     es que ahora hay CINCO tamaños y son los mismos en toda la web, así que
     el muestrario y el documento pueden enseñarlos sin mentir. */
  fuego.style.transform = window.Llama.ESCALA[nivel.id] || window.Llama.ESCALA.rescoldo;
  fuego.setAttribute('data-nivel', nivel.id);
  /* Se mantiene data-lleno: es el que ya usaban las reglas de bloqueo
     y algún selector de CSS. data-nivel lo afina, no lo sustituye. */
  fuego.setAttribute('data-lleno', nivel.id === 'no-da-mas' ? '1' : '0');

  const rotulo = $('#horno-nivel');
  if (rotulo) rotulo.textContent = nivel.frase;
}

/* Las dos bandas corridas de la home, una hacia cada lado.
 *
 * Se alimentan de `Promos.activas()`, o sea de lo que el local haya
 * encendido en su panel: no son un cartel pintado a mano. Si apaga todas,
 * las bandas desaparecen solas.
 *
 * El texto se repite cuatro veces dentro de cada banda porque un carrusel
 * de CSS necesita material de sobra para que no se vea el corte al volver
 * a empezar. Las copias van con aria-hidden: quien usa lector de pantalla
 * necesita oír la promo UNA vez, no cuatro.
 */
function pintarBandas() {
  const caja = $('#bandas-promo');
  if (!caja) return;
  /* LA HOME NO ANUNCIA EL DESCUENTO POR HORAS, y es una decisión.

     La promo de hora se dice donde se elige la hora: en la etiqueta del
     chip, encima de la hora concreta que la lleva. Aquí arriba no hay
     ninguna hora que elegir, así que un "−10 %" corriendo por la cinta
     solo puede hacer dos cosas: prometer sin decir cuándo, o repetir lo
     que el selector ya dice mejor. La cinta se queda para lo que SÍ es de
     la home —la cartilla, que no depende de ninguna hora—.

     Si algún día no queda ninguna promo de este tipo encendida, la cinta
     desaparece entera, que es lo que ya hacía. */
  const activas = window.Promos.activas().filter((p) => p.tipo !== 'porcentaje');
  if (!activas.length) { caja.hidden = true; caja.innerHTML = ''; return; }

  /* Texto CORRIDO, no etiquetas. Es una cinta: letras seguidas pasando de
     largo, como la banda de una obra o de la policía. La primera versión
     eran pegatinas sueltas y no era eso — Mery pidió "una banda de letras
     todo corrido" y yo monté cuatro carteles.

     Los colores son los dos de siempre: tinta y papel, invertidos de una
     banda a otra. El amarillo de promo se quedó fuera a propósito: ese
     token está reservado a la pegatina pequeña (§06), y a lo ancho de la
     pantalla deja de señalar y empieza a gritar.

     El separador es el ASTERISCO de la casa, el SVG de ocho puntas. */
  /* De las de porcentaje, SOLO LA MAYOR. Los dos escalones del valle son
     una sola política, y la cinta de la home no es donde se elige la hora:
     aquí basta con "hay horas más baratas". El detalle —cuál y cuánto—
     vive en la etiqueta de cada chip del selector, que es donde decides.
     Sin esto, partir la promo en dos metía un mensaje más en la home sin
     que nadie lo hubiera pedido. */
  const frases = activas.map((p) => p.etiqueta);
  const tira = (arr) => arr.map((t) =>
    `<span class="banda__it">${t}${ASTERISCO}</span>`).join('');

  /* UNA PROMO POR BANDA, repartidas. Antes las dos bandas llevaban TODAS
     las promos y solo cambiaban por cuál empezaban: con dos encendidas,
     las dos cintas decían lo mismo y no hacía falta la segunda. Ahora se
     reparten alternando —la 1ª y la 3ª arriba, la 2ª y la 4ª abajo—, así
     que cada cinta tiene su propio contenido y la de abajo se gana estar.
     Con una sola promo encendida, una sola cinta. */
  const arriba = frases.filter((_, i) => i % 2 === 0);
  const abajo  = frases.filter((_, i) => i % 2 === 1);

  const cinta = (clase, arr) => arr.length
    ? `<div class="banda ${clase}"><div class="banda__pista">` +
        tira(arr) + `<span aria-hidden="true">` + tira(arr).repeat(3) + `</span>` +
      `</div></div>`
    : '';

  /* Las cintas van dentro de SU PROPIA caja recortada, y la explicación
     fuera. Estuvieron las tres en la misma y al desplegarse la explicación
     se metía en el recuadro que recorta las diagonales: quedaba cortada y
     pisando las cintas. Una caja que recorta no puede contener también lo
     que tiene que crecer. */
  caja.hidden = false;
  caja.innerHTML =
    '<div class="bandas__cintas">' +
      cinta('banda--coral', arriba) +
      cinta('banda--tinta', abajo) +
    '</div>' +
    /* LA CINTA ENGANCHA, ESTE RENGLÓN EXPLICA.
       Las promos tienen una explicación escrita en promos.js desde el
       principio y no la usaba nadie. En la cinta no caben: un texto que
       pasa de largo se ojea, no se lee. La cinta dice QUÉ hay y esto dice
       EN QUÉ CONSISTE, quieto y debajo. */
    `<div class="promos-detalle">` +
      activas.map((p) =>
        `<p class="promos-detalle__it"><strong>${p.etiqueta}.</strong> ${p.explicacion}</p>`
      ).join('') +
    `</div>`;
}

function pintarHero() {
  const h = CONTENIDO.heroes[S.heroIdx] || CONTENIDO.heroes[0];
  $('#hero-titular').innerHTML = h.titular;
  $('#hero-apoyo').textContent = h.apoyo;
  pintarLlama();
  pintarBandas();

  const cfg = H.dias()[S.demo.dia];
  const util = $('#hero-utilidad');
  if (!cfg) {
    util.textContent = 'Hoy el horno descansa. Volvemos mañana a las 19:00.';
    return;
  }
  const prim = H.primeraOfrecible(S.franjas, coste(), ctx());
  util.innerHTML = S.demo.pausado
    ? 'Pedidos en pausa ahora mismo.'
    : prim
      ? `Primera recogida <strong>${H.formatoHora(prim.inicio)}</strong>`
      : `Esta noche ya no quedan huecos. Abrimos mañana a las ${H.formatoHora(cfg.abre)}.`;
}

/* 05 · Prueba social */
function pintarResenas() {
  // Resumen de la ficha de Google. En el prototipo el enlace no lleva a
  // ningún sitio a propósito: el negocio es ficticio y enlazar a la ficha
  // de un local real sería atribuirle sus reseñas a esta marca.
  const g = CONTENIDO.google;
  $('#google-resumen').innerHTML = `
    <p class="gg__nota">${g.nota}<span class="gg__sobre">/5</span></p>
    <div class="gg__cuerpo">
      <p class="gg__estrellas" aria-hidden="true">${ASTERISCO.repeat(5)}</p>
      <p class="gg__txt"><strong>${g.total} reseñas</strong> en Google. Abajo van cinco,
        elegidas porque cuentan cosas distintas.</p>
    </div>
    ${g.enlace === '#'
      /* Mientras no haya ficha de Google de verdad, esto NO ES UN ENLACE.
         Es la misma regla del chip de hora bloqueado: anunciar algo
         pulsable que no lleva a ningún sitio es mentirle al teclado y al
         lector de pantalla, y con el ratón te manda de vuelta arriba del
         todo sin avisar. Mismo aspecto, sin promesa. En producción
         `contenido.js` trae la URL y vuelve a ser un <a>. */
      ? `<span class="btn btn--secundario gg__enlace" aria-describedby="aviso-ficticio"
           >Verlas todas en Google</span>`
      : `<a class="btn btn--secundario gg__enlace" href="${g.enlace}"
           target="_blank" rel="noopener"
           aria-describedby="aviso-ficticio">Verlas todas en Google</a>`}`;

  // La primera va a lo ancho: es la que cuenta la promesa del producto
  // (pedir y no esperar). Las demás caen en rejilla debajo.
  $('#lista-resenas').innerHTML = CONTENIDO.resenas.map((r, i) =>
    `<blockquote class="resena${i === 0 ? ' resena--grande' : ''}">
       <span class="resena__comilla" aria-hidden="true">&ldquo;</span>
       <p class="resena__txt">${r.texto}</p>
       <cite class="resena__firma">${r.firma}</cite>
     </blockquote>`).join('');
}

/* 06 · El barrio — los horarios se derivan de la configuración
   del horno para que no puedan contradecir a las franjas. */
function pintarHorarios() {
  /* Una fila por TRAMO, no por día: el local edita los siete días de
     uno en uno, pero en la puerta se lee «martes y miércoles». Los
     tramos los junta el horno solo, así que si Nino cierra el
     miércoles esta tabla se parte sola en dos filas. */
  const filas = H.tramos().map((t) => {
    const horas = t.cfg
      ? `${H.formatoHora(t.cfg.abre)} – ${H.formatoHora(t.cfg.ultimaFranja + H.HORNO.granularidadMin)}`
      : 'Cerrado';
    return `<div class="hr${t.cfg ? '' : ' hr--cerrado'}">
      <span class="hr__dia">${t.nombre}</span>
      <span class="hr__horas">${horas}</span></div>`;
  }).join('');
  const agg = CONTENIDO.agregadores;
  const botones = agg.enlaces.map((e) =>
    `<a class="barrio__app" href="${e.url}" target="_blank" rel="noopener"
        data-salida="${e.id}" data-desde="barrio">${e.nombre} →</a>`).join('');
  $('#horarios').innerHTML =
    `<div class="hrs">${filas}
       <p class="hrs__nota">Última recogida 15 min antes del cierre.</p>
     </div>
     <div class="barrio__apps">
       <p class="barrio__apps-txt">${agg.titulo} ${agg.honestidad}</p>
       <div class="barrio__apps-row">${botones}</div>
       ${agg.nota ? `<p class="barrio__apps-nota">${agg.nota}</p>` : ''}
     </div>`;
  conectarSalidas($('#barrio'));
}

/* 03 · La carta */

function pintarCarta() {
  const cont = $('#lista-carta');
  cont.innerHTML = '';
  const cfg = H.dias()[S.demo.dia];

  if (!cfg) {
    cont.innerHTML = `<div class="aviso-cerrado"><h3>El horno está descansando.</h3>
      <p>Hoy no abrimos. Puedes mirar la carta, pero no reservar hora.</p></div>`;
  }

  carta().categorias.forEach((cat) => {
    const sec = document.createElement('section');
    sec.className = 'cat';
    const ilus = ILUSTRACIONES[cat.id] || ILUS_RESERVA;
    sec.innerHTML =
      `<h3 class="cat__tit">${ASTERISCO}<span>${cat.nombre}</span>${ASTERISCO}</h3>` +
      (cat.nota ? `<p class="cat__nota">${cat.nota}</p>` : '') +
      `<img class="cat__ilus" src="ilustraciones/${ilus}" alt="" aria-hidden="true" loading="lazy" decoding="async">` +
      '<div class="cat__rej"></div>';
    const rej = sec.querySelector('.cat__rej');

    cat.productos.forEach((p) => {
      const agotado = p.agotado || S.demo.agotados.includes(p.id);
      rej.appendChild(filaProducto(p, agotado));
    });
    cont.appendChild(sec);
  });

  conectarLista(cont, 'carta');
}

/* ---------- detalle de producto ---------- */

/* ============================================================
   FICHA DE PRODUCTO · manda la foto
   Es la segunda forma de ver el menú: pinchas una foto y el producto
   se abre en grande, con todo lo que hace falta para pedirlo debajo.
   Las flechas recorren la lista de la que viniste — la carta y el
   merchan no se mezclan, son dos cosas distintas.
   ============================================================ */

/** Lista plana de la que se navega con las flechas. */
function listaAbierta() {
  return S.listaAbierta === 'tienda'
    ? carta().tienda
    : carta().categorias.flatMap((c) => c.productos);
}

function saltarProducto(paso) {
  const lista = listaAbierta();
  const i = lista.findIndex((x) => x.id === S.productoAbierto);
  const siguiente = lista[(i + paso + lista.length) % lista.length];
  S.productoAbierto = siguiente.id;
  pintarProducto();
}

function pintarProducto() {
  const p = productoPorId(S.productoAbierto);
  const v = $('#v-producto');
  if (!p) { ir('home'); return; }
  const esMerch = p.tipo === 'merch';
  const llevaExtras = p.tipo === 'pizza' || p.tipo === 'calzone';
  const opciones = p.opciones || [];
  const lista = listaAbierta();
  const pos = lista.findIndex((x) => x.id === p.id) + 1;

  v.innerHTML = `
    <div class="ficha">
      <div class="ficha__marco">
        <button type="button" class="ficha__x" id="p-volver" aria-label="Cerrar">×</button>
        <button type="button" class="ficha__flecha ficha__flecha--izq" id="p-ant"
                aria-label="Producto anterior">‹</button>
        <div class="ficha__foto${esMerch ? ' ficha__foto--cuadrada' : ''}" aria-hidden="true">
          ${p.imagen ? `<img src="${p.imagen}" alt="" loading="lazy" decoding="async">` : `<span>foto · ${esMerch ? '1:1' : '3:2'}</span>`}</div>
        <button type="button" class="ficha__flecha ficha__flecha--der" id="p-sig"
                aria-label="Producto siguiente">›</button>
        <p class="ficha__pos">${pos} / ${lista.length}</p>
      </div>

      <div class="ficha__cuerpo">
        <p class="ficha__eti">${p.etiquetas.map((t) => `<span class="tag">${t}</span>`).join('')}</p>
        <h1 class="ficha__nom">${p.nombre}</h1>
        <p class="ficha__ing">${p.ingredientes}</p>
        ${esMerch ? '' : `<p class="ficha__alerg" id="p-alerg"><strong>Alérgenos:</strong> ${p.alergenos || '—'}</p>`}

        ${(p.quitables || []).length ? `
          <fieldset class="ops ops--quitar">
            <legend class="ops__tit">Quítale lo que no te guste</legend>
            <div class="ops__rej">
              ${p.quitables.map((q) => `
                <label class="tick">
                  <input type="checkbox" data-quitable="${q.id}" value="${q.id}"
                         data-alergeno="${q.alergeno || ''}">
                  <span class="tick__txt">Sin ${q.nombre.toLowerCase()}</span>
                </label>`).join('')}
            </div>
            <p class="ops__pie">Quitar no descuenta: la pizza cuesta lo mismo.</p>
          </fieldset>` : ''}

        ${opciones.map((o) => `
          <fieldset class="ops" data-grupo="${o.id}">
            <legend class="ops__tit">${o.nombre} · obligatorio</legend>
            <div class="ops__rej">
              ${o.valores.map((val) => `
                <label class="tick">
                  <input type="radio" name="op-${o.id}" data-opcion="${o.id}" value="${val}">
                  <span class="tick__txt">${val}</span>
                </label>`).join('')}
            </div>
          </fieldset>`).join('')}

        ${llevaExtras ? `
          <fieldset class="ops">
            <legend class="ops__tit">Hazla todavía mejor</legend>
            <div class="ops__rej">
              ${CARTA.extras.map((e) => `
                <label class="tick">
                  <input type="checkbox" value="${e.id}">
                  <span class="tick__txt">${e.nombre}<b>+${eur(e.precio)}</b></span>
                </label>`).join('')}
            </div>
          </fieldset>` : ''}

        <div class="ficha__cant">
          <label class="ficha__cant-eti" for="p-cant">Cantidad</label>
          <input type="number" id="p-cant" value="1" min="1" max="10">
        </div>

        <p id="p-error" class="ficha__error" role="alert" hidden></p>

        <button type="button" id="p-add" class="btn btn--ancho">
          ${esMerch ? 'Añadir a la caja' : 'Meterla en la caja'} ·
          <span id="p-total">${eur(p.precio)}</span></button>
      </div>
    </div>`;

  /* Los alérgenos se recalculan de verdad al quitar un ingrediente.
     Dejar "Lácteos" en una pizza a la que le has quitado la mozzarella
     sería dar información falsa sobre alergias, y eso no es un detalle
     de copy: es lo más delicado que hay en una carta. */
  const recalcAlergenos = () => {
    const caja = $('#p-alerg');
    if (!caja) return;
    const fuera = [...v.querySelectorAll('[data-quitable]:checked')]
      .map((i) => (i.dataset.alergeno || '').toLowerCase()).filter(Boolean);
    const quedan = (p.alergenos || '').split(',').map((x) => x.trim()).filter(Boolean)
      .filter((al) => !fuera.includes(al.toLowerCase()));
    caja.innerHTML = '<strong>Alérgenos:</strong> ' + (quedan.join(', ') || '—');
  };

  const recalc = () => {
    recalcAlergenos();
    const extras = [...v.querySelectorAll('.ops:not(.ops--quitar) input[type="checkbox"]:checked')]
      .map((i) => CARTA.extras.find((e) => e.id === i.value)).filter(Boolean);
    const c = Math.max(1, parseInt($('#p-cant').value, 10) || 1);
    $('#p-total').textContent = eur((p.precio + extras.reduce((t, e) => t + e.precio, 0)) * c);
    return { extras, c };
  };
  v.querySelectorAll('.ops input, #p-cant').forEach((i) => i.addEventListener('input', recalc));
  $('#p-volver').addEventListener('click', () => ir('home', S.vueltaCarta));
  $('#p-ant').addEventListener('click', () => saltarProducto(-1));
  $('#p-sig').addEventListener('click', () => saltarProducto(1));

  $('#p-add').addEventListener('click', () => {
    const elegidas = {};
    let falta = null;
    opciones.forEach((o) => {
      const sel = v.querySelector(`[data-opcion="${o.id}"]:checked`);
      if (!sel) falta = o; else elegidas[o.id] = sel.value;
    });
    if (falta) {
      const err = $('#p-error');
      err.textContent = `Elige ${falta.nombre.toLowerCase()} antes de añadirlo.`;
      err.hidden = false;
      return;
    }
    const { extras, c } = recalc();
    const sin = [...v.querySelectorAll('[data-quitable]:checked')].map((i) => {
      const q = (p.quitables || []).find((x) => x.id === i.value);
      return q ? q.nombre : i.value;
    });
    anadir(p, c, extras, elegidas, true, sin);
  });
}

/* ---------- carrito ---------- */

/* EL DESCUENTO QUE SE ANUNCIA TIENE QUE SER ALCANZABLE (13/10/2026,
   de la auditoría de Mery). La caja decía «hasta un 10 % de descuento:
   elige una hora temprana» siempre que hubiera UNA PROMO ENCENDIDA, sin
   mirar si quedaba alguna hora con descuento que el cliente pudiera
   elegir. A las 20:40 de la demo —la hora con la que arranca la web—
   los descuentos acababan a las 20:15 y la primera franja libre eran
   las 21:15: el cartel ofrecía algo que ya no existía.

   Y es el peor sitio donde podía pasar. La tesis del caso es que TODA
   PROMO LLEVA CONDICIÓN; una promo que no se puede cumplir no es una
   condición, es un anzuelo, que es justo lo contrario.

   Ahora se cruzan las dos listas —las franjas que de verdad se pueden
   elegir y las promos que caen dentro de ellas— y se devuelve la mejor
   con SU HORA. Si no hay ninguna, no hay cartel. Decir la hora en vez
   de «una hora temprana» no es solo mejor copy: hace la promesa
   comprobable de un vistazo, también para quien la escribe. */
function descuentoAlcanzable() {
  const c = coste();
  const x = ctx();
  let mejor = null;
  S.franjas.forEach((f) => {
    if (!H.ESTADOS_FRANJA[H.estadoFranja(f, c, x)].seleccionable) return;
    window.Promos.promosDeFranja(f.inicio).forEach((p) => {
      if (!mejor || p.valor > mejor.valor) mejor = { valor: p.valor, franja: f.inicio };
    });
  });
  return mejor;
}

function pintarCarrito() {
  const cont = $('#lista-carrito');
  const pie = $('#carrito-pie');
  cont.innerHTML = '';
  pie.innerHTML = '';

  if (!S.carrito.length) {
    cont.innerHTML = `<div class="caja-vacia">
      <h2 class="caja-vacia__tit">Aquí no hay ni las migas.</h2>
      <p class="caja-vacia__txt">Elige una pizza y solucionamos esto.</p>
      <button type="button" id="c-ver" class="btn btn--primario btn--medio btn--liso">Ver la carta</button></div>`;
    /* A la CARTA, no al principio de la home. El botón dice "ver la carta"
       y te dejaba arriba del todo, con el hero delante y la carta a tres
       pantallas de scroll: la promesa del botón no se cumplía. */
    $('#c-ver').addEventListener('click', () => irALaCarta());
    return;
  }

  if (hayAgotadoEnCarrito()) {
    const malos = S.carrito.filter((i) => S.demo.agotados.includes(i.id) || window.Negocio.estaAgotado(i.id));
    cont.innerHTML += `<div class="caja-alerta">
      <h2 class="caja-alerta__tit">Nos han quitado la última.</h2>
      <p>No te cobramos nada y hemos guardado el resto del pedido.
         Ya no tenemos: ${malos.map((m) => m.nombre).join(', ')}.</p>
      <button type="button" id="c-sust" class="btn btn--primario btn--medio btn--liso">Quitar y elegir sustituta</button></div>`;
  }

  const tabla = document.createElement('div');
  tabla.className = 'caja-items';
  S.carrito.forEach((i) => {
    const extras = i.extras.reduce((t, e) => t + e.precio, 0);
    const fila = document.createElement('div');
    fila.className = 'ci';
    fila.innerHTML = `
      <div class="ci__info">
        <span class="ci__nom">${i.nombre}</span>
        ${Object.keys(i.opciones || {}).length
          ? `<span class="ci__det">${Object.values(i.opciones).join(' · ')}</span>` : ''}
        ${i.extras.length ? `<span class="ci__det">+ ${i.extras.map((e) => e.nombre).join(', ')}</span>` : ''}
        ${(i.sin || []).length ? `<span class="ci__det ci__sin">Sin ${i.sin.map((x) => x.toLowerCase()).join(', sin ')}</span>` : ''}
        <span class="ci__det">${i.tipo === 'merch' ? 'Tienda · no ocupa horno'
          : 'Ocupa ' + uds(H.COSTE_HORNO[i.tipo] * i.cantidad)}</span>
      </div>
      <div class="ci__acc">
        <div class="ci__cant">
          <button type="button" data-menos="${i.uid}" class="btn btn--secundario btn--signo btn--peq">−</button>
          <span class="ci__n">${i.cantidad}</span>
          <button type="button" data-mas="${i.uid}" class="btn btn--secundario btn--signo btn--peq">+</button>
        </div>
        <span class="ci__precio">${eur((i.precio + extras) * i.cantidad)}</span>
        <button type="button" data-quitar="${i.uid}" class="ci__quitar">Quitar</button>
      </div>`;
    tabla.appendChild(fila);
  });
  cont.appendChild(tabla);

  const prim = H.primeraOfrecible(S.franjas, coste(), ctx());
  const q = cuenta();
  const gancho = descuentoAlcanzable();  // ← ver la función, justo encima

  pie.innerHTML = `
    <div class="caja-pie">
      ${q.pendientes.map((x) => `<p class="caja-pie__promo">Te faltan
        <strong>${eur(x.falta)}</strong> para que ${x.promo.etiqueta.toLowerCase()}.</p>`).join('')}
      ${q.regalos.map((r) => `<p class="caja-pie__promo">Va incluido: <strong>${r.nombre}</strong>. Invita la casa.</p>`).join('')}
      ${q.descuento > 0
        ? `<p class="caja-pie__desc">Subtotal: ${eur(q.subtotal)}<br>
             <span class="caja-pie__nota">${q.aplicadas.map((a) => a.nombre).join(' · ')}</span><br>
             Descuento: −${eur(q.descuento)}</p>` : ''}
      ${q.descuento === 0 && gancho && !S.franjaId
        ? `<p class="caja-pie__nota">Hasta un ${gancho.valor} % de descuento:
             elige las <strong>${H.formatoHora(gancho.franja)}</strong> y te lo aplicamos.</p>` : ''}
      <p class="caja-pie__total"><strong>Total: ${eur(q.total)}</strong> — pagas al recoger.</p>
      <p class="caja-pie__nota">${soloTienda()
        ? 'Solo tienda: no hay nada que hornear, así que no ocupas capacidad de cocina.'
        : 'Este pedido ocupa <strong>' + uds(coste()) + '</strong> de horno.'}</p>
      <p class="caja-pie__nota">${soloTienda()
        ? '¿Le metemos una pizza ya que bajas?' : '¿Y para beber? Lo tienes en la carta.'}</p>
      <p class="caja-pie__hora">${prim
        ? `Primera recogida posible: <strong>${H.formatoHora(prim.inicio)}</strong>`
        : 'Ahora mismo no hay ninguna franja que admita este pedido.'}</p>
      <button type="button" id="c-hora" class="btn btn--primario btn--medio btn--liso" ${hayAgotadoEnCarrito() ? 'disabled' : ''}>Elegir hora de recogida</button>
      <!-- Salidas del carrito. Antes no había ninguna: entrabas y el único
           camino era hacia adelante. Seguir comprando es lo normal, así
           que va primero y en secundario; vaciar es destructivo y va
           aparte, en .btn--peligro (SISTEMA-DE-DISENO §06). -->
      <p class="caja-pie__salidas">
        <button type="button" id="c-seguir" class="btn btn--secundario">Seguir comprando</button>
        <button type="button" id="c-vaciar" class="btn btn--peligro">Vaciar la caja</button>
      </p>
    </div>`;

  cont.querySelectorAll('[data-menos]').forEach((b) => b.addEventListener('click', () => cambiarCantidad(b.dataset.menos, -1)));
  cont.querySelectorAll('[data-mas]').forEach((b) => b.addEventListener('click', () => cambiarCantidad(b.dataset.mas, +1)));
  cont.querySelectorAll('[data-quitar]').forEach((b) => b.addEventListener('click', () => quitar(b.dataset.quitar)));
  const sust = $('#c-sust');
  if (sust) sust.addEventListener('click', () => {
    S.carrito = S.carrito.filter((i) => !S.demo.agotados.includes(i.id) && !window.Negocio.estaAgotado(i.id));
    guardar(); ir('home');
  });
  $('#c-hora').addEventListener('click', () => ir('franjas'));
  $('#c-seguir').addEventListener('click', () => ir('home'));

  /* Vaciar pide confirmación: es la única acción de la web que destruye
     trabajo del cliente y no tiene deshacer. Se confirma en el propio
     botón, no en un diálogo del navegador. */
  const vaciar = $('#c-vaciar');
  vaciar.addEventListener('click', () => {
    if (vaciar.dataset.seguro !== '1') {
      vaciar.dataset.seguro = '1';
      vaciar.textContent = '¿Seguro? Vaciar del todo';
      return;
    }
    S.carrito = [];
    S.franjaId = null;
    guardar();
    render();
  });
}

/* ---------- franjas ---------- */

/**
 * En qué nivel está UNA FRANJA concreta. Es la hermana de nivelDelHorno(),
 * pero mira una hora suelta en vez del turno entero.
 *
 * El orden vuelve a importar: los estados que son un HECHO —cerrada, llena,
 * no cabe— mandan sobre el porcentaje. Una franja al 30 % que no admite tu
 * pedido no es "entra cuando quieras": es que no cabes.
 *
 * OJO con 'llama-viva' aquí: no depende solo de la carga. Lo dispara
 * sobre todo el estado 'pocasPlazas', y ese estado se lo come 'noCabe'
 * en cuanto tu pedido ocupa más de un hueco — ver estados-llama.html.
 */
function nivelDeFranja(franja, estado) {
  const N = CONTENIDO.horno;
  if (estado === 'cerrada') return N.apagado;
  if (estado === 'completa' || estado === 'noCabe') return N.noDaMas;

  /* "Pocas plazas" es el nivel más alto que todavía se puede elegir, y
     manda sobre el porcentaje. Sin esta línea las dos escalas iban por
     carriles distintos: `estadoFranja` decía "pocas plazas" mirando las
     unidades que quedan, y el nivel decía "entra cuando quieras" mirando
     el porcentaje de la cuota. Dos avisos contradictorios en el mismo
     chip — y el rojo del semáforo no llegaba a salir nunca. */
  if (estado === 'pocasPlazas') {
    return N.niveles.find((n) => n.id === 'llama-viva') || N.niveles[N.niveles.length - 1];
  }
  const carga = franja.cuota > 0 ? franja.ocupadas / franja.cuota : 0;
  return N.niveles.find((n) => carga < n.hasta) || N.niveles[N.niveles.length - 1];
}

/* El dibujo de la llama y su escala por nivel viven en
   `componentes/llama.js`. Estaban aquí dentro, y por eso el muestrario de
   estados tenía que copiarlos: una copia enseña el componente del día que
   se copió. Aquí se queda lo que sí es de esta pantalla —QUIÉN está en qué
   nivel—, que es lo que hace `nivelDeFranja()` justo arriba. */

function llamaDeFranja(franja, estado) {
  return window.Llama.svg(nivelDeFranja(franja, estado).id, 'fj__svg');
}

function pintarFranjas() {
  const cont = $('#lista-franjas');
  const aviso = $('#aviso-franjas');
  cont.innerHTML = '';
  aviso.innerHTML = '';

  if (S.avisoFranja) {
    aviso.innerHTML = `<div class="caja-alerta">
      <h2 class="caja-alerta__tit">Ese hueco acaba de volar.</h2>
      <p>Tu carrito sigue intacto. ${S.avisoFranja.siguiente
        ? 'La siguiente hora disponible es a las <strong>' + H.formatoHora(S.avisoFranja.siguiente) + '</strong>.'
        : 'Ahora mismo no queda ninguna.'}</p></div>`;
    S.avisoFranja = null;
  }

  const cfg = H.dias()[S.demo.dia];
  if (!cfg) {
    cont.innerHTML = `<div class="fj-cerrado">
      <h2 class="fj-cerrado__tit">El horno está descansando.</h2>
      <p>Hoy no abrimos.</p></div>` + bloqueAgregadores('cerrado', true);
    conectarSalidas(cont);
    return;
  }
  if (S.demo.pausado) {
    cont.innerHTML = `<div class="caja-alerta">
      <h2 class="caja-alerta__tit">El horno necesita un respiro.</h2>
      <p>Hemos pausado temporalmente los pedidos. No se ha realizado ningún cobro.</p></div>`
      + bloqueAgregadores('pausado', true);
    conectarSalidas(cont);
    return;
  }

  const c = coste();

  /* AQUÍ NO VA NINGÚN CARTEL DE PROMO, y es una decisión, no un olvido.
     La promo de hora se dice donde se decide la hora: en la etiqueta del
     propio chip, encima de la hora que la lleva. Un banner encima de la
     lista repite lo que los chips ya dicen y, si las horas con descuento
     ya han pasado, promete algo que no está en ninguna de las opciones.
     La etiqueta del chip no puede mentir: o está sobre una hora que puedes
     elegir, o no está. */
  const caja = document.createElement('div');
  caja.className = 'fj';

  /* La franja que manda mientras no señales ninguna: la primera que te
     sirve. Es la que el hero ya prometía arriba, así que esta pantalla
     empieza confirmando lo que venías leyendo. */
  const porDefecto = H.primeraOfrecible(S.franjas, c, ctx())
    || S.franjas.find((f) => H.estadoFranja(f, c, ctx()) !== 'cerrada')
    || S.franjas[0];

  let algunaLibre = false;
  const chips = [];

  S.franjas.forEach((f) => {
    const est = H.estadoFranja(f, c, ctx());
    if (est === 'cerrada' && f.inicio < S.demo.ahora + H.HORNO.antelacionMinimaMin) return;
    const meta = H.ESTADOS_FRANJA[est];
    if (meta.seleccionable) algunaLibre = true;
    const promo = window.Promos.promosDeFranja(f.inicio)[0];

    /* El chip dice el NIVEL, no el estado. Antes las once franjas libres
       ponían todas "HAY HUECO" mientras sus llamas eran de tamaños
       distintos: el dibujo diferenciaba y la palabra no, así que parecía
       que las llamas iban a su aire. Ahora dicen lo mismo los dos.
       En las bloqueadas manda el estado, que es lo accionable. */
    const nivel = nivelDeFranja(f, est);

    /* Aquí es donde el motor del horno se convierte en datos para el
       componente, y es toda la costura que hay entre los dos. El chip no
       sabe qué hora es ni cuánto ocupa tu pedido: se le dice. Por eso el
       muestrario puede enseñar sus cinco estados sin simular un pedido.

       La regla de que lo bloqueado NO es un botón vive dentro del
       componente, no aquí: es suya. */
    chips.push(ChipHora.crear({
      id: f.inicio,
      hora: H.formatoHora(f.inicio),
      rotulo: meta.seleccionable ? nivel.frase : meta.etiqueta,
      estado: est,
      nivel: nivel.id,
      seleccionable: meta.seleccionable,
      seleccionado: S.franjaId === f.inicio,
      /* La cola va aparte para que el chip pueda soltarla en pantalla
         estrecha sin perder el número. */
      promo: promo ? (promo.etiquetaCorta || promo.etiqueta) : '',
      promoCola: promo ? (promo.etiquetaCola || '') : '',
    }));
  });

  /* Dos casos. Hubo un tercero durante unas horas —el carrito que no
     ocupaba nada— y desapareció al darle coste a bebidas y postres: el
     cero raro se arregló en el modelo, no en la frase. */
  const nota = soloTienda()
    ? 'Tu pedido es solo de tienda: <strong>no ocupa horno</strong>, así que te vale ' +
      'cualquier hora que estemos abiertos.'
    : 'Tu pedido ocupa <strong>' + uds(c) + '</strong>. Un pedido no se parte entre ' +
      'franjas: o cabe entero, o te ofrecemos la siguiente.';

  caja.innerHTML =
    '<div class="fj__horno">' +
      '<div class="fj__llama" id="fj-llama"></div>' +
      '<p class="fj__estado" id="fj-estado"></p>' +
      '<p class="fj__cifra" id="fj-cifra"></p>' +
    '</div>' +
    '<div class="fj__lado">' +
      '<div class="fj__chips">' + chips.join('') + '</div>' +
      '<p class="fj__nota">' + nota + '</p>' +
    '</div>';

  /* Elegir una hora ya NO te empuja al siguiente paso. Antes un solo clic
     seleccionaba y te mandaba de cabeza al formulario: no había manera de
     mirar una hora, pensarlo y cambiar de idea sin volver atrás.
     Ahora el clic solo marca, y confirmar es un gesto aparte. */
  const pie = document.createElement('p');
  pie.className = 'fj__pie';
  caja.appendChild(pie);
  const pintarPie = () => {
    const f = franjaElegida();
    pie.innerHTML = f
      ? '<span class="fj__elegida">Recogida <strong>' + H.ventanaRecogida(f.inicio) +
        '</strong></span>' +
        '<button type="button" id="fj-confirmar" class="btn">Confirmar recogida</button>'
      : '<span class="fj__elegida fj__elegida--vacia">Elige una hora para continuar</span>';
    const b = pie.querySelector('#fj-confirmar');
    if (b) b.addEventListener('click', () => ir('datos'));
  };

  /* La llama grande lee la franja que estés señalando: pasas el dedo por
     las horas y ves el horno de cada una sin abrir nada. Es el gesto del
     prototipo, y es lo que convierte una rejilla de horas en el modelo de
     capacidad hecho interfaz. */
  const pintarHornoDe = (inicio) => {
    const f = S.franjas.find((x) => x.inicio === inicio) || porDefecto;
    if (!f) return;
    const est = H.estadoFranja(f, c, ctx());
    caja.querySelector('#fj-llama').innerHTML = llamaDeFranja(f, est);
    caja.querySelector('#fj-estado').textContent = nivelDeFranja(f, est).frase;
    caja.querySelector('#fj-cifra').textContent = est === 'cerrada'
      ? H.ventanaRecogida(f.inicio) + ' · cerrada'
      /* La palabra va una vez y el verbo concuerda: «queda hueco y medio
         de 3», no «quedan 1,5 de 3 bandejas». */
      : H.ventanaRecogida(f.inicio) + ' · ' + quedan(H.libresDe(f)) + ' de ' + f.cuota;
  };
  /* Al entrar manda la elegida si ya hay una —vienes de "volver atrás" y
     tu hora sigue puesta—, y si no la primera que te sirve. */
  const enReposo = () => {
    const f = franjaElegida() || porDefecto;
    if (f) pintarHornoDe(f.inicio);
  };
  enReposo();
  pintarPie();

  caja.querySelectorAll('[data-mira]').forEach((el) => {
    const mira = () => pintarHornoDe(+el.dataset.mira);
    el.addEventListener('mouseenter', mira);
    el.addEventListener('focus', mira);
  });
  caja.addEventListener('mouseleave', () => {
    /* Al entrar manda la elegida si ya hay una —vienes de "volver atrás" y
     tu hora sigue puesta—, y si no la primera que te sirve. */
  const enReposo = () => {
    const f = franjaElegida() || porDefecto;
    if (f) pintarHornoDe(f.inicio);
  };
  enReposo();
  pintarPie();
  });

  if (!algunaLibre) {
    caja.querySelector('.fj__lado').innerHTML +=
      '<div class="fj-sin-hueco"><p>Ninguna franja admite este pedido. Prueba a quitar ' +
      'algo de la caja o vuelve mañana.</p></div>' + bloqueAgregadores('sin-franjas', true);
  }

  cont.appendChild(caja);
  conectarSalidas(cont);

  cont.querySelectorAll('[data-franja]').forEach((b) =>
    b.addEventListener('click', () => {
      S.franjaId = +b.dataset.franja;
      cont.querySelectorAll('[data-franja]').forEach((o) => {
        const sel = +o.dataset.franja === S.franjaId;
        o.classList.toggle('chip--sel', sel);
        o.setAttribute('aria-pressed', String(sel));
      });
      pintarHornoDe(S.franjaId);
      pintarPie();
    }));
}

/* ---------- datos ---------- */

function pintarDatos() {
  const f = franjaElegida();
  if (!f) { ir('franjas'); return; }
  $('#resumen-datos').innerHTML = `<div class="conf__resumen">
    <p class="conf__ref"><strong>Recogida ${H.ventanaRecogida(f.inicio)}</strong></p>
    <p class="conf__items">${S.carrito.map((i) => i.cantidad + '× ' + i.nombre).join('<br>')}</p>
    ${(() => { const q = cuenta(); return q.descuento > 0
      ? `<p class="conf__nota">Subtotal ${eur(q.subtotal)} · descuento −${eur(q.descuento)}
         (${q.aplicadas.map((a) => a.nombre).join(', ')})</p>` : ''; })()}
    ${cuenta().regalos.map((r) => `<p class="conf__nota">Incluye ${r.nombre}, invita la casa.</p>`).join('')}
    <p class="conf__total"><strong>Total al recoger: ${eur(cuenta().total)}</strong></p>
    <p class="conf__nota">Lavapiés, Madrid · Solo recogida</p></div>`;
  const form = $('#f-datos');
  form.nombre.value = S.cliente.nombre;
  form.telefono.value = S.cliente.telefono;
  form.email.value = S.cliente.email || '';
  form.consiente.checked = !!S.cliente.consiente;
  $('#bloque-email').hidden = !form.consiente.checked;
}

// El correo es el canal de la newsletter, así que solo se pide
// cuando se ha pedido la newsletter. Pedirlo siempre sería
// fricción sin contrapartida en un pedido que se paga en mano.
function alternarEmail() {
  const form = $('#f-datos');
  $('#bloque-email').hidden = !form.consiente.checked;
  if (form.consiente.checked) form.email.focus();
}

const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/* MARCAR Y DESMARCAR UN CAMPO · decisión de Mery del 24/08.
   El aspecto lo dispara `aria-invalid`, no una clase, para que lo que se
   ve y lo que se anuncia no puedan separarse (ver `componentes/campo.css`).
   Por eso marcar y pintar el aviso es UNA sola función: si algún día se
   marca sin decir por qué, o se dice sin marcar, es que alguien no pasó
   por aquí. */
function marcarCampo(campo, mensaje) {
  campo.setAttribute('aria-invalid', 'true');
  const aviso = $('#err-' + campo.name);
  if (aviso) { aviso.textContent = mensaje; aviso.hidden = false; }
}

function limpiarCampo(campo) {
  campo.removeAttribute('aria-invalid');
  const aviso = $('#err-' + campo.name);
  if (aviso) { aviso.textContent = ''; aviso.hidden = true; }
}

function confirmar(ev) {
  ev.preventDefault();
  const form = $('#f-datos');
  const err = $('#error-datos');
  err.hidden = true;
  ['nombre', 'telefono', 'email'].forEach((n) => form[n] && limpiarCampo(form[n]));

  /* Se recogen TODOS los que fallan antes de parar, no el primero. Si
     faltan el nombre y el teléfono, marcar solo el nombre te obliga a
     descubrir el segundo error después de arreglar el primero. */
  const fallan = [];
  if (!form.nombre.value.trim()) {
    fallan.push(form.nombre);
    marcarCampo(form.nombre, 'Nos hace falta un nombre para cantarlo cuando esté lista.');
  }
  if (form.telefono.value.trim().length < 6) {
    fallan.push(form.telefono);
    marcarCampo(form.telefono, 'Faltan dígitos. Necesitamos poder llamarte esta noche.');
  }
  // Si ha pedido la newsletter, hace falta dónde mandarla. Si no,
  // el correo no se pide y no bloquea nada.
  if (form.consiente.checked && !emailValido(form.email.value)) {
    fallan.push(form.email);
    marcarCampo(form.email, 'Este correo no funciona. Si prefieres, desmarca la casilla y '
      + 'seguimos con el pedido.');
  }

  if (fallan.length) {
    /* El resumen se queda —de un vistazo dice cuántos son— pero SIN
       `role="alert"`: quien navega por voz va a oír el aviso del campo
       al llegar el cursor, y anunciar las dos cosas sería decirlo dos
       veces. El que habla es el campo. */
    err.textContent = fallan.length === 1
      ? 'Falta un dato para poder confirmar.'
      : 'Faltan ' + fallan.length + ' datos para poder confirmar.';
    err.hidden = false;
    /* Y el cursor va al primero que falla (decisión de Mery). Antes solo
       se movía en el caso del correo: el aviso salía en pantalla y quien
       no lo veía se quedaba sin saber ni que había error ni dónde. */
    fallan[0].focus();
    return;
  }
  S.cliente = {
    nombre: form.nombre.value.trim(), telefono: form.telefono.value.trim(),
    email: form.consiente.checked ? form.email.value.trim() : '',
    nota: form.nota.value.trim(), consiente: form.consiente.checked,
  };
  guardar();

  if (S.demo.sinConexion) return incidencia('sinConexion');
  if (S.demo.errorTecnico) return incidencia('errorTecnico');

  ir('validando');
  setTimeout(() => {
    const f = franjaElegida();
    if (!f) return ir('franjas');
    if (S.demo.franjaSeLlena) f.ocupadas = f.cuota;   // simula que otro se lo llevó

    const r = H.reservar(f, coste(), ctx());
    if (!r.ok) {
      const sig = H.primeraOfrecible(S.franjas, coste(), ctx());
      S.avisoFranja = { siguiente: sig ? sig.inicio : null };
      S.franjaId = sig ? sig.inicio : null;
      return ir('franjas');
    }
    const q = cuenta();
    S.pedido = {
      ref: 'PDM-' + String(40 + Math.floor(Math.random() * 60)),
      franja: f, items: [...S.carrito], total: q.total,
      subtotal: q.subtotal, descuento: q.descuento,
      promos: q.aplicadas.map((a) => a.nombre), regalos: q.regalos.map((r) => r.nombre),
      coste: coste(), estado: 'confirmado',
    };
    S.carrito = [];
    guardar();
    ir('confirmacion');
  }, 900);
}

/* ---------- confirmación y seguimiento ---------- */

function pintarConfirmacion() {
  const p = S.pedido;
  if (!p) { ir('home'); return; }
  $('#v-confirmacion').innerHTML = `
    <p class="rot-coral">Confirmado</p>
    <h1 class="tit-bloque">Hecho. Tienes hueco<br>a las ${H.formatoHora(p.franja.inicio)}.</h1>
    <p class="conf__sub">Llega entre las ${H.ventanaRecogidaDicha(p.franja.inicio)}
       y te la llevas recién salida.</p>
    <p class="conf__donde">Te esperamos en <strong>${window.GEO.negocio.calle}</strong>,
       ${window.GEO.negocio.barrio}.</p>
    <div class="conf__resumen">
      <p class="conf__ref">Pedido <strong>${p.ref}</strong></p>
      <p class="conf__items">${p.items.map((i) => i.cantidad + '× ' + i.nombre).join('<br>')}</p>
      ${p.regalos.length ? `<p class="conf__items">${p.regalos.join(', ')} — invita la casa.</p>` : ''}
      ${p.descuento > 0 ? `<p class="conf__nota">Subtotal ${eur(p.subtotal)} ·
         ${p.promos.join(', ')} −${eur(p.descuento)}</p>` : ''}
      <p class="conf__total"><strong>Total al recoger: ${eur(p.total)}</strong> — con tarjeta o efectivo en el local.</p>
      <p class="conf__nota">Te avisamos por WhatsApp al ${S.cliente.telefono} en cuanto esté lista.</p>
      ${S.cliente.consiente
        ? `<p class="conf__nota">Y te apuntamos a las novedades en ${S.cliente.email}.</p>` : ''}
    </div>
    <button type="button" id="k-seg" class="btn btn--primario btn--medio btn--liso">Ver el estado de mi pedido</button>`;
  $('#k-seg').addEventListener('click', () => ir('seguimiento'));
}

/* ============================================================
   SEGUIMIENTO · el ticket del horno
   ------------------------------------------------------------
   Rehecha el 23/08/2026 sobre el diseño del canvas del 21 —opción 1b,
   "Ticket de horno y sellos"—, que estaba en Descargas y no en el
   proyecto. El original y la especificación viven ahora en
   `referencias/seguimiento-gamificado/`.

   POR QUÉ UN TICKET Y NO UNA BARRA. El documento lo dejó escrito antes
   de existir esta pantalla: "una pizza no va al 63 %". Los estados son
   cuatro, tienen nombre, y el gesto que los cuenta es el de un taller
   sellando un albarán — que además es literalmente lo que hace Nino en
   el mostrador. El porcentaje que sí hay arriba no mide la pizza: mide
   los cuatro pasos, y por eso nunca marca un número raro.

   LA CARTILLA NO SE DIBUJA. El canvas traía siete casillas de sello que
   se iban rellenando, y se han dejado fuera a propósito (decisión de
   Mery, 23/08): la cartilla es de CARTÓN y se sella en el mostrador, así
   que una rejilla que lleva la cuenta en pantalla insinuaría que la web
   te reconoce — y no hay cuentas de cliente, que es una decisión de
   fondo del proyecto. Lo que queda es lo único honesto que se puede
   decir aquí: acuérdate de traerla. El premio lo dice `promos.js`, no
   este archivo.
   ============================================================ */
function pintarSeguimiento() {
  const p = S.pedido;
  if (!p) { ir('home'); return; }

  /* CUATRO FILAS. `validando` es una pantalla de paso, y `recogida` no es
     una fila más: es lo que CIERRA la última. Que la pizza esté lista en el
     mostrador y que te la hayas llevado son dos momentos, y por eso hacen
     falta dos clics — antes el mismo gesto estampaba los dos sellos y
     parecía que el horno se saltaba. */
  const pasos = H.ESTADOS_PEDIDO.filter((e) => e.id !== 'validando' && e.id !== 'recogida');
  const recogida = p.estado === 'recogida';
  const idx = recogida ? pasos.length - 1 : pasos.findIndex((e) => e.id === p.estado);
  const listo = p.estado === 'listo' || recogida;
  const tarde = H.hayRetraso(p, S.demo.ahora);

  /* El porcentaje va por PASOS, no por reloj. El 0,65 es del canvas y
     hace un trabajo concreto: que el primer estado no marque 0 % —ya has
     hecho algo: has pedido— ni el tercero un 75 % que parecería que falta
     un cuarto exacto. Y al estar lista se fuerza el 100: es el único
     momento en que el número puede ser redondo sin mentir. */
  const frac = recogida ? 1 : (Math.max(0, idx) + 0.65) / pasos.length;

  /* La cuenta atrás sale del modelo, no de un temporizador que corra por
     su cuenta: la hora de la demo la mueve el panel, así que un contador
     de segundos propio se desincronizaría del resto de la página a la
     primera. Aquí se resta y ya. */
  const faltan = p.franja.inicio - S.demo.ahora;
  const debajo = recogida ? 'que aproveche'
               : listo ? 'te espera en el mostrador'
               : faltan > 0 ? 'quedan ' + faltan + ' min'
               : 'es tu hora';

  /* El premio lo pone promos.js. Si el local apaga la cartilla en su
     panel, este bloque desaparece: no se anuncia lo que no está dado. */
  const cartilla = window.Promos.activas().find((x) => x.tipo === 'fidelidad');

  $('#v-seguimiento').innerHTML = `
    <div class="tk">
      <div class="tk__cab">
        <div>
          <span class="tk__rot">Tu pedido</span>
          <h1 class="tk__ref">${recogida ? 'Que<br>aproveche'
            : listo ? 'Tu pizza<br>está lista' : 'Pedido<br>' + p.ref}</h1>
        </div>
        <div class="tk__prog">
          <p class="tk__prog-rot">Progreso</p>
          <p class="tk__prog-n">${Math.round(frac * 100)}%</p>
          <p class="tk__prog-pie">${debajo}</p>
        </div>
      </div>

      ${tarde ? `<div class="caja-alerta">
        <h2 class="caja-alerta__tit">Tu pizza lleva un rato esperándote.</h2>
        <p>Ven cuanto antes para disfrutarla como salió del horno.</p>
        <p class="seg__nota">Interno: <code>Recogida con retraso</code></p></div>` : ''}

      <ol class="tk__pasos">
        ${pasos.map((e, i) => {
          const hecho = i < idx || (i === idx && recogida);
          const activo = i === idx && !recogida;
          /* La última fila enseña SU sello aunque esté en curso, y las demás
             no. No es una excepción caprichosa: "lista para recoger" es un
             estado en el que se ESTÁ, no una tarea que se esté haciendo, así
             que ponerle "en curso" sería mentir sobre la pizza. Lo que
             cambia al recogerla es el color del sello, de coral a tinta. */
          const ultima = i === pasos.length - 1;
          const sello = hecho || (activo && ultima) ? e.sello
                      : activo ? 'En curso' : 'Pendiente';
          const clase = hecho ? 'es-hecho' : activo ? 'es-activo' : 'es-pendiente';
          return `<li class="tk__paso ${clase}">
            <span class="tk__paso-izq">
              <span class="tk__paso-n">${String(i + 1).padStart(2, '0')}</span>
              <span class="tk__paso-txt">${e.etiqueta}</span>
            </span>
            <span class="tk__sello">${sello}</span>
          </li>`;
        }).join('')}
      </ol>

      ${cartilla ? `<div class="tk__cartilla">
        <p class="tk__cartilla-rot">La cartilla del barrio</p>
        <!-- Decía «no olvides traer tu cartilla», que no sirve a quien
             pide por primera vez: le recuerda algo que no tiene. -->
        <p class="tk__cartilla-txt">Trae tu cartilla, o pide una al recoger.
          <strong>${cartilla.etiqueta}.</strong></p>
      </div>` : ''}

      <p class="tk__pie">Recogida ${H.ventanaRecogida(p.franja.inicio)} · ${eur(p.total)}</p>
      ${listo ? `<p class="seg__nota">¿Vas a dejar la mitad para mañana?
        <button type="button" id="k-recal" class="enlace">Te contamos cómo recalentarla</button></p>` : ''}

      <div class="seg__botones">
        <button type="button" id="k-next" class="btn btn--primario btn--medio" ${recogida ? 'disabled' : ''}>
          ${listo ? 'Marcar recogida (demo)' : 'Avanzar estado (demo)'}</button>
        <button type="button" id="k-fin" class="btn btn--secundario btn--medio">Empezar otro pedido</button>
      </div>
    </div>`;

  const next = $('#k-next');
  if (next) next.addEventListener('click', () => {
    const i = H.ESTADOS_PEDIDO.findIndex((e) => e.id === p.estado);
    if (i < H.ESTADOS_PEDIDO.length - 1) p.estado = H.ESTADOS_PEDIDO[i + 1].id;
    render();
  });
  $('#k-fin').addEventListener('click', () => { S.pedido = null; S.franjaId = null; ir('home'); });
  const recal = $('#k-recal');
  if (recal) recal.addEventListener('click', () => {
    S.vista = 'home'; render();
    document.getElementById('recalentar').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---------- incidencias ---------- */

function pintarIncidencia() {
  const textos = {
    errorTecnico: {
      t: 'Esto se ha quedado más crudo de la cuenta.',
      p: 'No sabemos si el pedido ha llegado. No lo repitas todavía: llámanos y lo comprobamos.',
      b: 'Llamar al local',
    },
    sinConexion: {
      t: 'Te has quedado sin cobertura.',
      p: 'Tu carrito sigue aquí. Volveremos a intentarlo cuando regreses.',
      b: 'Volver a la caja',
    },
  }[S.incidencia] || { t: 'Algo ha pasado', p: '', b: 'Volver' };

  $('#v-incidencia').innerHTML = `<div class="incidencia">
    <h1 class="incidencia__tit">${textos.t}</h1><p class="incidencia__txt">${textos.p}</p>
    <button type="button" id="i-volver" class="btn btn--primario btn--medio btn--liso">${textos.b}</button></div>`;
  $('#i-volver').addEventListener('click', () => ir('carrito'));
}

/* ============================================================
   PANEL DE DEMO
   ============================================================ */

function pintarDemo() {
  const libres = S.franjas.filter((f) => H.ESTADOS_FRANJA[H.estadoFranja(f, coste(), ctx())].seleccionable).length;
  window.Demo.decirEstado($('#demo-caja'),
    `Franjas generadas: ${S.franjas.length} · ofrecibles ahora: ${libres} · `
    + `carrito: ${uds(coste())} · agotados: ${S.demo.agotados.length}`);
}

/* LOS MANDOS DEL MUNDO LOS PINTA `demo.js`, que es el mismo módulo que
   usa el panel del local: día, hora, semilla y pausa se llaman igual, se
   ven igual y COMPARTEN ESTADO. Aquí solo quedan los interruptores que
   no existen en la cocina. */
const EXTRA_DEMO = `
  <div class="demo__extra">
    <p class="demo__extra-tit">Solo en la web del cliente</p>
    <label>Titular del hero (alternativas de §6)
      <select id="d-hero"></select>
    </label>
    <div class="demo__botones">
      <button id="d-agotar" type="button">Agotar un producto del carrito</button>
      <!-- Un escenario preparado, y por eso vive AQUÍ y no en el producto:
           este panel se declara a sí mismo fuera del producto en su propio
           título. Forzar en la web de verdad que siempre haya una franja
           "casi llena" para que se luzcan los cinco niveles sería convertir
           el indicador en un adorno — que es justo lo que §04 prohíbe. Un
           escenario reproducible no miente: dice que es un escenario. -->
      <button id="d-escenario" type="button"
        title="Finde, semilla 50, 18:30, con una pizza. Enseña los 4 niveles del horno y los 2 escalones de descuento. El quinto nivel, «apagado», se ve con Pausar local.">Escenario: los 4 niveles y las 2 promos</button>
    </div>
    <div class="demo__botones">
      <label class="chk"><input type="checkbox" id="d-error"> Forzar error técnico</label>
      <label class="chk"><input type="checkbox" id="d-offline"> Forzar sin conexión</label>
      <label class="chk"><input type="checkbox" id="d-vuela"> La franja se llena al confirmar</label>
    </div>
  </div>`;

function conectarDemo() {
  window.Demo.montar($('#demo-caja'), {
    extra: EXTRA_DEMO,
    // Reiniciar la demo también vacía la caja: el carrito es de esta
    // pantalla, así que lo borra esta pantalla.
    alReiniciar: () => { try { localStorage.removeItem('pdm'); } catch (e) { /* da igual */ } },
    alPintar: (d) => {
      const cambiaElReparto = d.dia !== S.demo.dia || d.semilla !== S.demo.semilla;
      S.demo.dia = d.dia; S.demo.ahora = d.ahora;
      S.demo.semilla = d.semilla; S.demo.pausado = d.pausado;
      if (cambiaElReparto) regenerar();
      render();
    },
  });
  $('#d-error').addEventListener('change', (e) => { S.demo.errorTecnico = e.target.checked; });
  $('#d-offline').addEventListener('change', (e) => { S.demo.sinConexion = e.target.checked; });
  $('#d-vuela').addEventListener('change', (e) => { S.demo.franjaSeLlena = e.target.checked; });
  $('#d-agotar').addEventListener('click', () => {
    const cand = S.carrito.find((i) => !S.demo.agotados.includes(i.id));
    if (cand) { S.demo.agotados.push(cand.id); ir('carrito'); }
    else alert('Mete algo en la caja primero.');
  });

  /* ESCENARIO DE LOS CUATRO NIVELES DEL SELECTOR.

     CUATRO y no cinco, y la diferencia importa: `apagado` no puede salir
     nunca en un chip. Con el local cerrado o en pausa esta vista no pinta
     chips —enseña un aviso y punto—, así que ese nivel solo se ve en la
     llama del hero, y se llega a él con "Pausar local", que está aquí al
     lado. Prometer cinco en un botón que da cuatro sería empezar mintiendo
     dentro del propio panel de demo.
     Día, semilla y hora BARRIDOS, no elegidos a ojo: se recorrieron
     3 días × 200 semillas buscando el reparto más equilibrado que además
     enseñe LOS DOS ESCALONES de la promo del valle. Finde con semilla 50
     a las 18:30 da tres o cuatro franjas de cada nivel y cinco chips con
     etiqueta de descuento, repartidos entre el 10 % y el 5 %.

     La HORA importa más de lo que parece: con la antelación mínima de 25
     minutos, arrancando a las 19:15 la primera hora elegible ya son las
     19:45 y la ventana del 10 % ha pasado entera. A las 18:30 entran las
     dos.

     Con UNA pizza, que es 1 hueco: el nivel que se ve depende del
     tamaño del pedido, así que el escenario tiene que fijarlo también.
     Si no, el botón enseñaría una cosa distinta según lo que llevaras. */
  $('#d-escenario').addEventListener('click', () => {
    // Pasa por `Demo.fijar`, que repinta los mandos y avisa a la pantalla:
    // si se tocara S.demo a mano, los controles enseñarían otra cosa.
    window.Demo.fijar({ dia: 'viernes', semilla: 50, ahora: 18 * 60 + 30, pausado: false });

    const pizza = productoPorId('margarita');
    S.carrito = [];
    S.franjaId = null;
    if (pizza) anadir(pizza, 1, [], {}, false);
    regenerar();
    ir('franjas');
  });
  document.querySelectorAll('[data-ir]').forEach((b) =>
    b.addEventListener('click', (e) => { e.preventDefault(); ir(b.dataset.ir); }));

  /* Vueltas atrás del proceso de compra. Están en el marcado fijo, no
     en las vistas que se repintan, así que se cablean una sola vez. */
  $('#fj-volver').addEventListener('click', () => ir('carrito'));
  $('#dt-volver').addEventListener('click', () => ir('franjas'));
  /* Seguir comprando desde el último paso. La hora elegida NO se pierde: se
     queda en S.franjaId y el formulario la recupera al volver. Lo único que
     puede pasar es que al añadir más el pedido ya no quepa en esa franja, y
     de eso avisa el propio selector cuando vuelvas a pasar por él. */
  $('#dt-seguir').addEventListener('click', () => irALaCarta());

  /* ---------- EL MENÚ DE MÓVIL ----------
     Se pliega por debajo de 760 y se abre a pantalla completa. Tres cosas
     que no son adorno y por las que un menú plegable suele salir mal:

       1. CERRADO ES `hidden`, no solo invisible. Un menú tapado por el que
          se puede tabular manda el foco a sitios que no se ven.
       2. EL FOCO VA Y VUELVE. Al abrir entra en el menú; al cerrar vuelve
          a la hamburguesa. Sin eso, quien navega con teclado cierra el
          menú y aparece al principio de la página.
       3. ESCAPE CIERRA. Es lo que hace todo el mundo sin pensarlo.

     Y en escritorio el menú no se esconde nunca: si la ventana crece con
     el menú abierto, se destapa solo. */
  const ham = $('#ham'), navCab = $('#menu-movil'), esMovil = window.matchMedia('(max-width: 760px)');

  function menuMovil(abrir) {
    if (!ham || !navCab) return;
    navCab.hidden = !abrir;
    ham.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    document.body.classList.toggle('cab--abierto', abrir);
    if (abrir) { const p = navCab.querySelector('.cab__link'); if (p) p.focus(); }
    else if (document.activeElement === document.body || navCab.contains(document.activeElement)) ham.focus();
  }

  /* Al cambiar de tamaño: en escritorio el menú se destapa siempre; al
     entrar en móvil se pliega, salvo que ya estuviera abierto. */
  function ajustarMenu() {
    if (!navCab) return;
    if (!esMovil.matches) {
      navCab.hidden = false;
      document.body.classList.remove('cab--abierto');
      if (ham) ham.setAttribute('aria-expanded', 'false');
    } else if (ham.getAttribute('aria-expanded') !== 'true') {
      navCab.hidden = true;
    }
  }
  esMovil.addEventListener('change', ajustarMenu);
  ajustarMenu();

  if (ham) ham.addEventListener('click', () =>
    menuMovil(ham.getAttribute('aria-expanded') !== 'true'));
  if ($('#ham-x')) $('#ham-x').addEventListener('click', () => menuMovil(false));
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && ham && ham.getAttribute('aria-expanded') === 'true') menuMovil(false);
  });

  // Navegación por anclas dentro del scroll de home: si estamos en
  // cualquier otra vista, primero se vuelve a home y luego se baja.
  document.querySelectorAll('[data-ancla]').forEach((b) =>
    b.addEventListener('click', () => {
      const destino = b.dataset.ancla;
      /* Elegir del menú lo cierra. Si no, te quedas mirando el menú
         mientras la página se desplaza por detrás sin que la veas. */
      if (esMovil.matches) menuMovil(false);
      if (S.vista !== 'home') { S.vista = 'home'; render(); }
      const el = document.getElementById(destino);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));

  // Selector de titulares: sirve para comparar las alternativas de §6
  // en pantalla en vez de sobre el papel.
  const sel = $('#d-hero');
  sel.innerHTML = CONTENIDO.heroes.map((h, i) =>
    `<option value="${i}">${h.titular.replace(/<br>/g, ' ')}${h.recomendado ? ' ★' : ''}</option>`).join('');
  sel.addEventListener('change', (e) => { S.heroIdx = +e.target.value; render(); });

  FilaProducto.usa({ eur });
  $('#f-datos').addEventListener('submit', confirmar);
  /* En cuanto tocas un campo marcado, la marca se va. Dejarla puesta
     mientras lo estás arreglando es discutirle a alguien algo que ya
     está corrigiendo. */
  $('#f-datos').addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) limpiarCampo(e.target);
  });
  $('#f-datos').consiente.addEventListener('change', alternarEmail);
}

/* ---------- arranque ---------- */

cargar();
regenerar();
conectarDemo();
render();

})();
