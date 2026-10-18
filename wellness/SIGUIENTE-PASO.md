# Wellness · Eme Pérez — Estado y siguiente paso

**Última sesión: 20 agosto 2026**
Proyecto: `/Users/meryvillena/Documents/Claude/Projects/portfolio-web/wellness/`

---

## Hecho el 20-08 por la mañana

1. **Los puntos vuelven al azul.** El carmín se quitó del todo: `--color-carmin`
   ya no existe en `tokens.css` (era `#8d4257`, por si se quiere recuperar).
   La esfera va de `#7a97ae` (brillo) a `--accent` y termina en `#293743`.

   **El porqué es bueno y no lo dicen los números:** en contraste medido el azul
   (1,9) y el carmín (2,0) son iguales, los dos por debajo del mínimo de 3,0.
   Pero el carmín era **cálido, igual que la lámina**, y se fundía con ella. El
   azul es frío y se separa por temperatura. Contraste de tono, no de luminosidad.
   El disco de papel sigue siendo imprescindible (5,8 contra su propio disco).

2. **Fuera el subrayado falso.** `.bridge-lead` llevaba un `border-top` como
   separador, y al caer justo debajo del párrafo parecía subrayar «…se realiza
   sin agujas». Ahora separa con margen. **No volver a poner filetes ahí.**

3. **Flechita hacia abajo** al final de la entradilla (`.bridge-lead-flecha`),
   con un balanceo lento. Respeta `prefers-reduced-motion`.

---

## Sección 08 · EME PÉREZ (empezada el 20-08)

Sección nueva `#eme`, entre «Sesiones» y «Primera sesión»: la técnica → las
sesiones → **quién te las hace** → cómo va la primera → reservar. Con entrada en
el menú.

- **Retrato:** `assets/eme-retrato.webp`. Venía en PNG de 2,2 MB; en WebP pesa
  **153 KB** sin pérdida visible. El original está en `ChatGPT/Wellness/assets/`.
- **Tratamiento:** ventana de espécimen 4/5, `saturate(.62) sepia(.06)`.
  **Sin `mix-blend-mode: multiply`** a diferencia de las láminas: sobre un rostro
  el multiply apaga la piel y la vuelve gris.
- **Recorte:** `object-position: 50% 22%`. Se pierde el 17% del alto, casi todo
  por abajo (los pies). La cara queda holgada.
- **Va en banda azul a sangre** (`--accent` de fondo, texto en papel), como era
  el bloque del que sale. Al moverlo a sección propia se perdió ese tratamiento
  y Mery lo pidió de vuelta: **no volver a dejarlo en fondo claro.**
- El bloque `.first-visit-profile` que estaba dentro de «Primera sesión» **se
  retiró** para no duplicar a Eme. Su CSS sigue en `design.css` por si hay que
  volver atrás, pero ya no hay markup que lo use.

📎 **Hay referencia de inspiración documentada en `REFERENCIA-INSPIRACION.md`**,
con lo que se puede tomar de ella y lo que no. Léelo antes de escribir textos.

⚠️ **EL TEXTO ES PROVISIONAL.** Es el que ya había en el bloque viejo y es
genérico: vale para cualquier profesional del gremio. Mery va a pasar los datos
reales de Eme. Hasta entonces la sección está montada pero no dice nada propio.

---

## MUDANZA — 20 agosto 2026

**El proyecto ya NO vive en `ChatGPT/Wellness/final-draft`.** Vive en el
repositorio del portfolio, como el resto:

```
~/Documents/Claude/Projects/portfolio-web/wellness/
```

- `index.html` está en la raíz de esa carpeta, no dentro de `final-draft/`.
- Está bajo git **con remoto en GitHub**. Antes no tenía ni un commit.
- Se sirve como subpágina `/wellness/`, igual que `/spotify/` o `/depredador/`.

**Lo viejo está en** `portfolio-web/_backups/wellness-20260820-para-revisar/`,
en cuatro carpetas numeradas. Mery la repasa y borra lo que no valga.
⚠️ Esa carpeta **está ignorada por git**: vive sólo en el Mac. No pasa nada,
porque lo que se sacó de `wellness/` sigue en commits anteriores.

**La carpeta `ChatGPT/Wellness` sigue existiendo como copia**, intacta. Borrarla
es decisión de Mery y no corre prisa.

---

## SIGUIENTE PASO CONCRETO

**0. Retocar la entradilla del atlas.** Mery la deja puesta pero sin cerrar
(19-08, final de sesión). Está en `index.html`, clase `.bridge-lead`:

> Encuentra en el mapa los nueve puntos de presión del Shiatsu.
> *Dónde está cada uno y qué hace.*

Descartadas por el camino, y por qué, para no repetirlas:
- «Abajo, nueve de esos puntos, marcados sobre una lámina japonesa» → pie de foto.
- «Seguro que ya te has apretado alguno sin saber cómo se llama» → no dice el porqué.
- «…hace que la sesión empiece donde tiene que empezar» → **beneficio inventado.
  El diagrama no hace eso.** No volver a prometer nada que la página no cumpla.

Matiz pendiente: de los nueve, **siete sí están entre los más trabajados**; los
dos de las bocas son específicos (boca seca, encías). Llamar a los nueve «puntos
de presión del Shiatsu» es una simplificación asumida a sabiendas.


Quedan tres decisiones, ninguna bloquea a las otras:

1. **Cuánto se amplía la lámina** — `--plate-w` en `design.css` (`.atlas-viewport`).
   Está en **1600px**: nítida, pero sólo **252 px de recorrido lateral**, así que
   de lado casi no se mueve. A 2600px hay 1252 px de recorrido y se empasta.
   Comparativa: `scratchpad/nitidez-macro.png`.
2. ~~Ilustrativo o didáctico~~ **DECIDIDO 19-08: ILUSTRATIVO.** Dónde está el
   punto y para qué sirve; nada de cómo hacerlo en casa. Los avisos de embarazo
   de Kensei y Gōkoku se quedan como nota interna en `ATLAS-PUNTOS.md` y **no
   salen en la web**. Detalle en ese archivo.
3. **Que Eme confirme la colocación de los 7 puntos.**

Y una tarea suelta: **la xilografía `lamina-meridianos.jpeg` sigue sin usar**, y es
mejor espécimen que el `mapa-facial.jpeg` que hay ahora en la sección `guide`.

---

## La marca del punto — probado y descartado

Se probó **diana de mapa** (disco de papel + anillo carmín + centro). Se veía
perfectamente, pero Mery: «son terroríficas». Demasiado peso para una lámina
delicada, y en móvil **tapaban las bocas enteras**.

**Lo que hay ahora: una cuenta con volumen.** Tres capas, cada una con su
trabajo, y no se pueden quitar a la ligera:

| Capa | Qué es | Para qué |
|---|---|---|
| `::before` | disco de papel 19px + sombra proyectada | lo despega del papel Y resuelve el contraste sobre zona oscura |
| `::after` | 13px con degradado radial + sombra interior | le da bulto de esfera |
| `.atlas-halo` | aro de 44px que late | la respiración |

El degradado va de `#bd7186` (brillo, arriba a la izquierda) a `--carmin` y
termina en `#5d2b39`. Si se quita el disco de papel, el punto del hombro vuelve
a perderse en la figura de espalda (contraste 2,2 sobre el mínimo de 3,0).

---

## Color de los puntos (19-08, cuarta tanda)

Token nuevo **`--color-carmin:#73464e`** en `tokens.css`. Es el espejo exacto del
azul pizarra: mismo tono de saturación (24%) y luminosidad (36%), movido a 350°.

**`--accent` NO se tocó.** Sigue habiendo 78 usos de azul en el resto del sitio;
el carmín sólo se usa en las 6 marcas del atlas (punto, halo, aro del cursor,
punto del cursor, número de la ficha, foco).

**El color solo no bastaba.** Medido sobre la lámina, con el mínimo en 3,0:

| | pt cara | pt hombro | pt mano | pt pierna | pt pie |
|---|---|---|---|---|---|
| azul | 2,7 | **1,9** | 4,0 | 3,3 | 3,7 |
| carmín | 3,1 | **2,2** | 4,7 | 3,8 | 4,3 |

El punto del hombro cae sobre la zona tostada de la figura de espalda y ahí
cualquier color medio se pierde. Lo que lo resuelve es el **aro del color del
papel** (`box-shadow:0 0 0 2px var(--paper)`): sobre claro contrasta el carmín,
sobre oscuro contrasta el aro. **No quitar ese aro** pensando que sobra.

---

## El movimiento, elegido y montado (19-08, tercera tanda)

Mery eligió **A · apuntar**, probándolo en `prueba-movimiento.html`.

**Cómo funciona:** la lámina se coloca según dónde esté el ratón dentro del
recuadro (a la izquierda ves el extremo izquierdo, abajo los pies). No hay que
agarrar nada; se para cuando paras el ratón. Al acercarte a menos de 95 px de un
punto, **la lámina se congela** para que puedas apuntarle sin que huya.

**Las constantes están en `atlas.js` y son las mismas que las de la demo aprobada:**

| Constante | Valor | Qué hace |
|---|---|---|
| `MARGEN` | 0.10 | holgura en los bordes: no hay que llegar al filo para ver el extremo |
| `SUAVIDAD` | 0.09 | cuánto se acerca la lámina a su sitio por fotograma |
| `FRENO` | 95 px | a esta distancia de un punto la lámina se para |
| `TOQUE` | 26 px | a esta distancia el punto se considera tocado |

**No cambiar `FRENO` a la ligera:** el valor 95 es el que Mery probó y aprobó.

**Descartado:** el arrastre (ortopédico), la rueda del ratón (secuestra el scroll)
y el modo B / microscopio.

**Movimiento reducido y móvil:** no hay recorrido. La lámina se ve entera y quieta
y los puntos se tocan directamente. Está en el `@media(prefers-reduced-motion)`
de `design.css` y en la función `estatico()` de `atlas.js`.

### Cómo se verificó (importante para la próxima vez)

El navegador integrado **no sirve para esto**: renderiza a 289 px de ancho, y
cuando el panel queda oculto **congela los `requestAnimationFrame`**, así que el
bucle del atlas ni corre. Lo que sí se pudo medir en el navegador: con el ratón
en (0,95 · 0,50) la lámina quedó en `tx −252 / ty −581,5`, que es exactamente lo
que predice la fórmula.

El resto se verificó **simulando el bucle en Node**, leyendo las constantes del
propio `atlas.js` y las coordenadas del `index.html`. Dos avisos por si se repite:

- Simular teletransportando el ratón da un falso negativo (salían 1 de 5 puntos
  alcanzables). Hay que simular **movimiento continuo con la persona corrigiendo**,
  que es como se usa de verdad: así salen **5 de 5**, en 26-43 fotogramas.
- El freno se midió aparte: **0,0 px de deriva** de la lámina mientras apuntas.

---

## Arreglado en la segunda tanda del 19-08

- **El cursor se iba de su sitio.** Estaba la posición en `transform` y el latido
  en la propiedad `scale`. El navegador aplica `scale` antes que `transform`, así
  que **la escala multiplicaba también el desplazamiento**: con el ratón quieto,
  el círculo se movía 216 px en horizontal y 120 en vertical. Ahora el envoltorio
  `.atlas-cursor` sólo se coloca y el hijo `.atlas-cursor-ring` sólo late.
  **No volver a mezclar posición y escala en la misma capa.**
- **Punto de mira fijo.** `.atlas-cursor-dot`, 7 px, no late nunca. Es la
  referencia para apuntar; el aro es el adorno.
- **El grano.** Tres cosas a la vez: era un JPEG ampliado 4,3×, le había puesto
  `contrast(1.12)` que realzaba el ruido tanto como la tinta, y el papel escaneado
  tiene textura. Ahora `filter:saturate(.92)` a secas y la lámina es
  `atlas-puntos-limpio.webp` (106 KB, igual que el JPEG viejo).
  **Cómo se limpió:** no vale filtro de mediana a pelo (se come la tinta) ni
  máscara por luminosidad (las líneas rosas son tan claras como el papel). Lo que
  funciona es separar detalle = original − mediana y **borrar sólo el detalle de
  poca amplitud**, que es el ruido del JPEG, conservando el de mucha, que son las
  líneas. El original sin tocar sigue en `assets/atlas-puntos.jpeg`.
- **`loading="lazy"` fuera de la lámina.** No disparaba y el recuadro se quedaba
  con altura 0. Además `.atlas-canvas` lleva ahora `aspect-ratio:736/824`, para
  que la geometría del arrastre no dependa de que la imagen haya cargado.

---

## Lo que se montó el 19-08 por la tarde

El **atlas de puntos** sustituye al marcador `.pressure-stage` (los tres
círculos abstractos). Es una lámina ampliada que se recorre arrastrando, con
cursor de presión que late y una ficha por punto.

**Archivos nuevos:**

| Archivo | Qué es |
|---|---|
| `atlas.js` | Arrastre, cursor y fichas. **Aislado a propósito: `design.js` no se tocó.** |
| `assets/atlas-puntos.jpeg` | La lámina del atlas (736×824). Copiada de `Documents/Claude/Projects/portfolio-web/wellness/assets/Really like this.jpeg` |
| `assets/lamina-meridianos.jpeg` | La xilografía antigua (688×1200). **Sin usar todavía** — ver abajo. |
| `ATLAS-PUNTOS.md` | El contenido de los 5 puntos, para corregir. |

**Copias de seguridad antes de tocar:** `.bak-index-antes-atlas.html` y
`.bak-design-antes-atlas.css`.

### Las 7 coordenadas (en `index.html`, atributo `style` de cada `.atlas-point`)

| Punto | --x | --y |
|---|---|---|
| 01 Indō · entrecejo | 22.8% | 10.8% |
| 02 Kensei · hombro | 80.5% | 19.6% |
| 03 Danchū · pecho | 23.1% | 27.9% |
| 04 Meimon · espalda | 75.8% | 38.2% |
| 05 Gōkoku · mano | 6.0% | 51.1% |
| 06 Ashi Sanri · pierna | 28.1% | 71.8% |
| 07 Yūsen · planta del pie | 86.3% | 86.3% |
| 08 Kinshin·Gyokueki · boca izq | 6.7% | 66.0% |
| 09 Ginkō · boca der | 39.1% | 63.2% |

Los dos últimos van sobre **los dos diagramas de boca** que trae la lámina.
Son recortes de detalle, no posiciones del cuerpo: por eso llevan 08 y 09 y su
ficha dice «detalle», en vez de meterse en el orden cabeza→pie.

**Sobre el tono de las fichas (corregido el 19-08):** dónde está el punto y para
qué sirve. **Y ya está.** Nada de explicar por qué la lámina dibuja tal cosa ni
de justificar por qué el punto está ahí: eso es inventarse un porqué. Las fichas
08 y 09 llevaban ese vicio y se reescribieron.

Aparte: preguntarle a Eme si hace **trabajo intraoral** en los faciales. Si lo
hace, es un diferenciador de servicio que no está contado en ninguna parte de la
web — pero eso iría en el texto del servicio, no en la ficha de un punto.

Yūsen no está estimado: **la propia lámina marca ese punto** con un punto negro
en el pie recortado, y ahí está puesto.

⚠️ **Si se cambia la imagen por otra, estas 5 coordenadas hay que rehacerlas.**

---

## Versiones actuales de los archivos

| Archivo | Versión actual | Dónde |
|---|---|---|
| `design.css` | **v=72** | línea 15 |
| `design.js` | **v=50** | línea 537 |
| `atlas.js` | **v=3** | línea 581 |
| `tokens.css` | **v=6** | línea 14 |

---

## La xilografía que quedó sin usar

`assets/lamina-meridianos.jpeg` es mejor lámina que la del atlas: papel
envejecido, marcas de doblez, tinta negra a mano. Y por ser tinta, aguanta la
baja resolución mucho mejor que la acuarela pálida del atlas.

No entró porque es **vertical y de una sola figura**, y el atlas necesitaba
frente y espalda. Pero su sitio natural es la sección `guide`, que ahora usa
`mapa-facial.jpeg` con el pie *"Diagrama japonés histórico del rostro"*.
Es mejor espécimen que el que hay puesto. **Pendiente de mirar.**

---

## Cómo levantar el entorno

Servidor local (NO abrir con `file://`, rompe rutas):

```bash
python3 -m http.server 8780 -d "/Users/meryvillena/Documents/Claude/Projects/portfolio-web/wellness"
```

Recargar siempre con **Ctrl+Shift+R** (el caché se come los cambios de CSS/JS).

---

## Qué está desactivado A PROPÓSITO (no "arreglar" sin hablarlo)

- **`scroll-motion.js`** — comentado en la línea 540. Marca: `SCROLL PARADO 18-08-2026`.
  Hay dos motores de movimiento mutuamente excluyentes: este (GSAP ScrollTrigger)
  y un motor de repuesto dentro de `design.js` a partir de la línea 645, bajo
  `if (!window.ScrollTrigger)`. Sólo puede vivir uno; ahora mismo corre el de
  repuesto, porque el de GSAP está comentado.

  **Aviso nuevo (19-08 tarde):** ese archivo anima `.pressure-a/b/c`, que
  **ya no existen** — los borró el atlas. Cuando se reactive hay que reescribir
  ese trozo del timeline para el atlas. El asa `.pressure-stage` sí se conservó
  a propósito en el elemento nuevo, para no romper `design.js:708`.

  **Problema real pendiente, verificado el 19 agosto 2026:** en `scroll-motion.js`
  línea 115, `end: 'bottom bottom-=112'` ata la duración del pin a la altura de
  cada sección, así que la 07 pina un 48 % menos que la 06 (1174 px frente a
  1740 px). La solución es calcular una duración de pin común a las dos
  secciones, no derivarla de la altura de cada una.

  Ojo: una nota antigua daba esto por arreglado con una función `sharedPinLength()`.
  **Esa función no existe en ningún archivo del proyecto.** Comprobado.
- **Secciones 06 y 07** (`service-corporal` y `service-facial`) — comentadas entre
  las líneas 328 y 432. Marca: `SECCIONES 06-07 MOVIDAS A TARJETAS EXPANDIBLES`.
  Su contenido vive ahora dentro de las tarjetas expandibles de la sección 05.

---

## Pendientes conocidos

1. ~~**Enlace muerto.**~~ **RESUELTO 19-08.** El enlace `Cómo funciona el
   Shiatsu ↘` se quitó del todo (apuntaba a `#corporal`, que está comentado).
   En su sitio va `.bridge-lead`, una entradilla que presenta el atlas.
2. **Precio de la sesión completa (95 €)** — sigue sin confirmar por Eme.
   Aparece en la tarjeta 04 y en el selector de reserva.
3. **IntersectionObserver de `[data-reveal]`** — frágil. En el navegador integrado
   de Claude Code no dispara bien; en Chrome normal sí funciona.

---

## Decisiones de diseño ya cerradas (no rehacer)

- **Tarjetas de sesión (sección 05):** carrusel coverflow de 4 tarjetas, esquinas
  a 40px, pie con `← puntos →` centrado. Se abren como overlay a pantalla completa.
- **Botones de la tarjeta, en este orden:**
  1. `Conocer la técnica` — botón outline del sistema de diseño (mismo estilo que
     `.guide-back`: borde `--accent`, `border-radius: var(--radius-organic)`).
  2. `Elegir esta sesión ↘` — link de texto con separador `border-top`.
- **Botón ✕ del overlay:** semitransparente a propósito
  (`rgba(242,238,229,.10)` + `blur(2px)`) para que se lea el texto por debajo.

---

## Tooltips de términos — arquitectura (costó dos intentos, no tocar a ciegas)

Hay **dos términos** con etiqueta: **Ki** y **tsubo** (este último añadido el
20-08). Y **tres** botones `.term`, porque el Ki lo abren dos sitios: la sección
Shiatsu y la tarjeta expandida del corporal de 90 min, que comparten definición.

**Cada botón dice cuál es la suya con `aria-describedby`.** Para añadir un
término nuevo bastan dos cosas: un `<button class="term">` con su
`aria-describedby`, y un `<span class="term-definition" id="...">`. El JS
recoge todas, las cuelga de `<body>` y abre la que toca. No hay nada más que tocar.

⚠️ **Las medidas ya no van a fuego.** Antes `colocarTerm` usaba `innerWidth-326`
y `innerHeight-170`, que eran el ancho y el alto del tooltip del Ki. Con un
segundo término de texto distinto eso lo habría descolocado. Ahora se mide el
elemento (`offsetWidth/offsetHeight`). Para el Ki el resultado es idéntico
—310+16=326 y 156+14=170—, así que no se movió nada de sitio.

Tres cosas que hay que respetar:

1. **Se muestra con la clase `.visible`**, no con el selector de hermano adyacente
   `.term[aria-expanded="true"] + .term-definition`. Ese selector exigía que el
   `<span>` estuviera pegado al botón, y por eso sólo funcionaba en la sección.
2. **El tooltip cuelga de `<body>`.** Si se queda dentro de su sección, el overlay
   de la tarjeta (`z-index: 900`) lo tapa. El tooltip va a `z-index: 1000`.
3. **El click SIEMPRE abre, nunca alterna.** Esto es lo que arregló el parpadeo
   original: el hover ya lo había abierto y el toggle lo cerraba en el mismo
   gesto, así que aparecía y desaparecía.

### Cierre (corregido el 19-08-2026)

Antes no cerraba al apartar el ratón: sólo con click fuera, Escape u otro Ki.
Era una **sobrecorrección** del parpadeo — se arregló apagando el toggle, no
haciéndolo pegajoso. Ahora:

- **Mientras el ratón está en la palabra, se queda quieto.** Indefinidamente.
- **Al salir de la palabra, se cierra.** No hace falta poder pasar el ratón por
  encima del tooltip: sale debajo y se lee sin moverse de la palabra.
- `TERM_ANTIRREBOTE = 90ms` en `design.js`. **No es margen para llegar al
  tooltip**, es para que un temblor de la mano en el borde no lo haga parpadear.
- **En táctil no cierra al apartar el dedo** (no hay hover). Sigue cerrando al
  tocar fuera o con Escape.

Comprobado: reposo cerrado → entra, abre → 600ms encima, sigue abierto →
sale → 150ms después, cerrado. Táctil: toco y aparto, sigue abierto.

## Aviso sobre verificación

El navegador integrado de Claude Code **congela las transiciones CSS**:
`getComputedStyle` devuelve el valor de arranque (`opacity: 0`) aunque el código
sea correcto. Para medir de verdad hay que anular la transición antes de leer:

```js
elemento.style.transition = 'none';
```

Y confirmar siempre con captura de pantalla, que es lo que vale.
