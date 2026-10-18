/* ############################################################
   COMPONENTE · LA LLAMA
   Vive en su propio archivo por el mismo motivo que el botón y los
   tokens: lo leen la web Y el muestrario. Antes los trazos y la escala
   estaban dentro del cierre de `app.js`, así que cualquier sitio que
   quisiera enseñar la llama tenía que COPIARLOS. Y una copia enseña el
   componente que había el día que se copió, no el que hay hoy.

   Aquí solo vive el DIBUJO y su ESCALA. El vocabulario y las frases
   siguen en `contenido.js`, y quién está en qué nivel lo deciden
   `nivelDelHorno()` y `nivelDeFranja()` en `app.js`. Este archivo no
   sabe nada de ocupación: le dices un nivel y te da una llama.
   ############################################################ */
(function () {
  'use strict';

  /* Los tres trazos, los mismos del hero (§04 del sistema). El del hero
     está escrito a mano dentro de `index.html`; este es el que usa todo
     lo que se pinta desde JS. */
  var TRAZOS =
    '<path class="fuego__ext" d="M100 214 C48 190 40 138 68 100 C74 122 88 128 92 112 ' +
    'C98 78 76 58 88 24 C126 56 156 84 154 132 C152 176 132 200 100 214 Z"/>' +
    '<path class="fuego__med" d="M100 214 C68 198 62 162 80 136 C84 150 94 154 97 144 ' +
    'C101 122 88 108 96 84 C120 106 138 124 137 156 C136 186 120 204 100 214 Z"/>' +
    '<path class="fuego__int" d="M100 214 C84 205 80 184 89 170 C91 178 96 180 98 175 ' +
    'C100 163 94 156 98 143 C110 155 119 165 119 182 C118 198 110 208 100 214 Z"/>';

  /* El TAMAÑO salta por NIVEL, no por la carga exacta.

     Antes se calculaba con la ocupación real y salían quince llamas casi
     iguales: dos franjas que ponían las dos "hay hueco" tenían llamas de
     distinto tamaño sin que ese milímetro significara nada. Una llama que
     no se puede comparar con la de al lado no informa: decora.

     Un tamaño por nivel. Dentro de un nivel todas las franjas se ven
     idénticas —porque dicen lo mismo— y entre niveles el salto es
     inconfundible. */
  var ESCALA = {
    'apagado':           'scale(0.50, 0.22)',
    'rescoldo':          'scale(0.62, 0.40)',
    'brasa':             'scale(0.78, 0.62)',
    /* ESTA ERA LA LLAMA DE `siguiente-hornada` (0.90, 0.87), y se queda
       aquí al retirarse aquel nivel: era la más grande que todavía se
       podía pedir, y ahora la más grande que todavía se puede pedir es
       esta. `llama-viva` valía 0.86/0.80 y sube. Sigue por debajo de
       `no-da-mas`, que es donde se acaba. */
    'llama-viva':        'scale(0.90, 0.87)',
    'no-da-mas':         'scale(0.91, 0.885)',
  };

  /* Los cinco niveles EN ORDEN de calor. El orden es dato: es el que usa
     el muestrario para enseñar la escalada, y el que hay que mirar para
     decidir si dos niveles contiguos se distinguen de verdad. Fueron seis
     hasta el 23/08/2026 — ver la nota de `siguiente-hornada` arriba. */
  var ORDEN = ['apagado', 'rescoldo', 'brasa', 'llama-viva', 'no-da-mas'];

  /**
   * Una llama de un nivel. `clase` es la del contenedor —`fj__svg` en las
   * franjas, `horno-cal__svg` en el hero—, y no es un detalle: LOS DOS
   * SITIOS PINTAN LA LLAMA DE COLORES DISTINTOS, así que el mismo nivel
   * no se ve igual en los dos. Ver el muestrario.
   */
  function svg(nivelId, clase) {
    var esc = ESCALA[nivelId] || ESCALA.rescoldo;
    return '<svg class="' + (clase || 'fj__svg') + '" viewBox="0 0 200 230" aria-hidden="true">' +
      '<path class="boca" d="M18 214 Q100 188 182 214 L182 224 Q100 200 18 224 Z"/>' +
      '<g class="fuego" data-nivel="' + nivelId + '" style="transform:' + esc + '">' +
      TRAZOS + '</g></svg>';
  }

  window.Llama = { TRAZOS: TRAZOS, ESCALA: ESCALA, ORDEN: ORDEN, svg: svg };
}());
