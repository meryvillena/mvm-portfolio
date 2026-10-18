/* ============================================================
   PUTI DI MADRE — GEO (Generative Engine Optimization)
   ------------------------------------------------------------
   El problema que resuelve está en el brief: hoy quien controla
   la marca en los buscadores son directorios clonados que
   publican precios y horarios contradictorios. Lo hacen porque
   ellos publican datos estructurados y el negocio no publica
   nada. Recuperar la marca no va de escribir más texto: va de
   ser la fuente más legible de la web sobre uno mismo.

   Regla de oro de este archivo:
   NADA se escribe a mano. La ficha estructurada se genera de la
   MISMA configuración que gobierna las franjas (horno.js) y la
   MISMA carta que ve el cliente (carta.js). Es imposible que la
   ficha que lee una IA diga un horario distinto del que la web
   es capaz de cumplir. Ese es el argumento entero.

   AVISO PARA PRODUCCIÓN: aquí el JSON-LD se inyecta en tiempo de
   ejecución para poder enseñar que sale de la configuración.
   En producción tiene que ir SERIALIZADO EN EL HTML, porque
   buena parte de los rastreadores de motores generativos no
   ejecutan JavaScript. Se genera en el build con esta misma
   función y se escribe en el <head>.
   ============================================================ */

/* Encapsulado: al ser scripts planos, sin esto los nombres internos
   (guardar, render, mulberry32…) chocan entre archivos. */
(function () {
'use strict';
const GEO = {
  negocio: {
    nombre: 'Puti Di Madre',
    /* Calle inventada a propósito: el local no existe y no queremos que
       la ficha apunte a un portal de verdad. «Rescoldo» además es
       palabra de la casa — es el primer nivel de la llama. */
    calle: 'Calle del Rescoldo, 7',
    barrio: 'Lavapiés',
    ciudad: 'Madrid',
    region: 'Comunidad de Madrid',
    cp: '28012',
    pais: 'ES',
    // Coordenadas aproximadas del barrio: el local es ficticio.
    lat: 40.4089, lon: -3.7009,
    cocina: ['Pizza', 'Italiana', 'Napolitana'],
    rango: '€€',
  },

  // schema.org espera los días en inglés.
  /* schema.org espera los días en inglés, uno a uno. Agruparlos es
     cosa de `Horno.tramos()`: aquí solo se traduce. */
  diasSchema: {
    lunes: 'Monday', martes: 'Tuesday', miercoles: 'Wednesday', jueves: 'Thursday',
    viernes: 'Friday', sabado: 'Saturday', domingo: 'Sunday',
  },
};

/* ---------- horarios derivados de horno.js ---------- */

/* Una entrada por TRAMO, no por día: schema.org admite las dos cosas,
   pero siete entradas donde caben tres se leen peor y dicen lo mismo.
   Los tramos los calcula el horno juntando días seguidos con el mismo
   horario, así que si el local cierra un miércoles suelto esto pasa
   solo de una entrada a dos. Los días cerrados no aparecen. */
function horariosEstructurados() {
  const H = window.Horno;
  return H.tramos().filter((t) => t.cfg).map((t) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: t.dias.map((d) => GEO.diasSchema[d]),
    opens: H.formatoHora(t.cfg.abre),
    closes: H.formatoHora(t.cfg.ultimaFranja + H.HORNO.granularidadMin),
  }));
}

/* ---------- carta derivada de la carta VIGENTE ----------
   No de `carta.js` a secas, y esto se arregló el 10/10/2026. Leía la
   carta base, así que el local bajaba la margarita a 8,50 € desde el
   panel, la web obedecía… y la ficha que leen las IA seguía diciendo
   10,50 €. Justo lo que este archivo presume de impedir. */

function menuEstructurado() {
  return {
    '@type': 'Menu',
    name: 'Carta de Puti Di Madre',
    hasMenuSection: window.Negocio.cartaVigente().categorias.map((cat) => ({
      '@type': 'MenuSection',
      name: cat.nombre,
      hasMenuItem: cat.productos.map((p) => ({
        '@type': 'MenuItem',
        name: p.nombre,
        description: p.ingredientes || undefined,
        offers: { '@type': 'Offer', price: p.precio.toFixed(2), priceCurrency: 'EUR' },
        suitableForDiet: p.etiquetas.includes('Vegetariana')
          ? 'https://schema.org/VegetarianDiet' : undefined,
      })),
    })),
  };
}

/* ---------- ficha del negocio ---------- */

function fichaRestaurante() {
  const n = GEO.negocio;
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: n.nombre,
    description: CONTENIDO.resumenMaquina,
    address: {
      '@type': 'PostalAddress',
      addressLocality: n.ciudad,
      addressRegion: n.region,
      postalCode: n.cp,
      addressCountry: n.pais,
      streetAddress: n.calle,
    },
    geo: { '@type': 'GeoCoordinates', latitude: n.lat, longitude: n.lon },
    servesCuisine: n.cocina,
    priceRange: n.rango,
    openingHoursSpecification: horariosEstructurados(),
    hasMenu: menuEstructurado(),

    // Los tres hechos que hoy los clones cuentan mal:
    acceptsReservations: 'https://schema.org/False',
    hasDeliveryMethod: { '@type': 'DeliveryMethod', name: 'Recogida en local' },
    potentialAction: {
      '@type': 'OrderAction',
      name: 'Pedir para recoger',
      deliveryMethod: 'https://schema.org/OnSitePickup',
    },
    paymentAccepted: 'Tarjeta, efectivo (en el local)',
  };
}

/* ---------- preguntas frecuentes ---------- */

/* HowTo: la guía de recalentado en formato que un motor generativo
   puede citar paso a paso. Se genera del método recomendado, así que
   si cambia el copy cambia la ficha. Es la pieza con más alcance de
   todo el GEO: responde una pregunta que se hace mucha más gente que
   la que busca el nombre del local. */
function fichaRecalentar() {
  const r = CONTENIDO.recalentar;
  const mejor = r.metodos.find((m) => m.mejor) || r.metodos[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo recalentar una pizza de masa fina para que vuelva a quedar crujiente',
    description: r.entradilla,
    totalTime: 'PT3M',
    tool: [{ '@type': 'HowToTool', name: 'Sartén' }, { '@type': 'HowToTool', name: 'Tapa' }],
    step: mejor.pasos.map((p, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: p,
    })),
    supply: [{ '@type': 'HowToSupply', name: 'Pizza sobrante' }],
  };
}

function fichaFAQ() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CONTENIDO.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/* ---------- inyección ----------
   Las tres fichas YA ESTÁN ESCRITAS EN EL HTML, entre los comentarios
   GEO:INICIO y GEO:FIN de `index.html`, puestas ahí por
   `node geo-serializar.js`. Eso es lo que lee un rastreador que no
   ejecuta JavaScript, que son muchos de los de los motores generativos.

   Esta función ya no las AÑADE: las PONE AL DÍA. Lo que hay en el HTML
   es la carta de fábrica; si el local ha cambiado un precio o quitado un
   producto desde el panel, aquí se reescriben con lo vigente. Así la
   versión estática sirve para los rastreadores y la de ejecución sirve
   para la demo, y ninguna de las dos miente.

   Si alguien añade una ficha nueva y no está en el HTML, se añade como
   antes: nadie se queda sin su ficha por olvidar lanzar el generador.
   Lo que sí avisa es la prueba, que compara las dos y falla si no
   cuadran. */

function inyectarGEO() {
  const fichas = [
    ['restaurante', fichaRestaurante()],
    ['faq', fichaFAQ()],
    ['recalentar', fichaRecalentar()],
  ];
  fichas.forEach(([nombre, datos]) => {
    const texto = JSON.stringify(datos, null, 2);
    const ya = document.querySelector('script[type="application/ld+json"][data-geo="' + nombre + '"]');
    if (ya) { ya.textContent = texto; return; }
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.dataset.geo = nombre;
    s.textContent = texto;
    document.head.appendChild(s);
  });
}

window.GEO = { GEO, negocio: GEO.negocio, fichaRestaurante, fichaFAQ, fichaRecalentar, horariosEstructurados, inyectarGEO };
inyectarGEO();

})();
