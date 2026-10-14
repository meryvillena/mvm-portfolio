/* ============================================================
   PUTI DI MADRE — Promos
   ------------------------------------------------------------
   AVISO DE CRITERIO, porque aquí es fácil hacerse daño:

   El cuello de botella de este negocio es el horno, no la demanda.
   Una promo del tipo "todo al 20 %" llenaría el horno con menos
   margen por pizza: exactamente lo contrario de lo que defiende
   el proyecto. Aquí las promos no sirven para vender más, sirven
   para tres cosas concretas:

     1. MOVER DEMANDA de las horas llenas a las vacías
        (a las 19:30 el horno está parado y a las 21:30 no cabe).
     2. SUBIR EL TICKET sin bajar el precio — con la mitad de los
        hogares del barrio siendo de una persona, el ticket es bajo
        por naturaleza.
     3. DAR SALIDA a un producto concreto cuando toca.

   Por eso toda promo lleva una condición. Un descuento sin
   condición es solo vender más barato.
   ============================================================ */

/* Encapsulado: al ser scripts planos, sin esto los nombres internos
   (guardar, render, mulberry32…) chocan entre archivos. */
(function () {
'use strict';
const TIPOS = {
  porcentaje: 'Porcentaje sobre el subtotal',
  regalo: 'Producto de regalo a partir de un importe',
  precioFijo: 'Un producto a precio especial',
  fidelidad: 'Recompensa por volver, se anuncia pero no se calcula aquí',
};

/* Las cuatro que vienen de fábrica. El local las enciende, las apaga
   y les cambia el número, pero no inventa promos nuevas desde cero:
   es un local de dos personas, no un departamento de marketing.
 *
 * TRES ARRANCAN ENCENDIDAS, y no es un descuido. Con las cuatro apagadas la
 * home no enseñaba las cintas —el componente se oculta solo si no hay nada
 * que anunciar, que es lo correcto— y entonces la pieza no existía para
 * quien abría la web sin pasar antes por el panel. Un prototipo que hay que
 * configurar para que se vea no se ve.
 *
 * Van encendidos los DOS escalones del valle y la cartilla: los primeros
 * tiran de las horas vacías —que es la tesis del caso— y la cartilla trae
 * de vuelta. Los escalones van juntos porque son una sola política contada
 * en dos tramos: encender uno solo dejaría media escalera. Las otras dos se
 * quedan apagadas a propósito, para que el interruptor del panel tenga algo
 * que hacer y se note que hace algo. */
const PROMOS_BASE = [
  /* DOS ESCALONES, NO UNO PLANO. Hasta el 23/08/2026 esto era un solo
     −15 % sobre todo el tramo de 19:00 a 20:15, y tenía dos problemas.
     El primero, que 15 es mucho: en un negocio cuyo cuello de botella es
     el horno, regalar quince puntos de margen para llenar una hora que
     igual se llenaba sola es caro. El segundo, más de fondo: un descuento
     plano trata igual las 19:00 —horno frío, nadie— que las 20:00, que ya
     está a un cuarto de hora de la punta.

     Ahora el descuento SIGUE A LA NECESIDAD: cuanto más muerta la hora,
     más se descuenta. Es la misma idea que gobierna la llama, aplicada al
     precio, y se lee sola en el selector — dos etiquetas distintas puestas
     una al lado de la otra explican la política sin un párrafo.

     Las dos ventanas NO se solapan a propósito: `calcular()` suma todas
     las de porcentaje que apliquen, así que dos ventanas encabalgadas
     darían un 15 % por la puerta de atrás. Si algún día se tocan estos
     minutos, que no se toquen entre ellas. */
  {
    id: 'valle-frio',
    nombre: 'Horno frío — la hora más muerta',
    tipo: 'porcentaje',
    valor: 10,
    ventana: { desde: 19 * 60, hasta: 19 * 60 + 45 },
    activa: true,
    explicacion: 'Las primeras del día son las más baratas: el horno acaba de arrancar y está para ti.',
    porque: 'Es la hora que más cuesta llenar, así que es donde el descuento se gana el margen que cuesta.',
  },
  {
    id: 'valle-borde',
    nombre: 'Antes de la punta — el empujón pequeño',
    tipo: 'porcentaje',
    valor: 5,
    ventana: { desde: 19 * 60 + 45, hasta: 20 * 60 + 15 },
    activa: true,
    explicacion: 'A partir de las ocho menos cuarto baja a un 5 %, y a las ocho y cuarto ya no aplica.',
    porque: 'Aquí ya entra gente sola: basta con un empujón, y descontar más sería pagar por pedidos que ya venían.',
  },
  {
    id: 'ticket',
    nombre: 'El aceite, invitado',
    tipo: 'regalo',
    valor: 25,                      // importe mínimo
    regalo: 'aceite',               // id de CARTA.extras
    activa: false,
    etiqueta: 'Aceite picante gratis desde 25 €',
    explicacion: 'A partir de 25 € te va nuestro aceite picante de la casa.',
    porque: 'Sube el ticket medio sin bajar el precio de nada.',
  },
  {
    /* LA CARTILLA · la única que NO se calcula, y a propósito.
     *
     * Las otras tres miran el carrito que tienes delante. Esta mira
     * cuántas veces has vuelto, y para saber eso hace falta reconocerte
     * — cuentas, contraseñas, sesión. El MVP no las tiene y no las quiere
     * (ver DOCUMENTO_TECNICO §1: "evita cuentas de cliente").
     *
     * LA SALIDA ES QUE NO SEA DIGITAL. Cartilla de cartón, sellada en el
     * mostrador al recoger. Decisión de Mery: "que se los sellen allí con
     * una tarjeta, porque ya que tienen que ir, pues ahí llevan la
     * tarjeta". Y es mejor que cualquier versión con cuentas: no hay
     * registro, no hay correo, no hay dato que guardar ni que explicar en
     * un aviso de privacidad — y el sello lo pone la mano de quien te
     * atiende, que es exactamente el tipo de relación que el caso defiende.
     *
     * Aquí solo se ANUNCIA. `calcular()` la ignora porque el recuento vive
     * en un cartón, no en el navegador. Eso es honesto, no una carencia.
     *
     * El premio es la bolsa de tela y no una pizza gratis por dos razones que van
     * juntas: una pizza gratis ocupa horno, que es justo el recurso que
     * todo este sistema existe para proteger —regalarla en hora punta es
     * regalar lo escaso—, y la bolsa no ocupa nada (merch = 0 huecos),
     * sale del estante con el cliente ya delante. Y además se pasea por
     * el barrio, que es publicidad andando.
     * Si algún día se prefiere la pizza: cambiar `regalo` y la etiqueta. */
    id: 'cartilla',
    nombre: 'La cartilla del barrio',
    tipo: 'fidelidad',
    valor: 7,                       // pedidos para el premio
    regalo: 'tote',
    activa: true,
    /* "A la séptima" no decía séptima QUÉ: ¿pizza, pedido, visita? Con una
       cartilla que se sella en el mostrador la unidad natural es el pedido
       —un sello cada vez que vienes—, y ahora la etiqueta lo dice y la
       explicación lo remata. */
    /* SE LLAMA COMO SE LLAMA EN LA TIENDA. Aquí era «el tote» y en la
       carta «Bolsa de tela»: el premio de la cartilla y el producto que
       se vende parecían dos cosas, y son la misma. */
    etiqueta: 'Al séptimo pedido, la bolsa de tela de la casa',
    explicacion: 'Pide tu cartilla al recoger: un sello por pedido, lo lleves como lo lleves. Al séptimo, la bolsa se va contigo.',
    porque: 'Trae de vuelta al que ya vino. Es de cartón: ni registro ni datos. Y la bolsa no ocupa horno.',
  },
  {
    id: 'producto',
    nombre: 'La margarita del principio',
    tipo: 'precioFijo',
    valor: 8.50,
    producto: 'margarita',
    activa: false,
    etiqueta: 'La Margarita a 8,50 €',
    explicacion: 'Nuestra margarita, al precio al que la vendíamos el primer año.',
    porque: 'Da salida a un producto concreto. Útil si sobra masa o hay que mover stock.',
  },
];

/* Los descuentos que el panel ofrece. Una lista corta y no un campo
   libre: un 13 % no significa nada para nadie y obliga a pensar. */
const VALORES_DESCUENTO = [5, 10, 15, 20];

/* ---------- estado ---------- */

function promosVigentes() {
  const e = window.Negocio.leer();
  const guardadas = e.promos || [];
  // se conserva la definición base y se le pega lo que el local haya tocado
  const base = PROMOS_BASE.map((p) =>
    conEtiqueta({ ...p, ...(guardadas.find((x) => x.id === p.id) || {}) }));

  /* Y detrás, los descuentos por horas que el local ha creado él. Son
     promos de porcentaje normales y corrientes: la única diferencia es
     que no existían al escribir el archivo, así que no tienen un texto
     propio que explique para qué sirven. */
  const propios = (e.descuentos || []).map((d) => conEtiqueta({
    tipo: 'porcentaje',
    nombre: 'Descuento por horas',
    explicacion: 'Lo has puesto tú desde el panel.',
    porque: 'Mover pedidos a una hora en la que el horno va vacío.',
    delLocal: true,
    ...d,
  }));
  return [...base, ...propios];
}

/* ------------------------------------------------------------
   DOS DESCUENTOS NO PUEDEN PISAR LA MISMA HORA
   ------------------------------------------------------------
   `calcular()` SUMA todas las de porcentaje que apliquen, así que dos
   ventanas encabalgadas al 20 % no hacen un 20 %: hacen un 40 % sin
   que nadie lo haya decidido. En la configuración de fábrica las dos
   ventanas están escritas sin solaparse a propósito; en cuanto el
   local puede moverlas a mano, eso deja de ser una promesa del autor
   y tiene que ser una regla del programa.

   Por eso aquí no se avisa: se impide, y se dice con cuál choca.
   ------------------------------------------------------------ */
function choqueDeVentanas(id, ventana) {
  return activas().find((p) => p.tipo === 'porcentaje' && p.id !== id && p.ventana
    && ventana.desde < p.ventana.hasta && ventana.hasta > p.ventana.desde) || null;
}

function fijarVentana(id, desde, hasta) {
  if (!(hasta > desde)) {
    return { ok: false, motivo: 'La hora de fin tiene que ser posterior a la de inicio.' };
  }
  const choca = choqueDeVentanas(id, { desde, hasta });
  if (choca) {
    return { ok: false, motivo: 'Esas horas se pisan con «' + choca.nombre +
      '». Dos descuentos a la vez se suman, y acabarías descontando el doble sin quererlo.' };
  }
  guardarPromos(promosVigentes().map((p) => (p.id === id ? { ...p, ventana: { desde, hasta } } : p)));
  return { ok: true };
}

function anadirDescuento() {
  const e = window.Negocio.leer();
  const nuevo = {
    id: 'desc-' + Date.now().toString(36),
    valor: 10,
    ventana: { desde: 19 * 60, hasta: 20 * 60 },
    activa: false,          // nace apagado: encenderlo es una decisión
  };
  window.Negocio.actualizar({ descuentos: [...(e.descuentos || []), nuevo] });
  return nuevo.id;
}

function borrarDescuento(id) {
  const e = window.Negocio.leer();
  window.Negocio.actualizar({ descuentos: (e.descuentos || []).filter((d) => d.id !== id) });
}

/* La etiqueta de las de porcentaje se CALCULA del valor, no se escribe.
   Estaba a mano —'−15 % a esta hora'— y el panel deja al local cambiar el
   número: bajarlo a 12 dejaba el cartel del chip anunciando un 15 % que ya
   no existía, en la propia interfaz donde se elige la hora. Un cartel que
   promete más de lo que la caja va a descontar no es un fallo de copy, es
   una promesa incumplida en el paso anterior a pagar. */
function conEtiqueta(promo) {
  if (promo.tipo !== 'porcentaje') return promo;
  /* Partida en dos, y el número se escribe UNA VEZ. El chip de la hora
     necesita poder quedarse solo con la primera mitad: en un móvil la
     etiqueta entera caía en tres líneas y la tercera se comía la hora
     del botón —19:00, 19:15, 19:30…—, justo en la pantalla que el caso
     enseña para contar que las promos mueven pedidos. Lo vio Mery el
     13/10/2026. El texto largo sigue valiendo donde hay sitio. */
  const corta = '−' + promo.valor + ' %';
  const cola = ' a esta hora';
  return { ...promo, etiqueta: corta + cola, etiquetaCorta: corta, etiquetaCola: cola };
}

/* Se guarda también la VENTANA, que antes no se guardaba: el local podía
   cambiar el número del descuento pero no la hora, y la hora es justo lo
   que mueve pedidos. Las de fábrica y las suyas van a cajones distintos
   para que «volver a lo de antes» siga teniendo sentido. */
function guardarPromos(promos) {
  const esDeFabrica = (id) => PROMOS_BASE.some((b) => b.id === id);
  const resumen = (p) => ({ id: p.id, activa: p.activa, valor: p.valor, ventana: p.ventana });
  window.Negocio.actualizar({
    promos: promos.filter((p) => esDeFabrica(p.id)).map(resumen),
    descuentos: promos.filter((p) => !esDeFabrica(p.id)).map(resumen),
  });
}

function alternar(id) {
  const promo = promosVigentes().find((p) => p.id === id);
  /* Encender también puede chocar: dos ventanas pueden convivir apagadas
     y sumarse en cuanto las dos estén en marcha. */
  if (promo && !promo.activa && promo.tipo === 'porcentaje' && promo.ventana) {
    const choca = choqueDeVentanas(id, promo.ventana);
    if (choca) {
      return { error: 'No se puede encender: esas horas ya las cubre «' + choca.nombre +
        '», y los dos descuentos se sumarían.' };
    }
  }
  const promos = promosVigentes().map((p) => (p.id === id ? { ...p, activa: !p.activa } : p));
  guardarPromos(promos);
  return promos;
}

function fijarValor(id, valor) {
  const promos = promosVigentes().map((p) => (p.id === id ? { ...p, valor } : p));
  guardarPromos(promos);
  return promos;
}

const activas = () => promosVigentes().filter((p) => p.activa);

/* ---------- ¿a qué franjas afecta? ---------- */

function tramoDe(minuto) {
  return window.Horno.HORNO.cuotaWeb.findIndex((t) => minuto >= t.desde && minuto < t.hasta);
}

function aplicaEnFranja(promo, minutoFranja) {
  /* La VENTANA manda sobre el tramo, y por eso se pregunta primero. El
     tramo es la unidad del horno —cuánta cuota hay— y sirve para promos
     que van con la capacidad. Pero un descuento por horas no tiene por qué
     coincidir con un tramo de cuota: los escalones del valle parten el
     tramo de 19:00–20:15 en dos. Sin esto habría que inventar tramos de
     cuota falsos para poder descontar distinto, y eso sería mover el
     modelo del horno para que quepa una promo. */
  if (promo.ventana) {
    return minutoFranja >= promo.ventana.desde && minutoFranja < promo.ventana.hasta;
  }
  if (promo.tramo === undefined || promo.tramo === null) return true;
  return tramoDe(minutoFranja) === promo.tramo;
}

// Promos que se anuncian sobre una franja concreta del selector.
// Es la integración que hace que esto no sea un banner más:
// el incentivo vive dentro de la interfaz de capacidad.
function promosDeFranja(minutoFranja) {
  return activas().filter((p) => p.tipo === 'porcentaje' && aplicaEnFranja(p, minutoFranja));
}

/* ---------- cálculo ---------- */

/**
 * Aplica las promos activas a un carrito y una franja.
 * Devuelve subtotal, descuento, regalos y qué falta para llegar
 * a las que aún no se cumplen (para poder decírselo al cliente).
 */
function calcular(carrito, minutoFranja) {
  const subtotal = carrito.reduce((t, i) =>
    t + (i.precio + i.extras.reduce((e, x) => e + x.precio, 0)) * i.cantidad, 0);

  let descuento = 0;
  const regalos = [];
  const aplicadas = [];
  const pendientes = [];

  activas().forEach((promo) => {
    if (promo.tipo === 'porcentaje') {
      // Sin franja elegida todavía no se puede prometer nada.
      if (minutoFranja == null) return;
      if (!aplicaEnFranja(promo, minutoFranja)) return;
      descuento += subtotal * (promo.valor / 100);
      aplicadas.push(promo);
    }

    if (promo.tipo === 'regalo') {
      if (subtotal >= promo.valor) {
        const extra = CARTA.extras.find((e) => e.id === promo.regalo);
        if (extra) regalos.push(extra);
        aplicadas.push(promo);
      } else {
        pendientes.push({ promo, falta: promo.valor - subtotal });
      }
    }

    if (promo.tipo === 'precioFijo') {
      const linea = carrito.filter((i) => i.id === promo.producto);
      linea.forEach((i) => {
        const dif = i.precio - promo.valor;
        if (dif > 0) descuento += dif * i.cantidad;
      });
      if (linea.length) aplicadas.push(promo);
    }
  });

  descuento = Math.round(descuento * 100) / 100;
  return {
    subtotal,
    descuento,
    total: Math.max(0, Math.round((subtotal - descuento) * 100) / 100),
    regalos, aplicadas, pendientes,
  };
}

/* Aviso para el panel: descontar en las horas que ya se llenan
   solas es regalar margen. Que lo diga la herramienta. */
function avisoDeCriterio(promo) {
  if (promo.tipo !== 'porcentaje') return null;
  /* Con ventana, el tramo se deduce de su primer minuto: lo que importa
     para el aviso es si esas horas son punta, no cómo se hayan escrito. */
  const iTramo = promo.ventana ? tramoDe(promo.ventana.desde) : promo.tramo;
  if (iTramo == null || iTramo < 0) return null;
  const tramo = window.Horno.HORNO.cuotaWeb[iTramo];
  if (!tramo) return null;
  const esPunta = tramo.unidades < window.Horno.HORNO.capacidadFisicaPorFranja * 0.6;
  return esPunta
    ? 'Ojo: estás descontando en las horas que ya se llenan solas. Ahí no ganas pedidos, solo regalas margen.'
    : null;
}

window.Promos = {
  TIPOS, PROMOS_BASE, VALORES_DESCUENTO,
  promosVigentes, alternar, fijarValor, activas,
  fijarVentana, anadirDescuento, borrarDescuento, choqueDeVentanas,
  promosDeFranja, aplicaEnFranja, calcular, avisoDeCriterio, tramoDe,
};

})();
