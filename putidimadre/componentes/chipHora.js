/* ############################################################
   COMPONENTE · EL CHIP DE HORA
   El marcado de la pieza que enseña una franja del horno. El aspecto
   vive al lado, en `chipHora.css`; aquí solo se decide QUÉ ETIQUETA
   lleva y SI ES UN BOTÓN.

   ------------------------------------------------------------
   LO QUE ESTE ARCHIVO NO SABE, Y ES TODO
   ------------------------------------------------------------
   No sabe qué hora es, ni cuánto ocupa tu pedido, ni si el local está
   en pausa, ni qué promos hay. **No conoce el motor del horno.** Se le
   dan cinco datos ya masticados y devuelve un chip:

     hora           «21:15», ya formateada
     rotulo         lo que va debajo, en pequeño
     estado         pocasPlazas · completa · noCabe · cerrada · libre
     nivel          rescoldo · brasa · llama-viva  (pinta la barra)
     seleccionable  si se puede pulsar
     seleccionado   si es la que has marcado
     promo          la etiqueta de la pegatina, o nada

   Es la misma frontera que la fila de producto y que la llama: el
   componente sabe pintar una franja, no sabe si TU pedido cabe en ella.
   Quien lo sabe es `horno.js`, que para eso es el motor.

   Esa frontera es la que permite enseñar los cinco estados en un
   muestrario sin tener que simular un pedido entero.

   ------------------------------------------------------------
   LA REGLA QUE NO SE TOCA
   ------------------------------------------------------------
   **Lo bloqueado no es un botón.** Un chip que no se puede elegir se
   pinta como `<span>`, no como `<button>` desactivado: anunciarlo como
   pulsable es mentirle al teclado y al lector de pantalla. Sigue
   respondiendo al ratón —mirar una hora llena también es información,
   alimenta la llama grande— pero no entra en el recorrido del tabulador
   y no promete nada.
   ############################################################ */
(function () {
  'use strict';

  /* Los estados en los que un chip se puede pulsar. Vive aquí y no en el
     que llama para que el muestrario pueda preguntarlo sin arrancar el
     motor del horno. */
  var BLOQUEADOS = ['completa', 'noCabe', 'cerrada'];

  function crear(d) {
    var clases = 'chip chip--' + d.estado + (d.seleccionado ? ' chip--sel' : '');
    var dentro = d.hora +
      '<small>' + d.rotulo + '</small>' +
      (d.promo ? '<span class="chip__promo">' + d.promo +
        (d.promoCola ? '<span class="chip__promo-cola">' + d.promoCola + '</span>' : '') +
        '</span>' : '');

    /* `data-mira` lo llevan los DOS, pulsables y bloqueados: es lo que
       alimenta la llama grande al pasar por encima. `data-franja` solo
       los pulsables, porque es lo que dice «esta se puede elegir». */
    if (!d.seleccionable) {
      return '<span class="' + clases + '" data-mira="' + d.id +
             '" data-nivel="' + d.nivel + '">' + dentro + '</span>';
    }
    return '<button type="button" class="' + clases + '" data-franja="' + d.id +
           '" data-mira="' + d.id + '" data-nivel="' + d.nivel +
           '" aria-pressed="' + (d.seleccionado ? 'true' : 'false') + '">' +
           dentro + '</button>';
  }

  window.ChipHora = { crear: crear, BLOQUEADOS: BLOQUEADOS };
}());
