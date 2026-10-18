/* ============================================================
   PUTI DI MADRE — Motor de capacidad del horno
   ------------------------------------------------------------
   Lógica pura: no toca el DOM, no sabe que existe una web.
   Se puede probar, portar o sustituir sin tocar la interfaz.

   Modelo:
   - El horno mide su carga en UNIDADES, no en pizzas.
   - Cada franja de 15 min tiene una capacidad física (6 unidades)
     de la cual solo una CUOTA está abierta al canal web. El resto
     se reserva a quien entra por la puerta.
   - Un pedido no se parte entre franjas: o cabe entero, o no cabe.
   ============================================================ */

/* Encapsulado: al ser scripts planos, sin esto los nombres internos
   (guardar, render, mulberry32…) chocan entre archivos. */
(function () {
'use strict';
const HORNO = {
  granularidadMin: 15,
  capacidadFisicaPorFranja: 6,   // unidades — el techo del pizzero, no del horno
  antelacionMinimaMin: 25,       // desde "confirmar" hasta el inicio de la 1ª franja ofrecible
  /* "Quedan pocos huecos" se mide DESPUÉS de tu pedido, no antes.

     Hasta el 23/08/2026 la regla era `libres <= 1` a secas, y tenía un
     agujero que la anulaba: la pregunta de "no cabe" se hace ANTES y su
     umbral crece con el pedido. Con una caja de bandeja y media hacían
     falta a la vez `libres >= 1,5` y `libres <= 1` — imposible. Medido
     sobre 9 escenarios: con pedidos de más de una bandeja, "pocas plazas"
     no salía RARO, salía CERO. Y como es el único disparador de la llama
     roja en el selector de hora, el nivel entero desaparecía.

     Ahora se mide el hueco que queda cuando ya estás dentro.

     Y el 0,25 está BARRIDO, no elegido a ojo: se probaron 4 valores de
     este umbral × 5 del de abajo sobre 3 días × 40 semillas × 16 horas ×
     4 tamaños de pedido. Con 1 —el valor obvio— la regla se traga entero
     el nivel "se va animando": pasa del 14 % de las franjas al 0 %. Un
     arreglo que borra el nivel de al lado no es un arreglo. Con 0,25
     conviven los cuatro y es el que menos escenarios deja sin llama roja.

     Además se explica sola: un cuarto de bandeja es lo que ocupa una
     bebida. "Quedan pocos huecos" = cabes tú y como mucho una caña. */
  umbralPocasPlazas: 0.25,       // hueco máximo que puede quedar DESPUÉS de tu pedido

  /* Y el tope, que es lo que impide que el aviso hable de tu carrito en
     vez de hablar del horno. Sin él, un pedido de 3 bandejas dejaba el
     100 % de las franjas en "quedan pocos huecos" —incluido un horno
     vacío—, porque después de un pedido así siempre queda poco. Con él,
     la franja tiene que venir ya cargada de antes para poder avisar.

     El 0,40 no es nuevo: es el mismo corte con el que `contenido.js`
     separa "entra cuando quieras" de "se va animando". Una franja por
     debajo de ahí es un horno tranquilo, y un horno tranquilo no avisa. */
  umbralYaCargada: 0.4,          // ocupación mínima previa para poder avisar
  ventanaRecogidaMin: 5,         // la franja 21:15 se muestra como 21:10–21:15
  umbralRetrasoMin: 10,          // pasado esto desde la franja → "recogida con retraso"

  /* LO QUE TARDA UN PEDIDO, en minutos.

     UN PEDIDO ES ENTERO: la pizza, el vino y el refresco. Lo que el
     tablero del panel sigue no es una pizza, es un pedido, y un pedido
     no está listo cuando la pizza sale del horno —está listo cuando
     está la caja cerrada, las bebidas dentro y la bolsa en la
     estantería—. Por eso son dos números y se suman.

     Estirar y montar no suma: se hace mientras cuece la hornada
     anterior. Esa es toda la gracia de un horno que admite seis a la
     vez. Lo que va en serie es el horno y lo de después.

     Ocho minutos de horno es una solera de barrio a 300-350 °C, que es
     lo que hay en Lavapiés. Un napolitano de leña a 450 °C la hace en
     noventa segundos, y entonces lo que tarda el pedido es la cola. Si
     el local cambia de horno se cambia aquí, y el tablero se entera. */
  minutosDeHorno: 8,             // la pizza dentro
  minutosDeMontaje: 5,           // después: caja, bebidas, bolsa
  get minutosDePedido() { return this.minutosDeHorno + this.minutosDeMontaje; },

  // Cuota reservada al canal web, por tramo de servicio.
  // `desde` inclusive, `hasta` exclusivo. Minutos desde medianoche
  // (se admiten valores > 1440 para las franjas de madrugada).
  //
  // OJO: un minuto sin tramo aquí NO TIENE FRANJA. Por eso, al abrir el
  // mediodía de jueves a sábado (09/10/2026), hubo que añadir los tramos
  // de comida: sin ellos el horario decía 13:00 y la pantalla de elegir
  // hora seguía empezando a las 19:00, sin avisar de nada.
  cuotaWeb: [
    { desde: 13 * 60,      hasta: 14 * 60,      unidades: 4 }, // entra la comida
    { desde: 14 * 60,      hasta: 15 * 60 + 30, unidades: 3 }, // punta de comida
    { desde: 15 * 60 + 30, hasta: 19 * 60,      unidades: 4 }, // tarde floja
    { desde: 19 * 60,      hasta: 20 * 60 + 15, unidades: 4 }, // valle
    { desde: 20 * 60 + 15, hasta: 22 * 60 + 30, unidades: 3 }, // punta: la cola está en la puerta
    { desde: 22 * 60 + 30, hasta: 25 * 60 + 30, unidades: 4 }, // cierre
  ],
};

/* Coste en unidades por tipo de producto.
 *
 * ANTES DE TOCAR ESTA TABLA, hay que entender qué mide.
 *
 * "El horno" es una METÁFORA. No mide la cámara de cocción: mide LA
 * CAPACIDAD DE TRABAJO DE LA TIENDA en una franja de quince minutos, con
 * las dos personas que hay dentro. Por eso una pizza vale 1 aunque el
 * horno admita seis a la vez, y por eso una Coca-Cola no vale 0 aunque no
 * se hornee: alguien tiene que cogerla, comprobarla y meterla en la bolsa.
 *
 * Se valoró separar dos escalas —"horno" y "manos"— y se descartó
 * (decisión de Mery, 21/08/2026): al restaurante le da igual de dónde
 * salga el minuto, y dos escalas obligan a explicar dos cosas donde antes
 * había una. Una sola escala, y se llama horno porque es el lenguaje del
 * local. Simplificar gana.
 *
 * La regla, en una línea: lo que pasa por el horno vale 1; lo que hay que
 * preparar sin hornear vale 0,25. Cuatro refrescos no son una pizza, pero
 * tampoco son gratis.
 */
/* QUÉ SE HORNEA DE VERDAD. No se puede deducir de la tabla de abajo y
   por eso está aquí arriba, aparte: desde el 21/08/2026 un refresco
   cuesta 0,25 unidades de "horno", y eso no lo mete en el horno, lo
   mete en las manos de alguien. Confundir las dos cosas tenía un
   síntoma muy concreto en el tablero del panel —un pedido de un
   tiramisú y una caña anunciando "dentro del horno, sale sola a las
   21:23"—, que no se veía mientras el horno era un botón y saltó a la
   cara en cuanto el horno pasó a contar minutos (12/10/2026). */
const PASA_POR_HORNO = ['pizza', 'calzone', 'pan'];

const COSTE_HORNO = {
  pizza:   1.0,
  calzone: 1.5,   // más montaje, cierre a mano y cocción más lenta
  pan:     0.5,
  postre:  0.25,  // emplatar, tapa, cubierto
  bebida:  0.25,  // cogerla, comprobarla, meterla en la bolsa
  extra:   0,     // viaja sobre un producto que ya cuenta
  merch:   0,     // ver la nota de abajo
};

/* EL MERCHAN NO OCUPA, Y NO ES POR EL TIEMPO QUE CUESTA.
 *
 * Es porque nadie hace un pedido de recogida para una camiseta. El merchan
 * se compra aprovechando que ya vas a por la cena, o entrando en la tienda
 * al pasar. Es un añadido a un pedido que ya existe, no el motivo de un
 * pedido — y nadie encarga treinta camisetas para recoger a las 21:15.
 *
 * De ahí que la capacidad solo la consuma la ALIMENTACIÓN: es lo único que
 * hay que tener listo a una hora concreta. La camiseta se coge del estante
 * cuando el cliente ya está delante del mostrador.
 *
 * Consecuencia que conviene tener presente: el carrito de SOLO tienda que
 * atiende `soloTienda()` —el que puede recogerse a cualquier hora abierta—
 * es un caso límite que se sostiene, no un recorrido principal. Está bien
 * que funcione; no está bien diseñar la pantalla alrededor de él.
 *
 * Si algún día se decide que doblar y embolsar también ocupa, aquí se
 * cambia el 0 — pero entonces esa promesa deja de ser cierta y hay que
 * revisarla. */

/* Días de servicio. `null` = cerrado.
 *
 * HORARIO NUEVO (decisión de Mery, 09/10/2026). Antes los tres grupos
 * abrían a las 19:00 y dos de ellos tenían exactamente el mismo horario,
 * así que la tabla del local enseñaba dos filas idénticas. Ahora cada
 * grupo dice una cosa distinta:
 *
 *   martes y miércoles      solo cenas          19:00 – 00:00
 *   jueves a sábado         ININTERRUMPIDO      13:00 – 01:00
 *   domingo                 solo cenas, corto   19:00 – 23:00
 *
 * `ultimaFranja` es el ÚLTIMO hueco que se puede reservar, no la hora de
 * cierre: el cierre es esa hora más los 15 minutos de la franja. Por eso
 * «última recogida 15 min antes del cierre» no es una frase de adorno,
 * es lo que dice esta tabla.
 *
 * UN DÍA ES UN DÍA, y esto se rehízo el 11/10/2026. Antes estaban
 * agrupados —`martesMiercoles`, `juevesASabado`— porque así se
 * escribe un horario en una puerta. Pero en cuanto el local pudo
 * editarlos, el grupo se volvió una trampa: cerrar el miércoles por
 * un festivo obligaba a cerrar también el martes.
 *
 * Así que la regla es:
 *
 *   SE EDITAN de uno en uno, que es como pasan las cosas en un local.
 *   SE CUENTAN agrupados, que es como se lee un horario.
 *
 * Lo segundo no se escribe: lo calcula `tramos()` juntando días
 * seguidos con el mismo horario. Si Nino cierra el miércoles, la web
 * pasa sola de «martes y miércoles» a «martes» y «miércoles, cerrado»,
 * sin que nadie toque un texto.
 *
 * Antes de esto se llamaban `entresemana` y `finde`, y dejaron de ser
 * verdad en cuanto el jueves se fue con el fin de semana. */
const DIAS = {
  lunes:     null,
  martes:    { abre: 19 * 60, ultimaFranja: 23 * 60 + 45, etiqueta: 'Martes' },
  miercoles: { abre: 19 * 60, ultimaFranja: 23 * 60 + 45, etiqueta: 'Miércoles' },
  jueves:    { abre: 13 * 60, ultimaFranja: 24 * 60 + 45, etiqueta: 'Jueves' },
  viernes:   { abre: 13 * 60, ultimaFranja: 24 * 60 + 45, etiqueta: 'Viernes' },
  sabado:    { abre: 13 * 60, ultimaFranja: 24 * 60 + 45, etiqueta: 'Sábado' },
  domingo:   { abre: 19 * 60, ultimaFranja: 22 * 60 + 45, etiqueta: 'Domingo' },
};

/* El orden de la semana, que no es el de las claves de un objeto. */
const SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

/* EL MOMENTO DE LA DEMO, DICHO UNA VEZ (13/10/2026, auditoría de Mery).

   La web arrancaba un viernes a las 20:40 y el panel el mismo viernes a
   las 21:20, cada uno con su número escrito en su archivo. Como la barra
   de la demo deja saltar de una pantalla a la otra, el salto adelantaba
   cuarenta minutos y las dos mitades dejaban de contar el mismo turno:
   el pedido que en la web estabas haciendo para las 21:15, en el panel
   ya se lo había llevado alguien.

   Las 20:50 no son un punto medio, son el único hueco que les sirve a
   las dos. La web necesita que la primera franja ofrecible no sea
   inmediata —hay 25 minutos de antelación mínima, así que sale 21:15—.
   El panel necesita que la columna del medio tenga a alguien: un pedido
   se prepara en 13 minutos y las franjas van de quince en quince, o sea
   que la hora tiene que caer dentro de los 13 minutos previos a una
   franja; para la de las 21:00, eso es de 20:47 en adelante.

   Si algún día cambia `minutosDePedido` o la antelación mínima, este
   número hay que volver a elegirlo con esas dos cuentas delante. */
const DEMO = { dia: 'viernes', ahora: 20 * 60 + 50, semilla: 7 };

/* ------------------------------------------------------------
   EL HORARIO QUE MANDA
   ------------------------------------------------------------
   `DIAS` es el horario DE FÁBRICA. Desde el 11/10/2026 el local
   puede cambiarlo desde el panel, así que nadie debe leer `DIAS`
   directamente: se pregunta por `dias()`, que devuelve el de
   fábrica con lo que haya cambiado el local puesto encima.

   Es la misma idea que la carta: el archivo no se reescribe, se le
   pone una capa. Así «volver al horario de siempre» es borrar la
   capa, y lo original nunca se perdió.

   `window.Negocio` puede no existir todavía cuando se carga este
   archivo —se carga después—, pero sí existe cuando alguien llama
   a esta función, que es lo que importa.
   ------------------------------------------------------------ */
function dias() {
  const puesto = (window.Negocio && window.Negocio.horario && window.Negocio.horario()) || null;
  if (!puesto) return DIAS;
  const fuera = {};
  Object.keys(DIAS).forEach((clave) => {
    if (!(clave in puesto)) { fuera[clave] = DIAS[clave]; return; }
    const cambio = puesto[clave];
    fuera[clave] = cambio ? { ...(DIAS[clave] || {}), ...cambio } : null;
  });
  return fuera;
}

/* ------------------------------------------------------------
   EL HORARIO, DICHO CON PALABRAS
   ------------------------------------------------------------
   La web dice el horario en tres sitios con frases, no con tablas:
   la pregunta frecuente, el resumen para las máquinas y el
   `llms.txt`. Estaban ESCRITAS A MANO, y en cuanto el local pudo
   cambiar la hora desde el panel pasaron a poder mentir.

   Ahora se escriben de aquí. La regla de «solo cenas» o «comida y
   cena» no es un adorno: sale de la hora de apertura. Si abres
   antes de las cinco de la tarde estás dando comidas; si abres
   después, solo cenas. Es la frontera que entiende cualquiera.
   ------------------------------------------------------------ */
const TARDE = 17 * 60;

/* El nombre de un día cerrado. `DIAS.lunes` es `null` —así se dice
   «cerrado»— y un null no tiene etiqueta que enseñar, así que el
   nombre vive aquí. */
const ETIQUETAS_CERRADO = { lunes: 'Lunes' };

function etiquetaDe(clave) {
  const cfg = DIAS[clave];
  return (cfg && cfg.etiqueta) || ETIQUETAS_CERRADO[clave] || clave;
}

/* ------------------------------------------------------------
   DE SIETE DÍAS A LOS TRAMOS QUE SE LEEN
   ------------------------------------------------------------
   «Martes y miércoles, de 19:00 a 00:00» no está escrito en ningún
   sitio: se calcula juntando días SEGUIDOS con el mismo horario. Por
   eso cerrar el miércoles no rompe nada: la web pasa sola a decir
   «Martes» y «Miércoles, cerrado».

   Seguidos, no sueltos: martes y jueves pueden tener la misma hora y
   no son un tramo — entre medias hay un miércoles que dice otra cosa,
   y juntarlos en una línea sería mentir.
   ------------------------------------------------------------ */
function mismoHorario(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.abre === b.abre && a.ultimaFranja === b.ultimaFranja;
}

/* «Jueves, viernes y sábado»: el primero con mayúscula porque abre la
   frase, los demás en minúscula porque van dentro de ella. */
function nombreDeTramo(claves) {
  const n = claves.map(etiquetaDe);
  const chico = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  if (n.length === 1) return n[0];
  const resto = n.slice(1).map(chico);
  return [n[0]].concat(resto.slice(0, -1)).join(', ') + ' y ' + resto[resto.length - 1];
}

function tramos() {
  const v = dias();
  const fuera = [];
  SEMANA.forEach((clave) => {
    const ultimo = fuera[fuera.length - 1];
    if (ultimo && mismoHorario(ultimo.cfg, v[clave])) { ultimo.dias.push(clave); return; }
    fuera.push({ dias: [clave], cfg: v[clave] });
  });
  return fuera.map((t) => ({ ...t, nombre: nombreDeTramo(t.dias) }));
}

function cierreDe(cfg) {
  return formatoHora(cfg.ultimaFranja + HORNO.granularidadMin);
}

function fraseDeTramo(t) {
  if (!t.cfg) return t.nombre + ', cerrado';
  const horas = formatoHora(t.cfg.abre) + ' a ' + cierreDe(t.cfg);
  return t.cfg.abre < TARDE
    ? t.nombre + ', de ' + horas + ' sin cerrar entre comida y cena'
    : t.nombre + ', solo cenas, de ' + horas;
}

/* El horario entero en una frase seguida, para meterlo en un texto. */
function fraseHorario() {
  return lineasHorario().join('. ') +
         '. La última recogida es siempre 15 minutos antes del cierre.';
}

/* Y en líneas sueltas, para una lista. */
function lineasHorario() {
  return tramos().map(fraseDeTramo);
}

/* ---------- utilidades de tiempo ---------- */

function formatoHora(min) {
  const m = ((min % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}

function ventanaRecogida(inicio) {
  return formatoHora(inicio - HORNO.ventanaRecogidaMin) + '–' + formatoHora(inicio);
}
/* La misma ventana, pero dentro de una frase. El guion corto sirve en
   una etiqueta —«21:10–21:15»— y chirría en medio de una oración:
   «Llega entre las 21:10–21:15» no se lee, se descifra. Los dos salen
   de los mismos dos números, así que no pueden discrepar. */
function ventanaRecogidaDicha(inicio) {
  return formatoHora(inicio - HORNO.ventanaRecogidaMin) + ' y las ' + formatoHora(inicio);
}

/* ---------- coste del carrito ---------- */

// Redondeo hacia arriba al 0,5 más cercano.
function costeCarrito(items) {
  const bruto = items.reduce((total, item) => {
    const unitario = COSTE_HORNO[item.tipo] ?? 0;
    return total + unitario * item.cantidad;
  }, 0);
  return Math.ceil(bruto * 2) / 2;
}

/* ---------- generación de franjas ---------- */

function cuotaPara(minuto) {
  const tramo = HORNO.cuotaWeb.find((t) => minuto >= t.desde && minuto < t.hasta);
  return tramo ? tramo.unidades : 0;
}

// PRNG con semilla: la demo enseña siempre la misma mezcla de estados.
function mulberry32(semilla) {
  let a = semilla >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Siembra una franja con pedidos falsos de tamaño realista, en vez de
// con un número abstracto: así la ocupación siempre es suma de pedidos
// posibles (1 / 1,5 / 2 / 2,5) y aparecen medias unidades de forma natural.
function sembrarOcupacion(minuto, cuota, rnd) {
  /* Dos puntas, no una: la de la comida y la de la cena. Sin la primera,
     el mediodía entero se sembraba como una tarde muerta y la rejilla
     salía en verde de las 13:00 a las 19:00. */
  const esPunta = (minuto >= 14 * 60      && minuto < 15 * 60 + 30)
               || (minuto >= 20 * 60 + 15 && minuto < 22 * 60 + 30);
  const objetivo = cuota * (esPunta ? 0.5 + rnd() * 0.65 : 0.05 + rnd() * 0.5);
  const tamaños = [1, 1, 1.5, 2, 2.5];
  let ocupadas = 0;
  for (let i = 0; i < 12; i++) {
    const t = tamaños[Math.floor(rnd() * tamaños.length)];
    if (ocupadas + t > objetivo || ocupadas + t > cuota) break;
    ocupadas += t;
  }
  return ocupadas;
}

function generarFranjas(dia, semilla) {
  const cfg = dias()[dia];
  if (!cfg) return [];
  const rnd = mulberry32(semilla);
  const franjas = [];
  for (let t = cfg.abre; t <= cfg.ultimaFranja; t += HORNO.granularidadMin) {
    const cuota = cuotaPara(t);
    if (!cuota) continue;
    franjas.push({
      inicio: t,
      cuota,
      ocupadas: sembrarOcupacion(t, cuota, rnd),
    });
  }
  return franjas;
}

/* ---------- estados de franja ---------- */

const ESTADOS_FRANJA = {
  disponible:   { etiqueta: 'Hay hueco',        seleccionable: true  },
  pocasPlazas:  { etiqueta: 'Pocas plazas',     seleccionable: true  },
  completa:     { etiqueta: 'HORNO LLENO',      seleccionable: false },
  noCabe:       { etiqueta: 'No cabe tu pedido', seleccionable: false },
  cerrada:      { etiqueta: 'Cerrada',          seleccionable: false },
};

function libresDe(franja) {
  return Math.max(0, franja.cuota - franja.ocupadas);
}

/**
 * Estado visible de una franja PARA UN CARRITO CONCRETO.
 * El orden de las comprobaciones importa: "no cabe" pesa más que
 * "pocas plazas" porque es lo accionable.
 */
function estadoFranja(franja, coste, ctx) {
  if (ctx.pausado) return 'cerrada';
  if (franja.inicio < ctx.ahora + HORNO.antelacionMinimaMin) return 'cerrada';

  const libres = libresDe(franja);
  if (libres <= 0) return 'completa';
  if (coste > 0 && coste > libres) return 'noCabe';
  /* Las DOS condiciones, y hacen falta las dos: que después de meterte
     apenas quede hueco, y que la franja ya viniera cargada. La primera
     hace que el aviso sea alcanzable con cualquier pedido; la segunda,
     que siga hablando del horno. Ver la nota de HORNO arriba. */
  const yaCargada = franja.cuota > 0 && franja.ocupadas / franja.cuota >= HORNO.umbralYaCargada;
  if (libres - coste <= HORNO.umbralPocasPlazas && yaCargada) return 'pocasPlazas';
  return 'disponible';
}

/** La más temprana que cumple antelación Y admite el pedido entero. */
function primeraOfrecible(franjas, coste, ctx) {
  return franjas.find((f) => ESTADOS_FRANJA[estadoFranja(f, coste, ctx)].seleccionable) || null;
}

/** Reserva atómica: revalida en el último momento (paso 7 del recorrido). */
function reservar(franja, coste, ctx) {
  const estado = estadoFranja(franja, coste, ctx);
  if (!ESTADOS_FRANJA[estado].seleccionable) {
    return { ok: false, motivo: estado };
  }
  franja.ocupadas += coste;
  return { ok: true };
}

/* ---------- estados del pedido ---------- */

/* Cada estado lleva su SELLO, que es la palabra que se estampa en el ticket
   de seguimiento. No es la etiqueta abreviada: la etiqueta describe el
   estado desde fuera ("En el horno") y el sello lo estampa el taller desde
   dentro ("AL FUEGO"). Es la misma diferencia que hay entre el albarán y el
   parte de trabajo, y es lo que hace que la pantalla parezca un ticket de
   verdad en vez de una lista de estados con marco.

   `validando` no tiene sello, y no es un olvido: es una pantalla de paso de
   dos segundos, no un estado que el cliente siga. El ticket enseña cuatro. */
const ESTADOS_PEDIDO = [
  { id: 'validando',  etiqueta: 'Validando disponibilidad' },
  { id: 'confirmado', etiqueta: 'Confirmado',         sello: 'OK' },
  { id: 'masa',       etiqueta: 'Manos a la masa',    sello: 'AMASADA' },
  { id: 'horno',      etiqueta: 'En el horno',        sello: 'AL FUEGO' },
  { id: 'listo',      etiqueta: 'Lista para recoger', sello: 'LISTA' },
  /* RECOGIDA · el estado que faltaba (23/08/2026). Sin él, el mismo gesto
     que sacaba la pizza del horno la daba por entregada: el ticket
     estampaba AL FUEGO y LISTA en el mismo clic y la última fila no
     llegaba a estar nunca en curso. Se veía como si el horno se saltara.

     Y no es un estado de relleno para alargar la demo: "está lista en el
     mostrador" y "te la has llevado" son dos cosas distintas para el local
     —una ocupa sitio en el mostrador y la otra no— y es justo la
     diferencia que mide `hayRetraso()`. No lleva sello propio: cierra la
     fila de "lista para recoger", que es la que ya existe. */
  { id: 'recogida',   etiqueta: 'Recogida',            sello: 'LISTA' },
];

function hayRetraso(pedido, ahora) {
  return pedido
    && pedido.estado === 'listo'
    && ahora > pedido.franja.inicio + HORNO.umbralRetrasoMin;
}

/* ---------- expuesto ---------- */

window.Horno = {
  HORNO, COSTE_HORNO, PASA_POR_HORNO, DEMO, DIAS, SEMANA, dias, tramos,
  fraseHorario, lineasHorario, cierreDe, etiquetaDe,
  ESTADOS_FRANJA, ESTADOS_PEDIDO,
  formatoHora, ventanaRecogida, ventanaRecogidaDicha, costeCarrito,
  generarFranjas, estadoFranja, primeraOfrecible, reservar,
  libresDe, hayRetraso,
};

})();
