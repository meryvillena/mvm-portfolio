/* ============================================================
   PUTI DI MADRE — Panel del turno (MVP)
   ------------------------------------------------------------
   La otra mitad del sistema. La web del cliente promete cosas
   ("el equipo puede pausar", "la cuota web es del 50 % en punta")
   que hasta ahora no vivían en ninguna parte. Viven aquí.

   Reutiliza horno.js SIN TOCARLO: mismas unidades, mismas cuotas,
   mismos estados. Si mañana el horno da para 7 en vez de 6, se
   cambia en un sitio y cambian la web y el panel a la vez.

   Nota de diseño (para la fase visual, no aplicada aquí):
   esto no lleva la marca. Lo lee alguien con harina en las manos,
   de reojo, a metro y medio, un viernes a las nueve y media.
   Denso, alto contraste, botones grandes. La serif monumental de
   "Roma después de medianoche" aquí sería un estorbo.
   ============================================================ */

/* Encapsulado: al ser scripts planos, sin esto los nombres internos
   (guardar, render, mulberry32…) chocan entre archivos. */
(function () {
'use strict';
const H = window.Horno;
const $ = (s) => document.querySelector(s);
const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
/* EN EL PANEL SE CUENTA EN UNIDADES, y es correcto: aquí sí hay una
   contabilidad y quien la lee es quien la lleva. La web del cliente
   dice «huecos» y lo escribe con palabras (ver `uds()` en app.js); son
   dos interfaces distintas a propósito, como las dos hojas de estilo. */
const uds = (n) => (n % 1 === 0 ? n : n.toFixed(1).replace('.', ','));
/* Y concordando, que «1 libres» canta. */
const libre = (n) => uds(n) + (n === 1 ? ' libre' : ' libres');

const TELEFONO_LOCAL = '34600123123';

const P = {
  /* El mundo simulado sale de `demo.js`, que es el mismo estado que usa
     la web del cliente: saltar de una pantalla a la otra no reinicia el
     escenario ni adelanta el reloj. Su punto de partida es `Horno.DEMO`,
     donde está explicado por qué esa hora y no otra. */
  ...window.Demo.estado(),
  agotados: [],
  franjas: [],
  pedidos: [],
  cuotas: null,   // copia editable de H.HORNO.cuotaWeb
  avisoPromo: null,   // por qué no se ha podido mover o encender un descuento
  avisoHorario: null, // por qué no se ha podido cambiar una hora
  cartaAbierta: {},   // qué categorías de la carta están desplegadas
  entregadosAbierto: false,  // si la lista de entregados está desplegada
};

/* ---------- PRNG con semilla (mismo criterio que horno.js) ---------- */

function mulberry32(semilla) {
  let a = semilla >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- pedidos simulados del turno ---------- */

const NOMBRES = ['Marta', 'Kike', 'Nuria', 'Dani', 'Bea', 'Álvaro', 'Sofía',
                 'Iván', 'Lucía', 'Omar', 'Paula', 'Hugo', 'Elena', 'Samir'];

/* Solo lo que pasa por el horno: es lo que define un pedido. Bebidas y
   postres se añaden después, como acompañamiento.

   El filtro era `COSTE_HORNO[tipo] > 0` y dejó de significar eso: esa
   tabla mide trabajo, no cocción, y desde que una bebida cuesta 0,25 el
   catálogo admitía pedidos de solo postre o solo refresco. Ahora
   pregunta lo que de verdad quiere saber. */
function productosDeHorno() {
  return CARTA.categorias.flatMap((c) => c.productos)
    .filter((p) => H.PASA_POR_HORNO.includes(p.tipo));
}

function generarPedidos() {
  const rnd = mulberry32(P.semilla * 31);
  const catalogo = productosDeHorno();
  const pedidos = [];
  let n = 40;

  P.franjas.forEach((f) => {
    // Cada unidad ocupada de la franja viene de un pedido real.
    let restante = f.ocupadas;
    let intentos = 0;
    while (restante > 0 && intentos++ < 8) {
      const items = [];
      let coste = 0;
      const cuantas = restante >= 2 ? (rnd() < 0.45 ? 2 : 1) : 1;
      for (let i = 0; i < cuantas; i++) {
        const p = catalogo[Math.floor(rnd() * catalogo.length)];
        const c = H.COSTE_HORNO[p.tipo];
        if (coste + c > restante) continue;
        items.push({ nombre: p.nombre, tipo: p.tipo, cantidad: 1, precio: p.precio });
        coste += c;
      }
      // Un pedido sin nada que hornear no es un pedido de pizzería:
      // si en esta franja ya no cabe ni el producto más pequeño, se corta.
      if (!items.length || coste === 0) break;
      // una bebida de propina en la mitad de los pedidos
      if (rnd() < 0.5) {
        const b = CARTA.categorias.find((c) => c.id === 'bebidas').productos;
        const beb = b[Math.floor(rnd() * b.length)];
        items.push({ nombre: beb.nombre, tipo: 'bebida', cantidad: 1, precio: beb.precio });
      }
      /* Agrupar va DESPUÉS de la bebida de propina, no antes. Cuando las
         bebidas pasaron a ocupar 0,25 (21/08) entraron en el catálogo
         principal —que filtra por coste > 0—, así que un refresco podía
         salir sorteado arriba y volver a caer aquí de propina: dos líneas
         del mismo producto en el mismo pedido. Agrupando al final, el
         refresco repetido sale como una línea con cantidad 2, que es lo
         que el pizzero necesita leer de un vistazo. */
      const agrupados = [];
      items.forEach((it) => {
        const ya = agrupados.find((x) => x.nombre === it.nombre);
        if (ya) ya.cantidad += it.cantidad; else agrupados.push({ ...it });
      });
      items.length = 0; items.push(...agrupados);
      restante -= coste;
      pedidos.push({
        ref: 'PDM-0' + (n++),
        nombre: NOMBRES[Math.floor(rnd() * NOMBRES.length)],
        telefono: '6' + String(Math.floor(rnd() * 90000000) + 10000000),
        items, coste,
        total: items.reduce((t, i) => t + i.precio * i.cantidad, 0),
        franja: f.inicio,
        estado: null,   // se calcula abajo según la hora simulada
      });
    }
  });
  return pedidos;
}

/* El estado por defecto se deduce de la hora: los de franjas pasadas
   están entregados, el de la franja en curso está en el horno, etc.
   Así el tablero siempre se abre en una situación creíble. */
function estadoPorDefecto(pedido) {
  const falta = pedido.franja - P.ahora;
  if (falta <= -H.HORNO.granularidadMin) return 'entregado';
  if (falta <= 0) return 'listo';
  if (falta <= H.HORNO.minutosDePedido) return 'preparando';
  return 'confirmado';
}

/* Colocar un pedido es decir dos cosas, no una: en qué estado está y,
   si se está preparando, a qué hora se empezó. Sin lo segundo el
   tablero no sabe cuándo estará, y "preparando" vuelve a ser un botón. */
function recolocar(pedido) {
  pedido.estado = estadoPorDefecto(pedido);
  pedido.desde = pedido.estado === 'preparando'
    ? pedido.franja - H.HORNO.minutosDePedido : null;
  return pedido;
}

/* UN PEDIDO ES ENTERO Y TARDA LO QUE TARDA (12/10/2026, de dos cosas
   seguidas que vio Mery).

   Primero: el tablero tenía cuatro botones en fila y los cuatro hacían
   lo mismo, pasar al siguiente. Metías la pizza al horno y con el clic
   siguiente —el mismo segundo— estaba lista. Un horno al que hay que
   preguntarle si ha terminado no es un horno, es una lista de tareas.

   Y después, lo que de verdad lo arregla: «un pedido es entero, es la
   pizza, es el vino, es el refresco». Había DOS columnas de cocina
   —masa y horno— para una cosa que el pizzero vive como una sola:
   esto lo estoy preparando. El horno es asunto suyo, no un estado del
   pedido. Las dos se juntan en EN PREPARACIÓN, que dura lo que dura:
   lo que cuece la pizza más lo que cuesta montar el pedido.

   El reparto queda como en la cocina: el pizzero manda en cuándo
   empieza y el tiempo manda en cuándo está. Lo único que le queda
   encima es decir que ya está antes de hora, porque a veces ya está.

   Corre con el reloj de la barra de arriba. No hay un segundo reloj
   escondido: mueve la hora y los pedidos se terminan solos.

   (La web del cliente SÍ sigue enseñando «manos a la masa» y «en el
   horno», y no es una incoherencia: el cliente quiere mirar y el
   pizzero quiere trabajar. A uno le entretiene ver la cocina por
   dentro; al otro, lo que le sirve es que no le pidan contarla.) */
function madurar() {
  P.pedidos.forEach((p) => {
    if (p.estado === 'preparando' && p.desde != null
        && P.ahora >= p.desde + H.HORNO.minutosDePedido) p.estado = 'listo';
  });
}

// Cuánto futuro se enseña en la columna de nuevos. Más allá de esto,
// el pedido existe pero no estorba: se cuenta aparte. Un pizzero a las
// nueve y cuarto no necesita ver el pedido de medianoche.
const HORIZONTE_MIN = 45;

const COLUMNAS = [
  { id: 'nuevos', titulo: 'Nuevos', estados: ['confirmado'] },
  { id: 'preparacion', titulo: 'En preparación', estados: ['preparando'] },
  { id: 'listos', titulo: 'Listos para recoger', estados: ['listo'] },
];

const SIGUIENTE = { confirmado: 'preparando', preparando: 'listo', listo: 'entregado' };

/* EL BOTÓN NOMBRA LO QUE HACES, NO EL ESTADO AL QUE VA, y esto se
   arregló el 12/10/2026. Tres etiquetas eran acciones —«Empezar», «Al
   horno», «Ya está lista»— y la cuarta era un estado: «Entregado». Al
   lado de «Avisar por WhatsApp» parecía que se contradecían: si pone
   entregado, ¿a quién aviso? No se contradecían; lo que fallaba es que
   una de las cuatro no se leía como un botón. */
const ETIQUETA = { confirmado: 'Empezar', preparando: 'Ya está lista',
                   listo: 'Se la ha llevado' };

/* Los estados cuyo botón NO es la acción principal de la tarjeta. Hoy
   solo el de preparación: ahí el botón es la excepción —decir que ya
   está antes de hora—, no lo que toca. Lo que toca es esperar. */
const SECUNDARIO = ['preparando'];
const DESHACER = { preparando: 'confirmado', listo: 'preparando', entregado: 'listo' };

/* ---------- cuota editable ---------- */

function cuotaDe(minuto) {
  const t = P.cuotas.find((x) => minuto >= x.desde && minuto < x.hasta);
  return t ? t.unidades : 0;
}

function regenerar() {
  if (!P.cuotas) P.cuotas = H.HORNO.cuotaWeb.map((t) => ({ ...t }));
  P.franjas = H.generarFranjas(P.dia, P.semilla).map((f) => ({ ...f, cuota: cuotaDe(f.inicio) }));
  // la ocupación sembrada no puede superar una cuota que se haya bajado
  P.franjas.forEach((f) => { f.ocupadas = Math.min(f.ocupadas, f.cuota); });
  P.pedidos = generarPedidos().map((p) => recolocar({ ...p }));
}

/* ============================================================
   RENDER
   ============================================================ */

function render() {
  madurar();
  pintarPreparacion();
  pintarEstado();
  pintarCarga();
  pintarTablero();
  pintarControles();
  pintarCuotas();
  pintarHorario();
  pintarCarta();
  pintarPromos();
  pintarCanal();
  /* La línea de abajo del panel de demo la escribe cada pantalla: la
     web cuenta franjas ofrecibles y aquí se cuentan pedidos. */
  window.Demo.decirEstado($('#demo-caja'),
    `${P.pedidos.length} pedidos simulados · semilla ${P.semilla} · `
    + `${P.franjas.length} franjas. Mismo día y misma semilla, mismo turno.`);
}

/* La nota del tablero dice los minutos, pero no los escribe: los lee
   del motor. Si mañana el local cambia de horno, cambia sola. */
function pintarPreparacion() {
  const { minutosDeHorno: h, minutosDeMontaje: m, minutosDePedido: t } = H.HORNO;
  $('#p-prep').textContent = `${t} minutos (${h} de horno + ${m} de montarlo)`;
}

function pintarEstado() {
  const enMarcha = P.pedidos.filter((p) => p.estado === 'preparando').length;
  const listos = P.pedidos.filter((p) => p.estado === 'listo').length;
  $('#p-estado').textContent = (P.pausado ? 'PEDIDOS EN PAUSA · ' : 'EN SERVICIO · ')
    + H.formatoHora(P.ahora) + ' · ' + enMarcha + ' en preparación · '
    + listos + ' esperando recogida';
}

/* 1 · El horno ahora: la franja en curso y las tres siguientes. */
function pintarCarga() {
  const proximas = P.franjas
    .filter((f) => f.inicio >= P.ahora - H.HORNO.granularidadMin)
    .slice(0, 5);

  $('#p-carga').innerHTML = proximas.length ? proximas.map((f) => {
    const libres = H.libresDe(f);
    const pct = Math.round((f.ocupadas / f.cuota) * 100);
    // La franja en curso es aquella cuya ventana de recogida contiene la hora actual.
    const enCurso = f.inicio > P.ahora - H.HORNO.granularidadMin && f.inicio <= P.ahora;
    return `<div class="fila fila--franja${enCurso ? ' fila--sel' : ''}">
      <div><strong>${H.formatoHora(f.inicio)}</strong>${enCurso ? ' <span class="tag">en curso</span>' : ''}
        <div class="nota">${uds(f.ocupadas)} de ${f.cuota} reservadas por web · ${libre(libres)}</div></div>
      <div class="fila__acc"><span class="barra" style="--pct:${pct}%"></span>
        <span class="badge">${pct}%</span></div>
    </div>`;
  }).join('') : '<p class="nota">No quedan franjas por delante esta noche.</p>';
}

/* 2 · Tablero */
function pintarTablero() {
  $('#p-tablero').innerHTML = COLUMNAS.map((col) => {
    let dentro = P.pedidos
      .filter((p) => col.estados.includes(p.estado))
      .sort((a, b) => a.franja - b.franja);

    let masTarde = 0;
    if (col.id === 'nuevos') {
      const limite = P.ahora + HORIZONTE_MIN;
      masTarde = dentro.filter((p) => p.franja > limite).length;
      dentro = dentro.filter((p) => p.franja <= limite);
    }

    return `<div class="columna">
      <h3>${col.titulo} <span class="badge">${dentro.length}</span></h3>
      ${dentro.length ? dentro.map((p) => tarjetaPedido(p)).join('')
                      : '<p class="nota">Vacío.</p>'}
      ${masTarde ? `<p class="nota">Y ${masTarde} ${masTarde === 1 ? 'pedido' : 'pedidos'}
         más adelante esta noche. Aparecen ${HORIZONTE_MIN} minutos antes de su hora.</p>` : ''}
    </div>`;
  }).join('') + bloqueEntregados();

  /* QUE NO SE CIERRE EN LA CARA (12/10/2026, lo vio Mery). Cada clic
     repinta el tablero entero, y un `<details>` recién pintado nace
     cerrado: deshacer una entrega plegaba la lista de golpe, el panel
     se acortaba diecisiete filas y la pantalla acababa en otro sitio.
     Se leía como «me lleva arriba del todo».

     Mismo fallo que tenían las categorías de la carta y mismo arreglo:
     el panel se acuerda de lo que está abierto. Si aparece un tercer
     desplegable, esto se repite —y entonces tocará sacarlo a una
     función en vez de copiarlo una tercera vez. */
  const lista = document.querySelector('.entregados');
  if (lista) lista.addEventListener('toggle', () => { P.entregadosAbierto = lista.open; });

  document.querySelectorAll('[data-avanzar]').forEach((b) =>
    b.addEventListener('click', () => mover(b.dataset.avanzar, SIGUIENTE)));
  document.querySelectorAll('[data-deshacer]').forEach((b) =>
    b.addEventListener('click', () => mover(b.dataset.deshacer, DESHACER)));
}

/* Un solo sitio donde un pedido cambia de estado a mano, porque las dos
   direcciones tienen que hacer lo mismo con el reloj del horno: al
   entrar se sella la hora, y al volver atrás se sella otra vez. Sin
   esto, deshacer «ya está lista» la devolvería a una preparación que
   ya cumplió su tiempo y `madurar()` la terminaría en el mismo render:
   el botón no haría nada visible. */
function mover(ref, mapa) {
  const p = P.pedidos.find((x) => x.ref === ref);
  if (p) {
    p.estado = mapa[p.estado] || p.estado;
    if (p.estado === 'preparando') p.desde = P.ahora;
    p.aMano = true;
  }
  render();
}

/* LOS ENTREGADOS NO SE EVAPORAN (12/10/2026). Al marcar «se la ha
   llevado» la tarjeta desaparecía del tablero y no había forma de
   comprobar si aquel pedido salió ni de deshacer un clic equivocado,
   que en una barra llena pasa.

   Van en un desplegable CERRADO: durante el turno lo que importa son
   las tres columnas, y una lista de treinta pedidos cumplidos las
   taparía. Está ahí para cuando hace falta, no delante todo el rato.

   Y el botón se llama «Pedido no recogido» desde el 12/10/2026. Pasó
   por dos nombres hasta dar con el bueno:

     «No se la ha llevado»  → un hecho suelto, y encima uno que
                              contradecía el título de la lista.
     «Devolver a listos»    → nombra la acción, sí, pero con MI palabra:
                              «listos» es el nombre de una columna de
                              esta pantalla, no algo que exista en la
                              tienda.
     «Pedido no recogido»   → el de Mery, y es el que gana.

   Esta lista es un REGISTRO, y en un registro no se dan órdenes: se
   corrige lo que quedó mal apuntado. El pizzero no piensa «devuélvelo
   a listos», piensa «este no lo recogieron». El botón dice eso, y el
   pedido vuelve donde estaba. */
function bloqueEntregados() {
  const hechos = P.pedidos.filter((p) => p.estado === 'entregado')
    .sort((a, b) => b.franja - a.franja);
  if (!hechos.length) return '';
  return `<details class="entregados"${P.entregadosAbierto ? ' open' : ''}>
    <summary>Entregados esta noche <span class="badge">${hechos.length}</span></summary>
    <div class="entregados__lista">
    ${hechos.map((p) => `<div class="fila">
      <div><strong>${H.formatoHora(p.franja)}</strong>
        <span class="nota">${p.ref} · ${p.nombre} · ${eur(p.total)}</span></div>
      <div class="fila__acc">
        <button type="button" data-deshacer="${p.ref}">Pedido no recogido</button></div>
    </div>`).join('')}
    </div>
  </details>`;
}

function tarjetaPedido(p) {
  const tarde = p.estado === 'listo' && P.ahora > p.franja + H.HORNO.umbralRetrasoMin;
  // A qué hora estará el que se está preparando, y cuánto le queda.
  const lista = p.estado === 'preparando' && p.desde != null
    ? p.desde + H.HORNO.minutosDePedido : null;
  const quedan = lista === null ? 0 : Math.max(0, lista - P.ahora);
  const texto = encodeURIComponent(
    `Hola ${p.nombre}, tu pedido ${p.ref} ya está listo. Te esperamos. — Puti Di Madre`);
  return `<div class="pedido${tarde ? ' pedido--tarde' : ''}">
    <div class="pedido__cab">
      <strong>${H.formatoHora(p.franja)}</strong>
      <span class="nota">${p.ref} · ${p.nombre}</span>
    </div>
    <ul class="pedido__items">
      ${p.items.map((i) => `<li>${i.cantidad}× ${i.nombre}</li>`).join('')}
    </ul>
    <div class="nota">${uds(p.coste)} ud. de horno · ${eur(p.total)} a cobrar</div>
    ${lista !== null ? `<div class="pedido__prep">En preparación.
       Estará <strong>a las ${H.formatoHora(lista)}</strong>${quedan
         ? ` · le quedan ${quedan} ${quedan === 1 ? 'minuto' : 'minutos'}`
         : ' · ya mismo'}.</div>` : ''}
    ${tarde ? '<div class="nota"><strong>Lleva esperando. Avísale otra vez.</strong></div>' : ''}
    <div class="fila__acc">
      ${p.estado === 'listo'
        /* Primero avisar y después entregar, en ese orden: cuando una
           pizza entra en esta columna lo que toca es llamar al cliente;
           llevársela pasa cinco minutos después, cuando aparece. El
           botón de avisar iba el segundo y se leía como alternativa. */
        ? `<a href="https://wa.me/${TELEFONO_LOCAL}?text=${texto}" target="_blank"
             rel="noopener"><button type="button">Avisar por WhatsApp</button></a>` : ''}
      <button type="button" data-avanzar="${p.ref}"${SECUNDARIO.includes(p.estado)
        ? ' class="pedido__sec"' : ''}>${ETIQUETA[p.estado]}</button>
    </div>
  </div>`;
}

/* 3 · Controles */
function pintarControles() {
  const enCarta = window.Negocio.cartaVigente().categorias.flatMap((c) => c.productos);
  $('#p-controles').innerHTML = `
    <div class="bloque">
      <p><button type="button" id="c-pausa">${P.pausado
        ? 'Reanudar los pedidos web' : 'Pausar los pedidos web'}</button>
        <span class="nota">${P.pausado
          ? 'La web no ofrece franjas nuevas. Los pedidos ya confirmados siguen en pie.'
          : 'Úsalo si falla un ingrediente, se rompe algo o entra una avalancha por la puerta.'}</span></p>
    </div>
    <div class="bloque">
      <h3>Marcar agotado</h3>
      <div class="agotados">
        ${enCarta.map((p) => `<button type="button" data-agotar="${p.id}"
          class="${p.agotado ? 'is-off' : ''}">${p.nombre}${
          p.agotado ? ' · agotado' : ''}</button>`).join('')}
      </div>
      <p class="nota">No desaparece de la web: se queda en la carta con el sello
        AGOTADA y sin botón de añadir. Se reactiva volviendo a tocarlo.</p>
    </div>`;

  /* LA PAUSA ES UNA SOLA. Este botón es producto —el local corta los
     pedidos web— y en la web del cliente había otro, de demo, haciendo
     lo mismo por su cuenta: podías tener la cocina en pausa y la web
     ofreciendo franjas tan tranquila. Pasa por `Demo`, que es el estado
     compartido, y la web obedece. */
  $('#c-pausa').addEventListener('click', () =>
    window.Demo.fijar({ pausado: !P.pausado }));
  /* Acotado a esta sección. Desde que «La carta» tiene su propio botón
     de agotar, un selector suelto engancharía los dos y el pedido se
     agotaría y desagotaría en el mismo clic. Hoy no pasa porque esto se
     pinta antes; mañana, reordenando `render()`, sí. */
  document.querySelectorAll('#p-controles [data-agotar]').forEach((b) =>
    b.addEventListener('click', () => {
      window.Negocio.alternarAgotado(b.dataset.agotar);   // lo lee la web
      render();
    }));
}

/* 3-bis · EL HORARIO.
   Lo último del negocio que el local no podía tocar: estaba escrito en
   `horno.js`. Lo que se elija aquí se guarda en Negocio y `horno.js` lo
   lee por encima de su tabla de fábrica, así que arrastra con él TODO
   lo que depende del horario —las franjas, la tabla del local, la
   pregunta frecuente y la ficha de las IA— sin que nadie los toque.

   LAS HORAS QUE SE OFRECEN NO SON TODAS LAS DEL DÍA, y es a propósito:
   solo las que tienen cuota de horno reservada para la web. Ofrecer una
   hora sin cuota es ofrecer un hueco que no existe — pasó al abrir el
   mediodía, cuando el horario decía 13:00 y la pantalla del cliente
   seguía empezando a las 19:00 sin avisar de nada. La lista sale de la
   tabla de cuotas de aquí abajo, así que si se reparte más horno,
   aparecen más horas solas. */
function pintarHorario() {
  const cuotas = H.HORNO.cuotaWeb;
  const primera = cuotas[0].desde;
  const ultima = cuotas[cuotas.length - 1].hasta;
  const paso = H.HORNO.granularidadMin;
  const vigente = H.dias();
  const tocado = !!window.Negocio.horario();

  const opciones = (sel, desde, hasta) => {
    let o = '';
    for (let t = desde; t <= hasta; t += paso) {
      o += `<option value="${t}"${t === sel ? ' selected' : ''}>${H.formatoHora(t)}</option>`;
    }
    return o;
  };

  const filas = Object.keys(H.DIAS).map((clave) => {
    const cfg = vigente[clave];
    const nombre = H.etiquetaDe(clave);
    const cerrado = !cfg;
    /* Un día cerrado que se abre tiene que abrir por algún sitio: se le
       propone su horario de fábrica si lo tuvo, y si no, el tramo
       entero con cuota. */
    const base = H.DIAS[clave] || { abre: primera, ultimaFranja: ultima - paso };
    return `<div class="fila">
      <div><strong>${nombre}</strong>
        <div class="nota">${cerrado ? 'Cerrado'
          : H.formatoHora(cfg.abre) + ' – ' + H.cierreDe(cfg)}</div>
      </div>
      <div class="fila__acc">
        ${cerrado ? '' : `
          <select data-abre="${clave}" aria-label="Hora de abrir, ${nombre}"
            >${opciones(cfg.abre, primera, ultima - paso)}</select>
          <span class="nota">a</span>
          <select data-cierra="${clave}" aria-label="Hora de cerrar, ${nombre}"
            >${opciones(cfg.ultimaFranja + paso, primera + paso, ultima)}</select>`}
        <button type="button" data-cerrar-dia="${clave}"
          data-abre-base="${base.abre}" data-cierra-base="${base.ultimaFranja}"
          >${cerrado ? 'Abrir este día' : 'Cerrar este día'}</button>
      </div>
    </div>`;
  }).join('');

  $('#p-horario').innerHTML = `
    <div class="bloque">${filas}
      ${P.avisoHorario ? `<p class="nota"><strong>${P.avisoHorario}</strong></p>` : ''}
    </div>
    <div class="bloque">
      <p>${tocado
        ? '<button type="button" id="h-reset">Volver al horario de siempre</button>'
        : '<span class="nota">Este es el horario de siempre: no has cambiado nada todavía.</span>'}</p>
      <p class="nota">Solo se pueden ofrecer horas que tengan horno reservado para la web.
        Eso se reparte aquí abajo, en «Cuánto horno le damos a la web».</p>
      <p class="nota">Así se lo cuenta la web a quien pregunte:<br><em>${H.fraseHorario()}</em></p>
    </div>`;

  const repintar = () => setTimeout(render, 0);

  /* Se mandan las dos horas juntas aunque solo se toque una: comprobar
     que cierra después de abrir necesita las dos. */
  const mover = (clave) => {
    const a = +document.querySelector(`[data-abre="${clave}"]`).value;
    const c = +document.querySelector(`[data-cierra="${clave}"]`).value;
    if (c <= a) {
      P.avisoHorario = 'La hora de cerrar tiene que ser posterior a la de abrir.';
      repintar(); return;
    }
    P.avisoHorario = null;
    window.Negocio.fijarHorario(clave, { abre: a, ultimaFranja: c - paso });
    regenerar(); repintar();
  };
  document.querySelectorAll('[data-abre], [data-cierra]').forEach((sel) =>
    sel.addEventListener('change', () => mover(sel.dataset.abre || sel.dataset.cierra)));

  document.querySelectorAll('[data-cerrar-dia]').forEach((b) =>
    b.addEventListener('click', () => {
      const clave = b.dataset.cerrarDia;
      const estaCerrado = !H.dias()[clave];
      window.Negocio.fijarHorario(clave, estaCerrado
        ? { abre: +b.dataset.abreBase, ultimaFranja: +b.dataset.cierraBase }
        : null);
      P.avisoHorario = null;
      regenerar(); repintar();
    }));

  const reset = $('#h-reset');
  if (reset) reset.addEventListener('click', () => {
    window.Negocio.restablecerHorario(); P.avisoHorario = null; regenerar(); repintar();
  });
}

/* 4 · Cuota web por tramo */
function pintarCuotas() {
  $('#p-fisico').textContent = H.HORNO.capacidadFisicaPorFranja;
  $('#p-cuotas').innerHTML = `<div class="bloque">${P.cuotas.map((t, i) => `
    <div class="fila">
      <div><strong>${H.formatoHora(t.desde)} – ${H.formatoHora(t.hasta)}</strong>
        <div class="nota">${t.unidades} para la web ·
          ${H.HORNO.capacidadFisicaPorFranja - t.unidades} para la puerta ·
          ${Math.round((t.unidades / H.HORNO.capacidadFisicaPorFranja) * 100)}% del horno</div></div>
      <div class="fila__acc">
        <button type="button" data-cuota="${i}" data-d="-1">−</button>
        <strong>${t.unidades}</strong>
        <button type="button" data-cuota="${i}" data-d="1">+</button>
      </div>
    </div>`).join('')}
    <p class="nota">Bajarla protege al que entra por la puerta un viernes.
      Subirla llena el horno un martes flojo.</p></div>`;

  document.querySelectorAll('[data-cuota]').forEach((b) =>
    b.addEventListener('click', () => {
      const t = P.cuotas[+b.dataset.cuota];
      t.unidades = Math.max(0, Math.min(H.HORNO.capacidadFisicaPorFranja, t.unidades + (+b.dataset.d)));
      regenerar();
      render();
    }));
}

/* 4-bis · LA CARTA.
   Lo que hasta ahora era una promesa del brief —«Nino cambia la carta
   desde el móvil y la web se entera»— escrito de forma que se puede
   comprobar abriendo las dos pestañas a la vez.

   Se puede cambiar el NOMBRE y el PRECIO de cualquier producto, QUITARLO
   de la carta (que es esconderlo, no borrarlo: ver negocio.js) y AÑADIR
   uno nuevo a una de las categorías que ya existen.

   No se puede cambiar la foto, los alérgenos ni lo que se le puede
   poner y quitar. No es un olvido: eso es trabajo de carta, no de
   turno, y meterlo aquí convertiría la herramienta del horno en un
   gestor de contenidos. */
function pintarCarta() {
  const carta = window.Negocio.cartaCompleta();

  const fila = (p) => {
    const otroNombre = p.nombre !== p.nombreOriginal;
    const otroPrecio = p.precio !== p.precioOriginal;
    return `<div class="fila${p.oculto ? ' fila--fuera' : ''}">
      <div>
        <input type="text" value="${p.nombre.replace(/"/g, '&quot;')}"
               data-nombre="${p.id}" aria-label="Nombre del producto" style="width:16em">
        ${p.anadido ? ' <span class="badge">Añadido</span>' : ''}
        ${p.oculto ? ' <span class="badge">Fuera de la carta</span>' : ''}
        ${p.agotado ? ' <span class="badge">Agotado</span>' : ''}
        ${otroNombre ? `<div class="nota">Antes «${p.nombreOriginal}» ·
          <button type="button" class="enlace" data-nombre-reset="${p.id}">volver al original</button></div>` : ''}
        ${otroPrecio ? `<div class="nota">Antes ${eur(p.precioOriginal)} ·
          <button type="button" class="enlace" data-reset="${p.id}">volver al original</button></div>` : ''}
      </div>
      <div class="fila__acc">
        <input type="number" step="0.10" min="0" value="${p.precio.toFixed(2)}"
               data-precio="${p.id}" aria-label="Precio" style="width:5.5em">
        <span class="nota">€</span>
        <button type="button" data-agotar="${p.id}"
          >${p.agotado ? 'Ya hay' : 'Se acabó'}</button>
        ${p.anadido
          ? `<button type="button" data-borrar="${p.id}">Borrar</button>`
          : `<button type="button" data-oculto="${p.id}">${p.oculto ? 'Devolver' : 'Quitar'}</button>`}
      </div>
    </div>`;
  };

  /* CADA CATEGORÍA, UN DESPLEGABLE CERRADO, y esto se hizo el
     12/10/2026. Con las veinticinco filas abiertas, «La carta» medía
     2.226 px —un tercio del panel entero— y en una pantalla estrecha
     3.427, con cada fila partida en dos líneas. Para cambiar un precio
     había que pasar por delante de toda la carta.

     Cerradas, la sección cabe en una pantalla y se abre solo la que se
     va a tocar. El resumen de cada una dice cuántos productos tiene y
     cuántos están agotados, que es lo que se quiere saber sin abrir. */
  const resumen = (productos) => {
    const n = productos.length;
    const fuera = productos.filter((p) => p.agotado).length;
    return `${n} ${n === 1 ? 'producto' : 'productos'}` +
           (fuera ? ` · ${fuera} agotado${fuera === 1 ? '' : 's'}` : '');
  };

  /* LA CATEGORÍA ABIERTA SE QUEDA ABIERTA. Cada toque —un precio, un
     agotado— repinta la sección entera, y sin recordarlo el desplegable
     se cerraba en la cara justo después de tocarlo: para cambiar tres
     precios de la misma categoría había que abrirla tres veces. */
  const grupo = (id, nombre, productos) => `
    <details class="grupo" data-grupo="${id}"${P.cartaAbierta[id] ? ' open' : ''}>
      <summary><strong>${nombre}</strong>
        <span class="nota">${resumen(productos)}</span></summary>
      ${productos.map(fila).join('')}
    </details>`;

  const porCategoria = carta.categorias
    .map((c) => grupo(c.id, c.nombre, c.productos)).join('');

  const opciones = carta.categorias
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');

  $('#p-precios').innerHTML = porCategoria + `
    <div class="bloque">
      <h3>Añadir un producto</h3>
      <div class="fila">
        <div class="campos">
          <input type="text" id="n-nombre" placeholder="Nombre">
          <input type="text" id="n-ingr" placeholder="Ingredientes" class="campo--largo">
        </div>
        <div class="fila__acc">
          <select id="n-cat" aria-label="En qué parte de la carta va">${opciones}</select>
          <input type="number" id="n-precio" step="0.10" min="0" value="0.00"
                 aria-label="Precio" class="campo--precio">
          <span class="nota">€</span>
          <button type="button" id="n-add">Añadir a la carta</button>
        </div>
      </div>
      <p class="nota">Sale sin foto, con el hueco gris. La categoría decide cuánto horno
        ocupa, así que no hay que elegirlo aparte.</p>
    </div>
    ${grupo('tienda', 'La tienda', carta.tienda)}`;

  /* `setTimeout(render, 0)`: el manejador está colgado del nodo que el
     repintado destruye. Sin él se arranca el suelo bajo los pies. */
  const repintar = () => setTimeout(render, 0);

  document.querySelectorAll('#p-precios .grupo').forEach((d) =>
    d.addEventListener('toggle', () => { P.cartaAbierta[d.dataset.grupo] = d.open; }));

  document.querySelectorAll('[data-precio]').forEach((i) =>
    i.addEventListener('change', () => {
      const v = parseFloat(i.value);
      if (!isNaN(v) && v >= 0) window.Negocio.fijarPrecio(i.dataset.precio, Math.round(v * 100) / 100);
      repintar();
    }));
  document.querySelectorAll('[data-nombre]').forEach((i) =>
    i.addEventListener('change', () => { window.Negocio.fijarNombre(i.dataset.nombre, i.value); repintar(); }));
  document.querySelectorAll('[data-reset]').forEach((b) =>
    b.addEventListener('click', () => { window.Negocio.restablecerPrecio(b.dataset.reset); repintar(); }));
  document.querySelectorAll('[data-nombre-reset]').forEach((b) =>
    b.addEventListener('click', () => { window.Negocio.restablecerNombre(b.dataset.nombreReset); repintar(); }));
  document.querySelectorAll('[data-oculto]').forEach((b) =>
    b.addEventListener('click', () => { window.Negocio.alternarOculto(b.dataset.oculto); repintar(); }));
  document.querySelectorAll('[data-borrar]').forEach((b) =>
    b.addEventListener('click', () => { window.Negocio.borrarProducto(b.dataset.borrar); repintar(); }));
  /* El mismo gesto que la rejilla de arriba, y a propósito: durante el
     turno se agota de un toque en «Marcar agotado», sin buscar; cuando
     se está editando la carta se agota aquí, sin salir. Dos sitios para
     la MISMA decisión, no dos decisiones. */
  document.querySelectorAll('#p-precios [data-agotar]').forEach((b) =>
    b.addEventListener('click', () => { window.Negocio.alternarAgotado(b.dataset.agotar); repintar(); }));

  $('#n-add').addEventListener('click', () => {
    window.Negocio.anadirProducto({
      categoria: $('#n-cat').value,
      nombre: $('#n-nombre').value,
      precio: $('#n-precio').value,
      ingredientes: $('#n-ingr').value,
    });
    repintar();
  });
}

/* 4-ter · Promos.
   Cada una lleva su "para qué sirve" y, si toca, el aviso de que
   estás descontando donde no hace falta. */
function pintarPromos() {
  const promos = window.Promos.promosVigentes();

  /* Las horas se ofrecen en una lista, no en un campo libre: las franjas
     del horno van de cuarto en cuarto, así que un descuento que empiece
     a las 19:07 no puede empezar en ninguna parte. */
  const horas = (sel, attr, id) => {
    let o = '';
    for (let t = 13 * 60; t <= 25 * 60; t += 15) {
      o += `<option value="${t}"${t === sel ? ' selected' : ''}>${H.formatoHora(t)}</option>`;
    }
    return `<select data-${attr}="${id}" aria-label="Hora">${o}</select>`;
  };

  const valores = (p) => window.Promos.VALORES_DESCUENTO
    .map((v) => `<option value="${v}"${v === p.valor ? ' selected' : ''}>${v} %</option>`).join('');

  $('#p-promos').innerHTML = promos.map((p) => {
    const aviso = window.Promos.avisoDeCriterio(p);
    const porHoras = p.tipo === 'porcentaje' && p.ventana;
    return `<div class="bloque${p.activa ? ' bloque--alerta' : ''}">
      <div class="fila">
        <div>
          <strong>${p.nombre}</strong> ${p.activa ? '<span class="tag">ACTIVA</span>' : ''}
          ${p.delLocal ? '<span class="badge">Tuya</span>' : ''}
          <div class="nota">${p.explicacion}</div>
          <div class="nota"><em>Para qué sirve:</em> ${p.porque}</div>
          ${aviso ? `<div class="nota"><strong>${aviso}</strong></div>` : ''}
          ${porHoras ? `<div class="nota">De ${H.formatoHora(p.ventana.desde)} a
            ${H.formatoHora(p.ventana.hasta)} · ${p.valor} % de descuento</div>` : ''}
          ${P.avisoPromo && P.avisoPromo.id === p.id
            ? `<div class="nota"><strong>${P.avisoPromo.motivo}</strong></div>` : ''}
        </div>
        <div class="fila__acc">
          ${porHoras
            ? `${horas(p.ventana.desde, 'desde', p.id)}
               <span class="nota">a</span>
               ${horas(p.ventana.hasta, 'hasta', p.id)}
               <select data-promo-valor="${p.id}" aria-label="Descuento">${valores(p)}</select>`
            : `<input type="number" step="${p.tipo === 'precioFijo' ? '0.10' : '1'}" min="0"
                 value="${p.tipo === 'precioFijo' ? p.valor.toFixed(2) : p.valor}"
                 data-promo-valor="${p.id}" style="width:5em">
               <span class="nota">${p.tipo === 'porcentaje' ? '%' : '€'}</span>`}
          <button type="button" data-promo="${p.id}">${p.activa ? 'Apagar' : 'Encender'}</button>
          ${p.delLocal ? `<button type="button" data-promo-borrar="${p.id}">Borrar</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('') + `
    <p><button type="button" id="promo-add">Añadir un descuento por horas</button></p>
    <p class="nota">Las promos de porcentaje solo se anuncian en las franjas
      a las que afectan: aparecen dentro del selector de horas del cliente, no como un banner.
      Dos descuentos no pueden cubrir la misma hora: se sumarían.</p>`;

  const repintar = () => setTimeout(render, 0);
  const avisar = (id, r) => { P.avisoPromo = r && r.ok === false ? { id, motivo: r.motivo } : null; };

  document.querySelectorAll('[data-promo]').forEach((b) =>
    b.addEventListener('click', () => {
      const r = window.Promos.alternar(b.dataset.promo);
      P.avisoPromo = r && r.error ? { id: b.dataset.promo, motivo: r.error } : null;
      render();
    }));
  document.querySelectorAll('[data-promo-valor]').forEach((i) =>
    i.addEventListener('change', () => {
      const v = parseFloat(i.value);
      if (!isNaN(v) && v >= 0) window.Promos.fijarValor(i.dataset.promoValor, v);
      repintar();
    }));

  /* Mover una hora manda las DOS, porque la regla de que no se pisen
     mira la ventana entera: enviar solo la que has tocado haría que la
     comprobación se hiciera contra media ventana. */
  const mover = (id) => {
    const d = +document.querySelector(`[data-desde="${id}"]`).value;
    const h = +document.querySelector(`[data-hasta="${id}"]`).value;
    avisar(id, window.Promos.fijarVentana(id, d, h));
    render();
  };
  document.querySelectorAll('[data-desde], [data-hasta]').forEach((sel) =>
    sel.addEventListener('change', () => mover(sel.dataset.desde || sel.dataset.hasta)));

  document.querySelectorAll('[data-promo-borrar]').forEach((b) =>
    b.addEventListener('click', () => { window.Promos.borrarDescuento(b.dataset.promoBorrar); repintar(); }));
  $('#promo-add').addEventListener('click', () => { window.Promos.anadirDescuento(); repintar(); });
}


/* 5 · El contador de canal.
   Aquí es donde el proyecto se justifica solo. */
function pintarCanal() {
  const delTurno = P.pedidos.filter((p) => p.estado !== null);
  const facturado = delTurno.reduce((t, p) => t + p.total, 0);
  const noches = 6;   // martes a domingo

  /* UNA LÍNEA POR PLATAFORMA, no una comisión única. Antes había un
     solo porcentaje y un párrafo largo explicando de dónde salía.
     Mery: «pon los dos agregadores que tiene y que el dueño meta su
     estimación de cada uno». Mejor: el dato deja de ser un supuesto
     nuestro con disculpa y pasa a ser su número, y el texto cabe en
     una línea porque la tabla ya se explica sola. */
  const filas = window.Negocio.agregadores().map((a) => {
    const pct = window.Negocio.comision(a.id);
    const noche = facturado * (pct / 100);
    return `<div class="fila">
      <div><strong>${a.nombre}</strong>
        <div class="nota">${eur(noche * noches * 4.3)} al mes, a este ritmo</div></div>
      <div class="fila__acc">
        <input type="number" data-comision="${a.id}" min="0" max="100" step="1" value="${pct}"
               aria-label="Comisión estimada de ${a.nombre}, en por ciento" style="width:4.5em">
        <span class="nota">%</span>
        <span class="precio">${eur(noche)}</span></div>
    </div>`;
  }).join('');

  $('#p-canal').innerHTML = `<div class="bloque">
    <div class="fila"><div><strong>Pedidos directos esta noche</strong></div>
      <div class="fila__acc"><span class="precio">${delTurno.length}</span></div></div>
    <div class="fila"><div><strong>Facturado por canal propio</strong></div>
      <div class="fila__acc"><span class="precio">${eur(facturado)}</span></div></div>
  </div>
  <div class="bloque">
    <h3>Lo que se habrían llevado</h3>
    ${filas}
    <p class="nota">Comisión estimada, no facturada: pon la tuya.</p>
  </div>` + bloqueSalidas();

  document.querySelectorAll('[data-comision]').forEach((i) =>
    i.addEventListener('change', () => {
      window.Negocio.fijarComision(i.dataset.comision, i.value);
      setTimeout(render, 0);   // fuera del ciclo del evento: el nodo se repinta
    }));
}

/* Salidas al agregador: cuántos clientes se han ido desde la web
   y desde qué punto. Si el argumento del barrio andable funciona,
   este número baja con el tiempo. Y si un punto concreto sangra
   —por ejemplo "sin franjas"— es que hay que subir la cuota web
   en ese tramo, no que la gente prefiera el agregador. */
function bloqueSalidas() {
  const s = window.Negocio.salidas();
  const claves = Object.keys(s);
  const total = claves.reduce((t, k) => t + s[k], 0);
  const nombres = { cerrado: 'con el local cerrado', pausado: 'con los pedidos en pausa',
                    'sin-franjas': 'sin franjas que admitieran su pedido', barrio: 'desde el bloque del local' };

  return `<div class="bloque">
    <h3>Se han ido al agregador</h3>
    ${total === 0
      ? '<p class="nota">Nadie todavía. Se cuenta cada clic a Just Eat o Uber Eats desde nuestra web.</p>'
      : claves.map((k) => {
          const [app, desde] = k.split('|');
          const a = window.Negocio.agregadores().find((x) => x.id === app);
          return `<div class="fila"><div>${a ? a.nombre : app}
            <div class="nota">${nombres[desde] || desde}</div></div>
            <div class="fila__acc"><span class="precio">${s[k]}</span></div></div>`;
        }).join('') + `<p class="nota">Total ${total}. Si el punto que más sangra es
          "sin franjas", el problema no es que prefieran la app: es que les faltó hueco.</p>`}
  </div>`;
}

/* ---------- demo ---------- */

function conectar() {
  /* EL PANEL DE DEMO ES EL MISMO QUE EL DE LA WEB (13/10/2026, lo vio
     Mery saltando de una pantalla a otra). Antes había dos: dos trozos
     de HTML, dos juegos de estilos y —lo peor— dos mundos simulados.
     Movías la hora aquí y la web seguía en la suya.

     Ahora los mandos los pinta `demo.js` y el estado es uno solo. En
     la cocina no hay extras: lo que se simula es el mundo, no el
     carrito de nadie. */
  window.Demo.montar($('#demo-caja'), {
    alPintar: (d) => {
      const cambiaElReparto = d.dia !== P.dia || d.semilla !== P.semilla;
      P.dia = d.dia; P.ahora = d.ahora; P.semilla = d.semilla; P.pausado = d.pausado;
      if (cambiaElReparto) { regenerar(); }
      /* Al mover el reloj, los pedidos que NO ha tocado el pizzero se
         recolocan solos; los que sí, se quedan donde los dejó. */
      P.pedidos.forEach((p) => { if (!p.aMano) recolocar(p); });
      render();
    },
  });
}

regenerar();
conectar();
render();

window.Panel = { P, regenerar, estadoPorDefecto, recolocar, madurar, cuotaDe };

})();
