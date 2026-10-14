/* ============================================================
   PUTI DI MADRE — Contenido editorial
   ------------------------------------------------------------
   Todo el texto que no es carta ni interfaz vive aquí, separado
   del código que lo pinta. Es el archivo que se toca para
   trabajar el copy sin abrir app.js.
   ============================================================ */

const CONTENIDO = {

  /* Titulares de hero — §6 de la Fase 01.
     El primero es el recomendado; el resto quedan disponibles
     en el panel de demo para poder compararlos en pantalla. */
  heroes: [
    { titular: 'Muy fina de masa.<br>Poco fina de modales.',
      apoyo: 'Pizza al horno de leña para pedir ahora y recoger cuando esté lista. Sin colas. Sin comisiones.',
      recomendado: true },
    { titular: 'El barrio tiene hambre.<br>El horno tiene un límite.',
      apoyo: 'Pide ahora, elige tu hora y ven a recoger.' },
    { titular: 'De nuestro horno<br>a tus manos.',
      apoyo: 'Sin riders, sin rodeos y sin llegar antes que tu pizza.' },
    { titular: 'Una pizza de puta madre.<br>Una recogida bien montada.',
      apoyo: 'Tú eliges. Nosotros te decimos cuándo venir.' },
    { titular: 'Aquí la masa es fina.<br>La espera, también.',
      apoyo: 'Reserva una hora y recoge sin hacer cola.' },
    { titular: 'Pide. Pasea.<br>Recoge. Devora.',
      apoyo: 'Pizza de barrio lista cuando llegues.' },
  ],

  /* ----------------------------------------------------------
     NIVELES DEL HORNO — el indicador del hero.

     La llama no es adorno: dice si puedes pedir ahora o no.
     Aquí vive el vocabulario, para poder hablar de "a tope" o
     "no da más" en vez de "carga 0,8".

     Cinco niveles. Tres salen de la carga (el pico de ocupación
     de las próximas dos horas, de 0 a 1) y se evalúan en orden
     usando 'hasta' como tope. Los otros dos NO salen de un
     porcentaje, salen de un hecho:
       · apagado  — el local está cerrado o en pausa
       · no-da-mas — no queda NINGUNA franja que admita tu pedido

     Hubo un sexto, 'siguiente-hornada', retirado el 23/08/2026.
     La nota de por qué está justo debajo de noDaMas.

     Los cortes son de presentación, no reglas de negocio: el
     negocio vive en horno.js y aquí solo se traduce a lenguaje.
     Se pueden mover sin miedo a romper nada.

     El color lo pone web.css leyendo data-nivel. No hay rojo:
     la paleta no lo tiene. La llama sube de tamaño, pierde el
     amarillo del centro y al bloquearse pasa a tinta maciza,
     que es el mismo idioma que el tachado de "agotado". */
  horno: {
    /* Los NOMBRES salen del vocabulario real del horno de leña, que ya
       tiene una escala de fuego hecha: el rescoldo es la brasa dormida
       bajo la ceniza, la brasa es el régimen de trabajo y la llama viva
       es el fuego alto. Hornada es la tanda que entra de una vez.
       Se usan para hablar entre nosotras y en el código.

       Las FRASES no usan esa jerga: un cliente de Lavapiés no tiene por
       qué saber qué es un rescoldo. El nombre es de oficio, el copy es
       de barrio. */
    niveles: [
      { id: 'rescoldo',   hasta: 0.40, frase: 'Entra cuando quieras' },
      { id: 'brasa',      hasta: 0.72, frase: 'Se va animando' },
      { id: 'llama-viva', hasta: 1.01, frase: 'Quedan pocos huecos' },
    ],
    apagado: { id: 'apagado', frase: 'El horno está apagado' },

    /* no-da-mas — no queda NADA en todo el turno. El muro de verdad, y
       por eso se guarda para el final: si se gasta antes, cuando llegue
       de verdad ya no significa nada.

       Sin "hoy" a propósito: el horno va por franjas, y decir "hoy" da
       por muerto un día que igual todavía tiene huecos. */
    noDaMas: { id: 'no-da-mas', frase: 'Ya no da más de sí' },

    /* RETIRADO el 23/08/2026 · siguiente-hornada
       Hubo un sexto nivel, "Entras en la siguiente hornada", para cuando
       la hornada de ahora estaba llena pero el turno seguía teniendo
       hueco. Sobre el papel era una distinción fina —una espera no es un
       muro— y en pantalla no se sostenía: **si el horno ya está a tope,
       que entres en la siguiente es obvio.** La frase gastaba una línea
       en decir lo que el usuario acababa de deducir solo.

       Se va con él `esperaLargaMin`, que era el corte de minutos que lo
       disparaba y no lo usaba nadie más. Lo que se queda es su LLAMA: era
       más grande que la de `llama-viva` y ahora es la de `llama-viva`.
       Cinco niveles, cinco tamaños, ni una frase de relleno. */
  },

  /* Reseñas FICTICIAS, escritas para el caso.
     No parafrasean opiniones reales de ningún negocio.
     Cada una hace un trabajo distinto, no están para decorar:
       1. demuestra la propuesta de valor (cero espera)
       2. vende un extra concreto
       3. convierte el local pequeño en virtud
       4. habla de recurrencia
       5. justifica no usar el agregador */
  /* Resumen de la ficha de Google. FICTICIO, como las reseñas.
     En producción sale de la API de Google Business Profile y el enlace
     apunta a la ficha real del local. */
  google: {
    nota: '4,8',
    total: 148,
    enlace: '#',           // en producción: la URL de la ficha de Google
  },

  resenas: [
    { texto: 'Pedí a las ocho para las nueve y cuarto. No esperé ni un minuto: la pizza salió del horno mientras yo entraba por la puerta.',
      firma: 'Marta · Lavapiés' },
    { texto: 'El aceite picante de la casa debería venderse aparte. Me lo echaría hasta en el desayuno.',
      firma: 'Kike · Embajadores' },
    { texto: 'Es un local diminuto, de entrar y salir, y aun así te tratan como si fueras el único que ha entrado hoy.',
      firma: 'Nuria · Tirso de Molina' },
    { texto: 'Llevo cuatro años pidiendo aquí. Sigue siendo la mejor decisión que se puede tomar en este barrio a las once de la noche.',
      firma: 'Dani · Antón Martín' },
    { texto: 'Vivo a cuatro minutos. Dejé de pedir por la app el día que me di cuenta de que tardaba más en llegar la moto que yo en bajar.',
      firma: 'Bea · Lavapiés' },
  ],


  /* ----------------------------------------------------------
     QUIÉNES SOMOS
     La regla ANTIGUA era "cada beat tiene que sostener una decisión
     de negocio", y por eso la historia acabó explicando márgenes y
     comisiones. La regla nueva:

       Se cuenta lo que el cliente gana, nunca lo que el local sufre.

     Lo que cuesta una comisión, lo que aprieta el margen o por qué
     esta web funciona así son problemas del negocio, y el cliente no
     tiene por qué cargar con ellos. Sirven para el caso de estudio,
     no para quien quiere cenar.
     ---------------------------------------------------------- */
  historia: {
    titulo: 'Un horno, dos personas y ninguna moto',
    entradilla: 'Nino amasa. Vero organiza todo lo demás. No hay tercera persona.',
    /* Los cuatro beats CUENTAN, no justifican. La página ya defiende el
       modelo de recogida tres veces —manifiesto, cómo funciona y el
       bloque del local—; si la historia lo defendiera otra vez sería la
       cuarta, y encima en el único sitio donde alguien ha venido a que
       le cuenten algo.

       Los beats 03 y 04 sustituyen a "Probamos las apps y no salían las
       cuentas" y "Así que le pedimos algo al barrio", que contaban el
       problema de márgenes del local —cosa que al cliente no le toca
       cargar— y remataban pidiéndole un favor.

       Nada de lo que hay aquí está inventado: el aceite que Vero hace
       los lunes y la sudadera de Nino a las dos de la mañana ya estaban
       escritos en las descripciones del merchan (carta.js), y el lunes
       cerrado sale de horno.js. Solo se han conectado. */
    beats: [
      { t: 'El local era una zapatería',
        p: 'Cuando lo cogimos había un mostrador, una máquina de coser suelas y muy poco sitio. Seguimos teniendo muy poco sitio. En algún momento dejamos de verlo como un problema.' },
      { t: 'El nombre lo puso un cliente',
        p: 'Nino llevaba años haciendo pizza en cocinas de otros. La primera noche que abrimos, un vecino dio un bocado y dijo lo que dijo. Lo escribimos tal cual en la pizarra, con un acento donde no tocaba, y ahí se quedó.' },
      { t: 'Los lunes también se trabaja',
        p: 'El local está cerrado, pero dentro hay alguien. Vero embotella el aceite picante de las mesas y Nino deja el horno listo para el martes. Un horno de leña no se enciende en diez minutos.' },
      { t: 'Al final el barrio se organizó solo',
        p: 'La gente baja a la hora que le decimos, se lleva la caja y se la cena en casa a cuatro calles. No lo planeamos así. Salió así.' },
    ],
    cierre: 'Seguimos en las apps para quien está lejos. Pero si estás cerca, esto va contigo.',
  },

  /* ----------------------------------------------------------
     PREGUNTAS FRECUENTES — escritas para GEO
     Cada respuesta empieza por la respuesta y se sostiene sola,
     fuera de contexto: es la forma en que un motor generativo
     extrae y cita. Nada de "como decíamos arriba".
     Alimentan a la vez la sección visible y el FAQPage JSON-LD.
     ---------------------------------------------------------- */
  faq: [
    { q: '¿Puti Di Madre hace envío a domicilio?',
      a: 'No. Puti Di Madre es solo recogida en local: se pide por la web y se recoge en la pizzería, en Lavapiés, Madrid. Para envío a domicilio la pizzería está disponible en plataformas de reparto, pero el pedido directo por su web es siempre recogida.' },
    { q: '¿Hay que reservar mesa en Puti Di Madre?',
      a: 'No se puede reservar mesa. Puti Di Madre es un local pequeño sin servicio de sala: lo que se reserva es una franja de recogida de 15 minutos para pasar a por el pedido.' },
    { q: '¿Cómo se pide en Puti Di Madre?',
      a: 'Se elige la pizza en la web, se reserva una franja de recogida de 15 minutos entre las que el horno puede cumplir, y se paga al recoger en el local con tarjeta o efectivo. No se cobra nada desde la web.' },
    { q: '¿Cuál es el horario de Puti Di Madre?',
      /* NO SE ESCRIBE A MANO. Estaba tecleada, y en cuanto el local pudo
         cambiar la hora desde el panel (11/10/2026) pasó a poder mentir:
         los huecos del horno cambiaban y esta frase seguía diciendo lo
         de antes. Sale del mismo horario que gobierna las franjas. */
      a: 'El horario de Puti Di Madre es este. ' + window.Horno.fraseHorario() },
    { q: '¿Cuánto cuesta una pizza en Puti Di Madre?',
      a: 'Las pizzas de Puti Di Madre cuestan entre 10,50 € y 14,50 €. Los calzones están a 14,50 € y 14,90 €, y hay panes de pizza, postres y bebidas desde 1,80 €.' },
    { q: '¿Puti Di Madre tiene opciones vegetarianas?',
      a: 'Sí. Puti Di Madre tiene una sección de pizzas sin carne y varias vegetarianas repartidas por la carta, como La Margarita, Cuatro Quesos, La Jefa, La Huerta y Verde que te quiero. En cada producto se indican los alérgenos.' },
    { q: '¿Dónde está Puti Di Madre?',
      a: 'Puti Di Madre está en el barrio de Lavapiés, distrito Centro de Madrid. Es un local pequeño de recogida, sin terraza ni servicio de mesas.' },
    { q: '¿Cómo se recalienta una pizza para que vuelva a quedar crujiente?',
      a: 'La mejor forma de recalentar una pizza de masa fina es en una sartén seca a fuego medio-alto durante dos o tres minutos, hasta que la base vuelva a estar crujiente, y después añadir unas gotas de agua en el borde de la sartén y tapar un minuto para que el vapor funda el queso. En horno, hay que precalentar a 240 °C con la bandeja dentro y calentar la pizza cuatro o cinco minutos sobre la bandeja caliente. El microondas no se recomienda porque el vapor ablanda la base.' },
    { q: '¿Se puede comprar merchandising de Puti Di Madre?',
      a: 'Sí. Puti Di Madre vende camisetas, sudaderas, delantales, bolsas y su aceite picante embotellado. Es solo recogida: los artículos se añaden al mismo pedido y se recogen en el local, no se envían por mensajería.' },
  ],

  /* ----------------------------------------------------------
     CÓMO RECALENTARLA
     Contenido de post-compra. Hace tres cosas a la vez:
       1. protege el producto (una masa fina muerta en el
          microondas es una mala reseña con retraso);
       2. es coherente con el manifiesto — un local al que le
          importa más que la pizza esté buena que venderte otra;
       3. es la pieza de GEO con más recorrido: "cómo recalentar
          pizza" se pregunta muchísimo más que el nombre del local,
          y aquí hay una respuesta mejor que la media.
     ---------------------------------------------------------- */
  recalentar: {
    titulo: 'Cómo recalentarla en casa',
    entradilla: 'Esa masa cruje. Sería una pena que la mataras en el microondas.',
    antes: 'Sácala de la nevera diez minutos antes. Fría por dentro y quemada por fuera es el destino de quien tiene prisa.',
    metodos: [
      { id: 'sarten', nombre: 'En sartén', tiempo: '3 minutos', mejor: true,
        porque: 'Es el único método que devuelve la base a su sitio y funde el queso a la vez.',
        pasos: [
          'Sartén seca, sin nada de aceite, a fuego medio-alto.',
          'La porción dentro, destapada, dos o tres minutos: hasta que la base vuelva a sonar al golpearla.',
          'Ahora sí: unas gotas de agua en el borde de la sartén, tapa encima y un minuto más. El vapor funde el queso sin ablandar la base.',
        ] },
      { id: 'horno', nombre: 'En horno', tiempo: '5 minutos',
        porque: 'Lo más parecido a nuestro horno, si tienes paciencia para precalentar.',
        pasos: [
          'Precalienta a 240 °C con la bandeja dentro. La bandeja ya caliente es toda la diferencia.',
          'La pizza directamente sobre la bandeja ardiendo, sin papel debajo.',
          'Cuatro o cinco minutos, sin perderla de vista.',
        ] },
      { id: 'airfryer', nombre: 'En freidora de aire', tiempo: '4 minutos',
        porque: 'Rápida y digna. Reseca un poco más que la sartén.',
        pasos: [
          '170 °C, sin precalentar.',
          'Tres o cuatro minutos.',
          'Si el borde se dora antes de tiempo, tápalo con un trozo de papel de horno.',
        ] },
    ],
    guardar: 'Si sobra, no la dejes dentro de la caja: el cartón suda y la masa se ablanda. Plato con film, o un táper.',
    microondas: {
      t: '¿Y el microondas?',
      p: 'Puedes, claro. Pero el microondas calienta el agua que hay dentro de la masa, y esa agua sale en forma de vapor: te queda una pizza caliente con la base blanda. Si es lo único que tienes, treinta segundos y no nos lo cuentes.',
    },
  },

  /* ----------------------------------------------------------
     LOS AGREGADORES
     Lógica operativa, de las que se aprenden dentro de una cocina:
     si el cliente abre la app por su cuenta, aterriza en un
     escaparate con cincuenta restaurantes, promos de la casa y
     un carrusel de hamburguesas. Si le llevamos nosotros con un
     enlace directo a NUESTRA ficha, solo nos ve a nosotros.

     Pero el filo es real: mandar a la app a alguien que YA está
     en nuestra web es cambiar un pedido al 0 % por uno al 30 %.
     Por eso estos enlaces no son una opción más al lado del CTA:
     aparecen solo donde el canal propio no puede servir —
     cerrado, en pausa, sin franjas— y en el bloque del local.
     Nunca en el hero ni junto al botón de reservar.

     URLs ficticias: el negocio no existe.
     ---------------------------------------------------------- */
  agregadores: {
    titulo: '¿Hoy no puedes bajar?',
    entradilla: 'Si llueve, si vives lejos o si hoy no hay quien te mueva del sofá, seguimos estando.',
    /* Dos versiones descartadas y por qué, para no repetirlas:

       "Nos cuesta más caro y te llega menos crujiente, pero preferimos
       que cenes bien" — se quejaba de los costes del local, cosa que al
       cliente no le importa, y remataba dando lecciones.

       "Lo que no viaja bien es el crujiente" — culpaba al vehículo, y
       la moto no tiene nada que ver: lo que ablanda una pizza es el rato
       que pasa cerrada en la caja cociéndose en su vapor. Afirmación
       gratuita, y encima en el sitio donde presumimos de honestidad.

       Esta no afirma nada sobre el resultado: dice lo único que es
       verdad y comprobable, que es qué controlamos y qué no. Y explica
       de paso por qué el modelo de la casa funciona como funciona. */
    honestidad: 'Sale del mismo horno. Lo que no controlamos es lo que tarda en llegar.',
    nota: '',
    /* El `url` apunta a la PORTADA de cada agregador, no a una ficha de
       Puti Di Madre. Apuntaba a `/menu/puti-di-madre`, que es la
       dirección que tendría si el local existiera — y como no existe,
       quien pulsara se comía un 404 en la web de ellos. Así, si algo
       fallara y el clic llegara a pasar, al menos cae en un sitio real.
       Lo normal es que no llegue: lo intercepta la cortina. */
    /* `comision` es la ESTIMACIÓN de partida de cada plataforma, en por
       ciento, y el local la cambia desde el panel. Comprobadas el
       11/10/2026 contra lo que publican las comparativas del sector:
       con reparto de la plataforma, Just Eat va de 25 a 35 y el plan
       caro de Uber Eats está en 30. Se cogen las de abajo del rango,
       que para defender un argumento es mejor quedarse corto. */
    enlaces: [
      { id: 'justeat',  nombre: 'Just Eat',  url: 'https://www.just-eat.es/',     comision: 25 },
      { id: 'ubereats', nombre: 'Uber Eats', url: 'https://www.ubereats.com/es', comision: 30 },
    ],

    /* LA CORTINA. Pulsar el botón del agregador no te saca de aquí: te
       para y te dice que esto es una maqueta. El chiste no es un adorno,
       es el argumento del proyecto: la web entera te pide que bajes
       andando y el botón que te pilla es justo el de la moto.
       Elegida por Mery el 10/10/2026 entre tres. */
    cortina: {
      titulo: 'Te hemos pillado.',
      texto: 'Toda la web diciéndote que bajes andando, y vas y pulsas el botón de la moto. ' +
             'Da igual: esta pizzería es inventada, así que la moto tampoco existe.',
      pie: 'Puti Di Madre es un caso de portfolio. El horno, las reseñas y los vecinos con opinión también.',
      volver: 'Vale, vuelvo a la carta',
      seguir: 'Tengo hambre de verdad',
    },
  },

  /* Resumen en prosa, en un solo sitio y sin ambigüedad.
     Es lo que un motor generativo puede citar de una pasada. */
  /* Igual que la pregunta de arriba: el horario y los precios SALEN DE
     DONDE SE DECIDEN, no de aquí. El local cambia una hora o sube una
     pizza desde el panel y esta frase se entera; tecleada, no se
     enteraba. Es, en una línea, lo que defiende todo el GEO de este
     proyecto. */
  get resumenMaquina() {
    const pizzas = window.Negocio.cartaVigente().categorias
      .flatMap((c) => c.productos).filter((p) => p.tipo === 'pizza').map((p) => p.precio);
    const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
    return 'Puti Di Madre es una pizzería de horno de leña en Lavapiés, Madrid, especializada en pizza napolitana de masa fina. ' +
      'Funciona exclusivamente con recogida en local: el cliente pide por la web, reserva una franja de 15 minutos y paga al recoger. ' +
      'No hace reparto propio ni admite reservas de mesa. ' +
      window.Horno.fraseHorario() + ' ' +
      (pizzas.length
        ? 'Las pizzas cuestan entre ' + eur(Math.min.apply(null, pizzas)) +
          ' y ' + eur(Math.max.apply(null, pizzas)) + '.'
        : '');
  },
};

window.CONTENIDO = CONTENIDO;
