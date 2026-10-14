/* ============================================================
   PUTI DI MADRE — Carta
   ------------------------------------------------------------
   Hoy es un objeto en un archivo. En producción esta misma
   estructura llega de Airtable, que es el CMS que toca Bruno:
     const CARTA = await fetch('/api/carta').then(r => r.json());
   Nada más de la aplicación cambia.

   `tipo` no es una etiqueta decorativa: es lo que determina
   cuántas unidades de horno consume el producto (ver horno.js).
   ============================================================ */

const CARTA = {
  categorias: [
    {
      id: 'siempre',
      nombre: 'Las de siempre',
      productos: [
        { id: 'margarita', nombre: 'La Margarita', tipo: 'pizza', precio: 10.50,
          ingredientes: 'Tomate, mozzarella, parmesano y albahaca',
          alergenos: 'Gluten, lácteos', etiquetas: ['Favorita del barrio', 'Vegetariana'], imagen: 'imagenes/pizzas/01-la-margarita.jpg',
          quitables: [
            { id: 'albahaca', nombre: 'Albahaca' },
            { id: 'parmesano', nombre: 'Parmesano' },   // hay mozzarella: los lácteos siguen
          ] },
        { id: 'diavola', nombre: 'La Diavola', tipo: 'pizza', precio: 12.50,
          ingredientes: 'Tomate, mozzarella, salame picante y chile',
          alergenos: 'Gluten, lácteos', etiquetas: ['Pica de verdad'], imagen: 'imagenes/pizzas/02-la-diavola.jpg',
          quitables: [
            { id: 'chile', nombre: 'Chile' },
            { id: 'salame', nombre: 'Salame picante' },
          ] },
        { id: 'cuatroquesos', nombre: 'Cuatro Quesos', tipo: 'pizza', precio: 12.90,
          ingredientes: 'Mozzarella, gorgonzola, provolone y parmesano',
          alergenos: 'Gluten, lácteos', etiquetas: ['Vegetariana'], imagen: 'imagenes/pizzas/03-cuatro-quesos.jpg',
          quitables: [
            { id: 'gorgonzola', nombre: 'Gorgonzola' },
            { id: 'parmesano', nombre: 'Parmesano' },
          ] },
        { id: 'parma', nombre: 'La Parma', tipo: 'pizza', precio: 13.50,
          ingredientes: 'Tomate, mozzarella, jamón de Parma, rúcula y parmesano',
          alergenos: 'Gluten, lácteos', etiquetas: [], imagen: 'imagenes/pizzas/04-la-parma.jpg',
          quitables: [
            { id: 'rucula', nombre: 'Rúcula' },
            { id: 'parmesano', nombre: 'Parmesano' },
            { id: 'jamon', nombre: 'Jamón de Parma' },
          ] },
      ],
    },
    {
      id: 'casa',
      nombre: 'Las de la casa',
      productos: [
        { id: 'malamadre', nombre: 'La Malamadre', tipo: 'pizza', precio: 13.90,
          ingredientes: 'Tomate, mozzarella, sobrasada, miel picante y cebolla roja',
          alergenos: 'Gluten, lácteos', etiquetas: ['Pica de verdad'], imagen: 'imagenes/pizzas/05-la-malamadre.jpg',
          quitables: [
            { id: 'sobrasada', nombre: 'Sobrasada' },
            { id: 'miel-picante', nombre: 'Miel picante' },   // 'miel' ya lo usa el extra
            { id: 'cebolla',   nombre: 'Cebolla roja' },
            { id: 'mozza-int', nombre: 'Mozzarella', alergeno: 'Lácteos' },
          ] },
        { id: 'puttanesca', nombre: 'La Puttanesca', tipo: 'pizza', precio: 13.50,
          ingredientes: 'Tomate, mozzarella, aceituna negra, alcaparra, anchoa y orégano',
          alergenos: 'Gluten, lácteos, pescado', etiquetas: [], imagen: 'imagenes/pizzas/06-la-puttanesca.jpg',
          quitables: [
            { id: 'anchoa',    nombre: 'Anchoa', alergeno: 'Pescado' },
            { id: 'alcaparra', nombre: 'Alcaparra' },
            { id: 'aceituna',  nombre: 'Aceituna negra' },
            { id: 'mozza-int', nombre: 'Mozzarella', alergeno: 'Lácteos' },
          ] },
        { id: 'barrio', nombre: 'La del Barrio', tipo: 'pizza', precio: 13.90,
          ingredientes: 'Crema de ajo asado, mozzarella, champiñón, panceta y perejil',
          alergenos: 'Gluten, lácteos', etiquetas: ['Nueva en el horno'], imagen: 'imagenes/pizzas/07-la-del-barrio.jpg',
          quitables: [
            { id: 'panceta',   nombre: 'Panceta' },
            { id: 'champinon', nombre: 'Champiñón' },
            { id: 'perejil',   nombre: 'Perejil' },
            { id: 'mozza-int', nombre: 'Mozzarella' },   // la crema de ajo también es láctea
          ] },
        { id: 'jefa', nombre: 'La Jefa', tipo: 'pizza', precio: 14.50,
          ingredientes: 'Burrata, tomate confitado, pesto y pistacho',
          alergenos: 'Gluten, lácteos, frutos secos', etiquetas: ['Vegetariana'], imagen: 'imagenes/pizzas/08-la-jefa.jpg',
          quitables: [
            { id: 'pistacho', nombre: 'Pistacho' },   // el pesto lleva piñones: siguen los frutos secos
            { id: 'pesto', nombre: 'Pesto' },
          ] },
      ],
    },
    {
      id: 'calzones',
      nombre: 'Calzones',
      /* «Hora y media de horno» se leía como NOVENTA MINUTOS, y el panel
         dice que un pedido pasa ocho minutos dentro. Lo que ocupa son
         1,5 huecos, no 1,5 horas: la unidad era invisible y el lector
         ponía la que conocía. (Auditoría de Mery, 13/10/2026.) */
      nota: 'Un calzone ocupa en el horno lo que pizza y media. Por eso a veces no cabe donde sí cabría una pizza.',
      productos: [
        { id: 'calzone-casa', nombre: 'Calzone de la Casa', tipo: 'calzone', precio: 14.50,
          ingredientes: 'Ricotta, mozzarella, salame picante y tomate',
          alergenos: 'Gluten, lácteos', etiquetas: [], imagen: 'imagenes/pizzas/11-calzone-de-la-casa.jpg',
          quitables: [
            { id: 'salame', nombre: 'Salame picante' },
            { id: 'ricotta', nombre: 'Ricotta' },
          ] },
        { id: 'calzone-gorgonzola', nombre: 'Calzone de Gorgonzola', tipo: 'calzone', precio: 14.90,
          ingredientes: 'Gorgonzola, mozzarella, nuez y miel',
          alergenos: 'Gluten, lácteos, frutos secos', etiquetas: ['Vegetariana'], imagen: 'imagenes/pizzas/12-calzone-de-gorgonzola.jpg',
          quitables: [
            { id: 'nuez', nombre: 'Nuez', alergeno: 'Frutos secos' },
            { id: 'miel-int', nombre: 'Miel' },
          ] },
      ],
    },
    {
      id: 'sincarne',
      nombre: 'Sin carne, con carácter',
      productos: [
        { id: 'huerta', nombre: 'La Huerta', tipo: 'pizza', precio: 12.50,
          ingredientes: 'Tomate, mozzarella, calabacín, berenjena y pimiento asado',
          alergenos: 'Gluten, lácteos', etiquetas: ['Vegetariana'], imagen: 'imagenes/pizzas/09-la-huerta.jpg',
          quitables: [
            { id: 'berenjena', nombre: 'Berenjena' },
            { id: 'pimiento', nombre: 'Pimiento asado' },
            { id: 'calabacin', nombre: 'Calabacín' },
          ] },
        { id: 'verde', nombre: 'Verde que te quiero', tipo: 'pizza', precio: 12.90,
          ingredientes: 'Pesto, mozzarella, calabacín, rúcula y limón',
          alergenos: 'Gluten, lácteos, frutos secos', etiquetas: ['Vegetariana'], imagen: 'imagenes/pizzas/10-verde-que-te-quiero.jpg',
          quitables: [
            { id: 'limon', nombre: 'Limón' },
            { id: 'rucula', nombre: 'Rúcula' },
            { id: 'calabacin', nombre: 'Calabacín' },
          ] },
      ],
    },
    {
      id: 'acompanar',
      nombre: 'Para acompañar',
      productos: [
        { id: 'pan', nombre: 'Pan de pizza', tipo: 'pan', precio: 3.50,
          ingredientes: 'Nuestra masa con ajo y hierbas',
          alergenos: 'Gluten', etiquetas: [], imagen: 'imagenes/carta/01-pan-de-pizza.jpg' },
      ],
    },
    {
      id: 'dulce',
      nombre: 'Algo dulce',
      productos: [
        { id: 'tiramisu', nombre: 'Tiramisú', tipo: 'postre', precio: 5.50,
          ingredientes: 'De los de verdad', alergenos: 'Lácteos, huevo, gluten', etiquetas: [], imagen: 'imagenes/carta/02-tiramisu.jpg' },
      ],
    },
    {
      id: 'bebidas',
      nombre: 'Bebidas',
      productos: [
        { id: 'agua', nombre: 'Agua', tipo: 'bebida', precio: 1.80, ingredientes: '', alergenos: '', etiquetas: [], imagen: 'imagenes/carta/03-agua.jpg' },
        { id: 'refresco', nombre: 'Refresco', tipo: 'bebida', precio: 2.50, ingredientes: '', alergenos: '', etiquetas: [], imagen: 'imagenes/carta/04-refresco.jpg' },
        { id: 'cerveza', nombre: 'Cerveza', tipo: 'bebida', precio: 2.80, ingredientes: '', alergenos: '', etiquetas: [], imagen: 'imagenes/carta/05-cerveza.jpg' },
        { id: 'vino', nombre: 'Vino de la casa', tipo: 'bebida', precio: 3.50, ingredientes: 'Botella individual', alergenos: '', etiquetas: [], imagen: 'imagenes/carta/06-copa-de-tinto.jpg' },
      ],
    },
  ],

  /* La tienda. Solo recogida, igual que la pizza: el merchan se añade
     al mismo pedido y se recoge en el mismo viaje. No consume unidades
     de horno (tipo 'merch'), así que un pedido solo de tienda puede
     reservar cualquier franja abierta sin ocupar capacidad de cocina.
     `opciones` son las opciones obligatorias del paso 3 de la Fase 01:
     hasta ahora ningún producto las necesitaba. */
  tienda: [
    { id: 'camiseta', nombre: 'Camiseta PUTI / DI / MADRE', tipo: 'merch', precio: 22.00,
      ingredientes: 'Algodón grueso, serigrafía a dos tintas, marca apilada al pecho',
      alergenos: '', etiquetas: ['Lo más robado'], imagen: 'imagenes/tienda/merchan_cami_putidimadre.jpg',
      opciones: [{ id: 'talla', nombre: 'Talla', valores: ['S', 'M', 'L', 'XL'] }] },
    { id: 'sudadera', nombre: 'Sudadera de turno de noche', tipo: 'merch', precio: 42.00,
      ingredientes: 'La que lleva Nino a las dos de la mañana. Interior perchado',
      alergenos: '', etiquetas: [], imagen: 'imagenes/tienda/merchan_hoodie_her.jpg',
      opciones: [{ id: 'talla', nombre: 'Talla', valores: ['S', 'M', 'L', 'XL'] }] },
    { id: 'delantal', nombre: 'Delantal de la casa', tipo: 'merch', precio: 28.00,
      ingredientes: 'Lona cruda, bolsillo canguro y una mancha de tomate que traes tú',
      alergenos: '', etiquetas: [], imagen: 'imagenes/tienda/mercha_delantal.jpg' },
    { id: 'aceite-bote', nombre: 'Aceite picante embotellado', tipo: 'merch', precio: 9.50,
      ingredientes: 'El mismo que hay en la mesa. 250 ml. Lo hace Vero los lunes',
      alergenos: '', etiquetas: ['Favorita del barrio'], imagen: 'imagenes/tienda/merchan_aceitepicante.jpg' },
    { id: 'tote', nombre: 'Bolsa de tela', tipo: 'merch', precio: 12.00,
      ingredientes: 'Para llevarte la caja sin que te queme los dedos',
      alergenos: '', etiquetas: [], imagen: 'imagenes/tienda/merchan_tote.jpg' },
    { id: 'iman', nombre: 'Imán de nevera', tipo: 'merch', precio: 4.00,
      ingredientes: 'Con el horario, para que no tengas que buscarlo en Google',
      alergenos: '', etiquetas: [], imagen: 'imagenes/tienda/merchan_iman.jpg' },
  ],


  /* ----------------------------------------------------------
     QUITABLES — lo que se le puede quitar a cada pizza.

     Solo se listan los ingredientes que se pueden quitar SIN que la
     pizza deje de ser ella misma: la sobrasada de la Malamadre sí; el
     tomate de una margarita no, porque entonces no es una margarita.

     `alergeno` es opcional y sirve para recalcular los alérgenos de
     verdad. Si alguien quita la mozzarella, "Lácteos" TIENE que
     desaparecer de la ficha: dejar un alérgeno que ya no está es dar
     información falsa sobre alergias, que es lo más grave que puede
     hacer una carta.

     PERO SOLO SE PONE `alergeno` SI ESE INGREDIENTE ES LA ÚNICA FUENTE
     DE ESE ALÉRGENO EN ESA PIZZA. La margarita lleva mozzarella Y
     parmesano: quitar el parmesano NO la deja sin lácteos, y marcarlo
     haría que la ficha jurase que no tiene lácteos cuando sí los tiene.
     Equivocarse por este lado es peor que no recalcular nada.

     Quitar NO descuenta, y la ficha lo dice. Descontar obligaría a
     ponerle precio a cada ingrediente de cada pizza, y una pizzería de
     barrio no cobra menos por quitar la cebolla.
     ---------------------------------------------------------- */

  // Extras: se añaden sobre un producto que ya cuenta. Coste de horno 0.
  extras: [
    { id: 'aceite', nombre: 'Aceite picante de la casa', precio: 0.80 },
    { id: 'miel',   nombre: 'Un golpe de miel',          precio: 1.00 },
    { id: 'mozza',  nombre: 'Extra de mozzarella',       precio: 1.50 },
  ],
};

window.CARTA = CARTA;
