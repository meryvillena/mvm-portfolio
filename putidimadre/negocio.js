/* ============================================================
   PUTI DI MADRE — Estado del negocio
   ------------------------------------------------------------
   Lo que el local decide y la web obedece: precios, agotados y
   promos activas. Vive en localStorage, así que el panel escribe
   y la web lee sin backend.

   En producción esto es exactamente la tabla de Airtable que
   toca el local. La forma del objeto no cambiaría:
     const ESTADO = await fetch('/api/estado').then(r => r.json());

   Por qué existe este archivo: hasta ahora la web presumía de que
   "Nino cambia un precio desde el móvil y la web se actualiza".
   Era una afirmación. Ahora se puede comprobar abriendo las dos
   pestañas a la vez.
   ============================================================ */

/* Encapsulado: al ser scripts planos, sin esto los nombres internos
   (guardar, render, mulberry32…) chocan entre archivos. */
(function () {
'use strict';
const CLAVE = 'pdm-negocio';

const POR_DEFECTO = {
  precios: {},     // { idProducto: precio } — solo lo que se ha cambiado
  nombres: {},     // { idProducto: 'nombre nuevo' } — solo lo renombrado
  ocultos: [],     // lo que el local ha quitado de la carta. NO se borra
  nuevos: [],      // lo que ha añadido: { id, categoria, nombre, precio, ... }
  agotados: [],
  promos: null,    // se rellena con las de promos.js la primera vez
  descuentos: [],  // los que el local crea por su cuenta: { id, valor, ventana, activa }
  horario: null,   // null = el de fábrica. { día: {abre, ultimaFranja} | null }
  comisiones: {},  // { justeat: 25 } — solo lo que el local haya cambiado
  salidas: {},     // { 'justeat|cerrado': 3 } — clics al agregador y desde dónde
};

/* QUÉ CATEGORÍA ELIGES, CUÁNTO HORNO OCUPA.
   Un producto nuevo necesita un `tipo`, porque es lo que dice cuánto
   horno consume (ver `COSTE_HORNO` en horno.js). Pero «tipo» es una
   palabra nuestra, no del local: a Nino se le pregunta en qué parte de
   la carta va, que es lo que él sabe, y el tipo sale de ahí. */
const TIPO_POR_CATEGORIA = {
  siempre: 'pizza', casa: 'pizza', sincarne: 'pizza',
  calzones: 'calzone', acompanar: 'pan', dulce: 'postre', bebidas: 'bebida',
};

function leer() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    return { ...POR_DEFECTO, ...guardado };
  } catch (e) {
    return { ...POR_DEFECTO };
  }
}

function guardar(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch (e) { /* modo privado: la sesión sigue, no persiste */ }
}

function actualizar(cambios) {
  const nuevo = { ...leer(), ...cambios };
  guardar(nuevo);
  return nuevo;
}

/* ---------- consultas ---------- */

// Precio vigente: el que haya puesto el local, o el de carta.js.
function precioDe(producto) {
  const e = leer();
  return e.precios[producto.id] ?? producto.precio;
}

function estaAgotado(id) {
  return leer().agotados.includes(id);
}

function alternarAgotado(id) {
  const e = leer();
  const agotados = e.agotados.includes(id)
    ? e.agotados.filter((x) => x !== id)
    : [...e.agotados, id];
  return actualizar({ agotados });
}

function fijarPrecio(id, precio) {
  const e = leer();
  return actualizar({ precios: { ...e.precios, [id]: precio } });
}

function restablecerPrecio(id) {
  const e = leer();
  const precios = { ...e.precios };
  delete precios[id];
  return actualizar({ precios });
}

/* ------------------------------------------------------------
   LA CARTA SE EDITA POR CAPAS, NO SE REESCRIBE
   ------------------------------------------------------------
   `carta.js` no se toca nunca. El local escribe encima: este precio
   es otro, este se llama distinto, este hoy no está, y además hay
   estos tres que he añadido yo. La carta que ve el cliente es la
   base con esa capa puesta.

   Por eso QUITAR UN PRODUCTO NO LO BORRA: lo esconde. Volver a
   ponerlo es un clic y no se ha perdido su foto, sus alérgenos ni
   lo que se le puede quitar. Lo único que se borra de verdad es un
   producto que añadió el propio local, porque ahí no hay nada
   original que recuperar.
   ------------------------------------------------------------ */

function nombreDe(producto) {
  return leer().nombres[producto.id] ?? producto.nombre;
}

function fijarNombre(id, nombre) {
  const e = leer();
  const limpio = String(nombre || '').trim();
  if (!limpio) return e;            // un producto sin nombre no es un producto
  /* Si es uno de los añadidos, el nombre vive dentro del propio
     producto: no hay un original del que separarlo. */
  if (e.nuevos.some((p) => p.id === id)) {
    return actualizar({ nuevos: e.nuevos.map((p) => (p.id === id ? { ...p, nombre: limpio } : p)) });
  }
  return actualizar({ nombres: { ...e.nombres, [id]: limpio } });
}

function restablecerNombre(id) {
  const e = leer();
  const nombres = { ...e.nombres };
  delete nombres[id];
  return actualizar({ nombres });
}

function estaOculto(id) {
  return leer().ocultos.includes(id);
}

function alternarOculto(id) {
  const e = leer();
  const ocultos = e.ocultos.includes(id)
    ? e.ocultos.filter((x) => x !== id)
    : [...e.ocultos, id];
  return actualizar({ ocultos });
}

function anadirProducto({ categoria, nombre, precio, ingredientes }) {
  const e = leer();
  const limpio = String(nombre || '').trim();
  if (!limpio || !TIPO_POR_CATEGORIA[categoria]) return e;
  /* Id con marca de tiempo: no hay servidor que reparta identificadores
     y dos productos con el mismo id serían el mismo producto. */
  const nuevo = {
    id: 'nuevo-' + Date.now().toString(36),
    categoria,
    nombre: limpio,
    tipo: TIPO_POR_CATEGORIA[categoria],
    precio: Math.max(0, Math.round((Number(precio) || 0) * 100) / 100),
    ingredientes: String(ingredientes || '').trim(),
    etiquetas: [],
  };
  return actualizar({ nuevos: [...e.nuevos, nuevo] });
}

/* Solo se borran los añadidos por el local. Y se barre lo que
   hubiera escrito sobre ellos, que si no quedan huérfanos. */
function borrarProducto(id) {
  const e = leer();
  if (!e.nuevos.some((p) => p.id === id)) return e;
  const precios = { ...e.precios }; delete precios[id];
  const nombres = { ...e.nombres }; delete nombres[id];
  return actualizar({
    nuevos: e.nuevos.filter((p) => p.id !== id),
    precios, nombres,
    agotados: e.agotados.filter((x) => x !== id),
    ocultos: e.ocultos.filter((x) => x !== id),
  });
}

/* Devuelve la carta con nombres, precios y disponibilidad ya aplicados
   y sin lo que el local ha quitado, para que ni la web ni el panel
   tengan que acordarse de hacerlo. */
function cartaVigente() {
  return montarCarta(false);
}

/* La misma, pero SIN esconder nada: es la que ve el panel, porque para
   devolver un producto a la carta hay que poder verlo. */
function cartaCompleta() {
  return montarCarta(true);
}

function montarCarta(conOcultos) {
  const e = leer();
  const aplicar = (p) => ({
    ...p,
    nombre: e.nombres[p.id] ?? p.nombre,
    nombreOriginal: p.nombre,
    precio: e.precios[p.id] ?? p.precio,
    precioOriginal: p.precio,
    agotado: e.agotados.includes(p.id),
    oculto: e.ocultos.includes(p.id),
    etiquetas: p.etiquetas || [],
    anadido: e.nuevos.some((n) => n.id === p.id),
  });
  const visible = (p) => conOcultos || !p.oculto;
  const nuevosDe = (idCategoria) => e.nuevos
    .filter((p) => p.categoria === idCategoria).map(aplicar).filter(visible);

  return {
    categorias: CARTA.categorias.map((c) => ({
      ...c,
      productos: [...c.productos.map(aplicar).filter(visible), ...nuevosDe(c.id)],
    })),
    tienda: CARTA.tienda.map(aplicar).filter(visible),
    extras: CARTA.extras,
  };
}

function todosLosProductos() {
  const v = cartaVigente();
  return [...v.categorias.flatMap((c) => c.productos), ...v.tienda];
}

/* ------------------------------------------------------------
   EL HORARIO QUE PONE EL LOCAL
   ------------------------------------------------------------
   Igual que la carta: aquí solo se guarda LO QUE HA CAMBIADO. El
   horario de fábrica sigue en `horno.js` y no se toca, así que
   «volver al de siempre» es borrar esto y ya.

   `null` en un grupo significa CERRADO ese día, que es distinto de
   no haber tocado el grupo: lo primero es una decisión del local,
   lo segundo es que vale el de fábrica.
   ------------------------------------------------------------ */
function horario() {
  return leer().horario;
}

function fijarHorario(grupo, cfg) {
  const e = leer();
  return actualizar({ horario: { ...(e.horario || {}), [grupo]: cfg } });
}

function restablecerHorario() {
  return actualizar({ horario: null });
}

/* ------------------------------------------------------------
   LA COMISIÓN DE CADA AGREGADOR
   ------------------------------------------------------------
   UNA POR PLATAFORMA, no una sola: Just Eat y Uber Eats no cobran lo
   mismo, y el local tiene negociada la suya con cada una. Igual que
   los precios de la carta, aquí solo se guarda lo que haya cambiado;
   la estimación de partida vive junto a cada agregador en
   `contenido.js`.

   Y es un SUPUESTO, no una factura. Por eso el panel lo dice al lado
   del número, valga lo que valga.
   ------------------------------------------------------------ */
function agregadores() {
  return (window.CONTENIDO && window.CONTENIDO.agregadores.enlaces) || [];
}

function comision(id) {
  const puesta = leer().comisiones || {};
  if (typeof puesta[id] === 'number') return puesta[id];
  const base = agregadores().find((a) => a.id === id);
  return base ? base.comision : 0;
}

function fijarComision(id, pct) {
  const e = leer();
  const n = Math.min(100, Math.max(0, Math.round(Number(pct) || 0)));
  return actualizar({ comisiones: { ...(e.comisiones || {}), [id]: n } });
}

/* Cuántos clientes se nos van al agregador y desde dónde.
   Si el argumento del barrio andable funciona, este número baja.
   Medirlo es lo que convierte una intuición en una decisión. */
function contarSalida(idAgregador, desde) {
  const e = leer();
  const salidas = { ...(e.salidas || {}) };
  const clave = idAgregador + '|' + desde;
  salidas[clave] = (salidas[clave] || 0) + 1;
  return actualizar({ salidas });
}

const salidas = () => leer().salidas || {};

function reiniciar() {
  try { localStorage.removeItem(CLAVE); } catch (e) { /* nada */ }
}

window.Negocio = {
  leer, guardar, actualizar,
  precioDe, estaAgotado, alternarAgotado,
  fijarPrecio, restablecerPrecio,
  nombreDe, fijarNombre, restablecerNombre,
  estaOculto, alternarOculto,
  anadirProducto, borrarProducto,
  horario, fijarHorario, restablecerHorario,
  comision, fijarComision, agregadores,
  cartaVigente, cartaCompleta, todosLosProductos, reiniciar,
  contarSalida, salidas,
  TIPO_POR_CATEGORIA,
};

})();
