/* ############################################################
   COMPONENTE · LA FILA DE PRODUCTO
   La misma pieza para la carta y para el merchan. Ya lo era —vivía como
   `filaProducto()` dentro de `app.js` desde el 18 de agosto, con esta
   nota puesta: «si algún día hay que cambiar cómo se ve un producto, se
   cambia AQUÍ y cambia en los dos sitios»— pero vivía escondida.

   ------------------------------------------------------------
   POR QUÉ ESTE SE COMPARTE CON UNA FUNCIÓN Y NO CON UNA HOJA
   ------------------------------------------------------------
   El botón, el campo y el tick se comparten con su CSS: su forma no
   cambia nunca, solo su relleno. Esta no. Una fila depende de datos —el
   nombre, los ingredientes, el precio, si está agotada, cuántas llevas—
   así que congelarla en HTML sería enseñar una foto de un momento.

   Se comparte como la llama (`componentes/llama.js`): una función a la
   que le dices los datos y te devuelve la pieza montada. Es la misma
   idea que una componente con propiedades.

   ------------------------------------------------------------
   LO QUE ESTE ARCHIVO NO SABE, Y ES A PROPÓSITO
   ------------------------------------------------------------
   **No sabe qué llevas en la caja.** Antes sí: llamaba por dentro a
   `unidadesEnCaja()` y a `unidadesTocadas()`, que son estado de la
   aplicación. Por eso no se podía enseñar en un muestrario — fuera de
   la web no había caja a la que preguntar, y la pieza no existía.

   Ahora se le dicen: `crear(p, { unidades: 2, tocadas: 1 })`. El que
   sabe lo que hay en la caja es quien llama, que para eso es su trabajo.
   Igual que la llama, que no sabe nada de ocupación: le dices un nivel
   y te da una llama.

   Lo que SÍ sabe es qué es un producto y qué extras lleva la carta, que
   es su asunto.

   Y lo que necesita de fuera lo pide en voz alta, una vez, en `usa()`:
   un componente que va a buscarse la vida por su cuenta es un
   componente que solo funciona en la casa donde nació.
   ############################################################ */
(function () {
  'use strict';

  var eur = function (n) { return n.toFixed(2).replace('.', ',') + ' €'; };

  /* Lo de fuera que hace falta. Se inyecta una vez al arrancar. */
  function usa(deps) { if (deps && deps.eur) eur = deps.eur; }

  /* ============================================================
     LA FILA
     ------------------------------------------------------------
     crear(p, opts) → <article class="pz">

     opts:
       agotado          si no queda
       unidades         cuántas llevas SIN tocar (para el contador)
       tocadas          cuántas llevas personalizadas (para el aviso)
       etiquetaAgotado  «Agotada» en la carta, «Agotado» en la tienda
       notaAgotado      qué se dice en vez del botón
     ============================================================ */
  function crear(p, opts) {
    opts = opts || {};
    var agotado = !!opts.agotado;
    var art = document.createElement('article');
    art.className = 'pz' + (agotado ? ' pz--off' : '');
    if (!agotado) art.dataset.fila = p.id;
    art.innerHTML =
      '<button type="button" class="pz__foto" data-abrir="' + p.id + '"' +
      '    aria-label="Ver ' + p.nombre + ' en grande">' +
      /* `lazy`: las 24 fotos de la carta están en el DOM desde que carga
         la página, y sin esto el navegador se las bajaba TODAS de golpe
         —11,9 MB en la primera visita— cuando la carta ni se ve todavía.
         `async` saca el decodificado del hilo que pinta. */
      (p.imagen ? '<img src="' + p.imagen + '" alt="" loading="lazy" decoding="async">' : '<span>foto · ' +
        (p.tipo === 'merch' ? '1:1' : '3:2') + '</span>') + '</button>' +
      '<div class="pz__cuerpo">' +
      /* El nombre abre la ficha, igual que la foto. Sin esto, la única
         puerta a la personalización sería una foto, y a nadie se le
         ocurre pulsar una foto. */
        '<p class="pz__nom">' + (agotado
          ? p.nombre
          : '<button type="button" class="pz__nombre-btn" data-abrir="' + p.id + '">' + p.nombre + '</button>') +
          (agotado ? '<span class="pz__ago">' + (opts.etiquetaAgotado || 'Agotada') + '</span>' : '') +
        '</p>' +
        '<p class="pz__ing">' + p.ingredientes + '</p>' +
        '<p class="pz__eti">' + p.etiquetas.map(function (t) {
          return '<span class="tag">' + t + '</span>'; }).join('') + '</p>' +
      '</div>' +
      '<div class="pz__pie">' +
        '<span class="pz__precio">' + eur(p.precio) + '</span>' +
        '<span class="pz__accion">' + accion(p, opts) + '</span>' +
        (agotado ? '' : aviso(opts.tocadas)) +
      '</div>' +
      (agotado ? '' : '<div class="pz__panel" hidden></div>');
    return art;
  }

  /* ============================================================
     LA ACCIÓN · lo que va a la derecha del precio
     ------------------------------------------------------------
     Tres estados, y el del medio es la regla que más cuesta contar:

       agotado        la nota, sin botón
       sin llevar     un «+»
       llevando n     − n + , para saber cuántas tienes sin ir al
                      carrito a mirarlo

     **Y qué hace ese «+» no lo decide este archivo, lo decide el
     producto.** Si hay algo que elegir —extras, quitables o una talla
     obligatoria— el «+» DESPLIEGA el panel; si no hay nada que decidir
     —una cerveza, un tiramisú— METE directo. Por eso la etiqueta que
     oye un lector de pantalla cambia: «Elegir opciones de…» o «Añadir…
     a la caja». Dos frases distintas porque son dos gestos distintos, y
     prometer el que no es sería mentir a quien no ve el panel abrirse.

     OJO CON LAS DOS PREGUNTAS, QUE PARECEN LA MISMA Y NO LO SON:

       hayQueDecidir(p)     ¿el «+» despliega el panel?
       tieneObligatorio(p)  ¿esta fila puede tener contador?

     Una pizza responde SÍ a la primera y NO a la segunda: su «+»
     despliega, pero en cuanto llevas una aparece el «− n +», porque
     puedes pedir otra igual sin volver a decidir nada. Una camiseta
     responde sí a las dos, y por eso NUNCA tiene contador: dos
     camisetas pueden ser de tallas distintas, así que sumar de una en
     una sin preguntar sería inventarse la talla de la segunda.

     Y el «+» del contador no despliega: un contador que en vez de
     sumar abre un panel deja de ser un contador. Por eso solo despliega
     el que lleva la clase `mas`.
     ============================================================ */
  function accion(p, opts) {
    opts = opts || {};
    if (opts.agotado) {
      return '<em class="pz__nota">' + (opts.notaAgotado || 'La última acaba de salir') + '</em>';
    }
    var n = opts.unidades || 0;
    if (tieneObligatorio(p) || !n) {
      /* LA ETIQUETA CUENTA LO QUE VA A PASAR, y esto se arregló el
         25/08/2026. Antes la frase la decidía «¿tiene talla obligatoria?»,
         que es OTRA pregunta: una pizza no la tiene, así que caía en la
         rama de «Añadir a la caja» y prometía meterla cuando lo que hace
         es desplegar el panel. Quien ve la pantalla no se entera del
         desajuste, porque ve abrirse el panel. Quien no la ve, pulsa
         «añadir» y no pasa nada.

         Ahora la decide la misma pregunta que decide el gesto, así que no
         pueden separarse: si el «+» despliega, la etiqueta lo dice.

         Las palabras salen del propio panel —«Ponle», «Quítale»— para no
         estrenar vocabulario de interfaz en una marca que habla como un
         local de barrio. */
      /* TRES casos, no dos, y el del medio es el que faltaba:
           hay algo obligatorio   una talla que elegir     → «Elegir…»
           hay algo opcional      extras y quitables       → «Ponerle y quitarle…»
           no hay nada            una cerveza              → «Añadir…»
         A una camiseta no se le pone ni se le quita nada: se le elige la
         talla. Meterlas todas en la misma frase era volver a describir
         dos gestos distintos con una sola palabra. */
      var frase = tieneObligatorio(p) ? 'Elegir opciones de ' + p.nombre
                : hayQueDecidir(p)    ? 'Ponerle y quitarle a ' + p.nombre
                :                       'Añadir ' + p.nombre + ' a la caja';
      /* El «+» va dentro de un <span> para poder girarlo SOLO a él.
         Girando el botón entero, el cuadrado se convertía en rombo. */
      return '<button type="button" class="btn btn--primario btn--signo mas" data-prod="' + p.id + '"' +
             '  aria-label="' + frase + '"><span class="mas__signo">+</span></button>';
    }
    /* EL CONTADOR DICE DE QUÉ ES, y esto se decidió el 09/10/2026.
       Con el panel desplegado hay DOS «− n +» a 300 px uno de otro y
       significan cosas distintas: este son las que ya llevas en la caja
       —el «−» quita del pedido— y el de abajo las que vas a meter ahora
       con lo que marques. El de abajo se explica solo, porque al lado
       tiene «Meterla en la caja»; este no tenía nombre.

       Se ROTULA, no se esconde. Esconderlo con el panel abierto tapa el
       problema solo en el momento en que coinciden, y deja la fila sin
       nombre el resto del tiempo, que es como se ve casi siempre. */
    return '<span class="pz__cant-rot">En tu caja</span>' +
      '<span class="pz__cant">' +
      '<button type="button" class="btn btn--secundario btn--signo btn--mini" data-quita="' + p.id + '"' +
      '  aria-label="Quitar una ' + p.nombre + ' de la caja">−</button>' +
      '<span class="pz__n" aria-live="polite" aria-atomic="true">' + n + '</span>' +
      '<button type="button" class="btn btn--secundario btn--signo btn--mini" data-prod="' + p.id + '"' +
      '  aria-label="Añadir otra ' + p.nombre + ' a la caja">+</button>' +
    '</span>';
  }

  /* Aviso de que además llevas unidades tocadas de este mismo producto.
     No lleva controles a propósito: tocarlas desde aquí obligaría a
     elegir cuál, y eso ya se hace en el carrito, donde cada una enseña
     lo que lleva. Aquí solo se avisa para que el contador no parezca
     que miente. */
  function aviso(tocadas) {
    return tocadas ? '<span class="pz__tocadas">y ' + tocadas + ' a tu manera</span>' : '';
  }

  /* ============================================================
     ¿HAY ALGO QUE DECIDIR?
     ------------------------------------------------------------
     La pregunta que gobierna toda la fila, y hasta hoy no tenía nombre:
     vivía repetida como `(p.opciones || []).length` en la acción y como
     `panelFila(p)` en el manejador del clic. Dos sitios calculando lo
     mismo de dos maneras distintas es como se separan las cosas.

     Ahora se pregunta una vez y se llama igual en los dos sitios.
     ============================================================ */
  function hayQueDecidir(p) {
    return !!(extrasDe(p).length || (p.quitables || []).length || (p.opciones || []).length);
  }

  /* Lo obligatorio es lo que no podemos elegir por ti: la talla. Mientras
     haya uno sin responder, la fila no puede tener contador. */
  function tieneObligatorio(p) {
    return !!(p.opciones || []).length;
  }

  /* Los extras son de la carta, no del producto: se le pueden poner a
     una pizza o a un calzone, y a nada más. */
  function extrasDe(p) {
    var C = window.CARTA;
    return (p.tipo === 'pizza' || p.tipo === 'calzone') && C ? (C.extras || []) : [];
  }

  /* ============================================================
     EL PANEL que se despliega DEBAJO de la fila
     ------------------------------------------------------------
     Lleva los mismos ticks que la ficha, pero sin salir del listado:
     son dos vistas de la carta y cada una sirve para una cosa.

       pulsar el «+»   se despliega aquí, sigues viendo la lista
       pulsar la foto  ficha entera, foto grande y flechas

     Devuelve texto vacío si no hay nada que decidir, y quien llama usa
     eso mismo para saber si el «+» despliega o mete.
     ============================================================ */
  function panel(p) {
    var extras = extrasDe(p);
    var quitables = p.quitables || [];
    var opciones = p.opciones || [];
    if (!extras.length && !quitables.length && !opciones.length) return '';

    var obligatorio = opciones.map(function (o) {
      return '<fieldset class="pzp__g pzp__g--obliga" data-grupo="' + o.id + '">' +
        '<legend class="pzp__tit">' + o.nombre + ' · obligatorio</legend>' +
        '<div class="pzp__rej pzp__rej--fila">' +
          o.valores.map(function (val) {
            return '<label class="tick tick--peq">' +
              '<input type="radio" name="pf-' + p.id + '-' + o.id + '" data-opcion="' + o.id + '" value="' + val + '">' +
              '<span class="tick__txt">' + val + '</span></label>'; }).join('') +
        '</div></fieldset>'; }).join('');

    var ponle = !extras.length ? '' :
      '<fieldset class="pzp__g"><legend class="pzp__tit">Ponle</legend>' +
        '<div class="pzp__rej">' + extras.map(function (e) {
          return '<label class="tick tick--peq">' +
            '<input type="checkbox" data-extra="' + e.id + '" value="' + e.id + '">' +
            '<span class="tick__txt">' + e.nombre + '<b>+' + eur(e.precio) + '</b></span></label>';
        }).join('') + '</div></fieldset>';

    var quitale = !quitables.length ? '' :
      '<fieldset class="pzp__g pzp__g--quitar"><legend class="pzp__tit">Quítale</legend>' +
        '<div class="pzp__rej">' + quitables.map(function (q) {
          return '<label class="tick tick--peq">' +
            '<input type="checkbox" data-quitable="' + q.id + '" value="' + q.id + '"' +
            '       data-alergeno="' + (q.alergeno || '') + '">' +
            '<span class="tick__txt">Sin ' + q.nombre.toLowerCase() + '</span></label>';
        }).join('') + '</div></fieldset>';

    return '<div class="pzp">' + obligatorio + ponle + quitale +
      '<p class="pzp__alerg" data-alerg>' +
        (p.alergenos ? '<strong>Alérgenos:</strong> ' + p.alergenos : '') + '</p>' +
      '<p class="pzp__error" role="alert" hidden></p>' +
      '<p class="pzp__pie">' +
        /* CANTIDAD Y PRECIO TOTAL. Sin esto, dos pizzas iguales había que
           meterlas de una en una: abrir, marcar, meter y otra vez desde
           cero. Y el botón anunciaba la acción pero no lo que costaba,
           que es justo el dato que ayuda a decidir. */
        '<span class="pzp__cant">' +
          '<button type="button" class="btn btn--secundario btn--signo btn--mini" data-cant="-1"' +
          '  aria-label="Una menos">−</button>' +
          '<span class="pzp__n" data-n aria-live="polite" aria-atomic="true">1</span>' +
          '<button type="button" class="btn btn--secundario btn--signo btn--mini" data-cant="1"' +
          '  aria-label="Una más">+</button>' +
        '</span>' +
        /* El botón NOMBRA LA CANTIDAD, y esto se arregló el 06/09/2026.
           Decía «Meterla en la caja» en singular aunque el contador de al
           lado pusiera 3: la frase y la cifra se contradecían a 20 px una
           de otra. Ahora la frase sale del contador, y quien la mantiene
           al día es `refrescarTotal()`. */
        '<button type="button" class="btn btn--peq" data-meter="' + p.id + '">' +
          '<span data-verbo>' + verbo(p, 1) + '</span>' +
          ' · <span data-total>' + eur(p.precio) + '</span></button>' +
        (quitables.length ? '<span class="pzp__nota">Quitar no descuenta</span>' : '') +
      '</p></div>';
  }

  /* Una frase por cantidad. En singular la marca habla como el local
     —«Meterla en la caja»—; en plural hay que decir cuántas, porque si no
     el botón promete una cosa y el contador otra. */
  function verbo(p, n) {
    if (p.tipo === 'merch') return n > 1 ? 'Añadir ' + n + ' a la caja' : 'Añadir a la caja';
    return n > 1 ? 'Meter ' + n + ' en la caja' : 'Meterla en la caja';
  }

  window.FilaProducto = {
    usa: usa, crear: crear, panel: panel,
    accion: accion, aviso: aviso, verbo: verbo,
    hayQueDecidir: hayQueDecidir, tieneObligatorio: tieneObligatorio,
  };
}());
