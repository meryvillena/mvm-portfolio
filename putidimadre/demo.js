/* ============================================================
   PUTI DI MADRE — EL PANEL DE DEMO, UNO SOLO
   ------------------------------------------------------------
   Había DOS paneles de demo, uno en cada pantalla, cada uno con su
   markup, sus estilos y su estado. Lo vio Mery saltando de una a
   otra: «debería ser el mismo panel tanto si entro por la web del
   cliente como si entro por la del local».

   Y no era solo que se parecieran poco. Eran dos mundos simulados
   distintos: movías la hora en la web, saltabas al panel y el panel
   seguía en la suya. Exactamente el mismo fallo que el 13/10 tenía
   el reloj de arranque, repetido en cada control.

   Aquí viven los tres mandos que describen EL MUNDO —qué día es,
   qué hora es y qué semilla reparte los pedidos— más la pausa del
   local. Son los que tienen sentido en las dos pantallas, porque
   describen la misma noche.

   Lo que NO vive aquí son los interruptores que solo existen a un
   lado: el titular del hero, agotar algo del carrito o forzar un
   error de red no significan nada en la cocina. Cada pantalla los
   pasa en `extra` y se pintan debajo, en su propio grupo y dichos
   como lo que son. Un panel común no es un panel con todo dentro:
   es uno donde lo compartido se llama igual y está en el mismo
   sitio.

   EL ESTADO SE GUARDA, como el de `negocio.js` y por lo mismo: es
   lo que permite que saltar de pantalla no reinicie el escenario
   que acabas de montar. Y si tienes las dos abiertas en dos
   pestañas, el evento `storage` las mantiene a la par.

   En producción nada de esto existe: la hora la pone el reloj y el
   día lo pone el calendario.
   ============================================================ */

/* Encapsulado: al ser scripts planos, sin esto los nombres internos
   chocan entre archivos. */
(function () {
'use strict';

const H = window.Horno;
const LLAVE = 'pdm-demo';

const DIAS_ES = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves',
  viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

/* El punto de partida sale de `Horno.DEMO`, que es donde está
   explicado por qué esa hora y no otra. */
const porDefecto = () => ({ ...H.DEMO, pausado: false });

let estado = porDefecto();
const oyentes = [];

function leer() {
  try {
    const guardado = JSON.parse(localStorage.getItem(LLAVE) || 'null');
    estado = guardado ? { ...porDefecto(), ...guardado } : porDefecto();
  } catch (e) {
    // Modo privado, almacenamiento lleno o un JSON a medias: la demo
    // sigue funcionando, simplemente no recuerda nada entre pantallas.
    estado = porDefecto();
  }
  return estado;
}

function guardar() {
  try { localStorage.setItem(LLAVE, JSON.stringify(estado)); } catch (e) { /* ver leer() */ }
}

function fijar(parcial) {
  estado = { ...estado, ...parcial };
  guardar();
  avisar();
}

/* «Reiniciar» quiere decir dejarlo COMO LO ENCONTRASTE, no solo poner
   la hora de vuelta: el botón de antes vaciaba además la caja y
   recargaba, y si esto se quedara a medias la demo volvería al punto de
   partida con un calzone dentro. Cada pantalla dice en `alReiniciar` lo
   suyo —el carrito es cosa de la web, no de la cocina— y luego se
   recarga, que es lo único que garantiza que no quede nada en pie. */
let limpiezaExtra = null;

function reiniciar() {
  estado = porDefecto();
  guardar();
  if (limpiezaExtra) limpiezaExtra();
  location.reload();
}

function avisar() { oyentes.forEach((f) => f(estado)); }
function alCambiar(f) { oyentes.push(f); }

/* ------------------------------------------------------------
   LOS MANDOS
   ------------------------------------------------------------ */

/* Los `id` empiezan por `demo-` en las dos pantallas, a propósito:
   antes eran `d-hora` aquí y `p-hora` allí, y ese prefijo distinto
   era la prueba de que nadie los consideraba el mismo control. */
function pintar(caja, extra) {
  caja.innerHTML = `
    <div class="demo__grid">
      <label>Día de servicio
        <select id="demo-dia">
          ${H.SEMANA.map((d) => `<option value="${d}"${d === estado.dia ? ' selected' : ''}>${
            DIAS_ES[d]}${H.dias()[d] ? '' : ' (cerrado)'}</option>`).join('')}
        </select>
      </label>
      <label>Hora simulada
        <!-- Desde las 12:00: de jueves a sábado el turno empieza a las 13:00. -->
        <input type="range" id="demo-hora" min="720" max="1500" step="5" value="${estado.ahora}">
        <output id="demo-hora-out">${H.formatoHora(estado.ahora)}</output>
      </label>
      <label>Semilla de ocupación
        <input type="number" id="demo-semilla" min="1" max="999" value="${estado.semilla}">
      </label>
      <div class="demo__botones">
        <button type="button" id="demo-pausa">${
          estado.pausado ? 'Reanudar local' : 'Pausar local'}</button>
        <button type="button" id="demo-reset">Reiniciar la demo</button>
      </div>
      ${extra || ''}
      <p class="demo__estado" id="demo-estado"></p>
    </div>`;

  const $ = (s) => caja.querySelector(s);
  $('#demo-dia').addEventListener('change', (e) => fijar({ dia: e.target.value }));
  $('#demo-hora').addEventListener('input', (e) => fijar({ ahora: +e.target.value }));
  $('#demo-semilla').addEventListener('input', (e) => fijar({ semilla: +e.target.value || 1 }));
  $('#demo-pausa').addEventListener('click', () => fijar({ pausado: !estado.pausado }));
  $('#demo-reset').addEventListener('click', reiniciar);
}

/* Repintar los mandos sin volver a montarlos: hace falta cuando el
   cambio no viene de aquí —lo movió la otra pestaña, o lo cambió el
   botón de escenario de la web—. */
function refrescar(caja) {
  const v = (s) => caja.querySelector(s);
  if (!v('#demo-hora')) return;
  v('#demo-dia').value = estado.dia;
  v('#demo-hora').value = estado.ahora;
  v('#demo-hora-out').textContent = H.formatoHora(estado.ahora);
  v('#demo-semilla').value = estado.semilla;
  v('#demo-pausa').textContent = estado.pausado ? 'Reanudar local' : 'Pausar local';
}

/* La línea de abajo la escribe cada pantalla: la web cuenta franjas
   ofrecibles y el panel cuenta pedidos, y eso sí es distinto. */
function decirEstado(caja, texto) {
  const p = caja.querySelector('#demo-estado');
  if (p) p.textContent = texto;
}

/* Monta el panel y deja enganchada la pantalla. `alPintar` se llama
   con cada cambio, venga de donde venga. */
function montar(caja, opciones) {
  const o = opciones || {};
  limpiezaExtra = o.alReiniciar || null;
  pintar(caja, o.extra);
  alCambiar(() => { refrescar(caja); if (o.alPintar) o.alPintar(estado); });
  // La otra pestaña, si la hay.
  window.addEventListener('storage', (e) => {
    if (e.key !== LLAVE) return;
    leer();
    refrescar(caja);
    if (o.alPintar) o.alPintar(estado);
  });
  return estado;
}

/* SE LEE AL CARGAR, antes de que `app.js` o `panel.js` monten su
   estado. Si se leyera dentro de `montar()` llegaría tarde: la pantalla
   ya habría arrancado con los valores de fábrica y los mandos enseñarían
   una cosa mientras el motor calculaba con otra. Pasó: el panel dejaba
   el local en pausa, la web pintaba el mando «Reanudar» y seguía
   ofreciendo catorce franjas. */
leer();

window.Demo = { montar, refrescar, decirEstado, fijar, reiniciar, alCambiar,
                estado: () => estado, LLAVE };

})();
