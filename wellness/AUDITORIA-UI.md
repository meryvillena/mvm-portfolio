# Auditoría de UI · Eme Pérez

Hecha el 20-08-2026 sobre `index.html` servido en `localhost:8780`, midiendo
propiedades reales en el navegador a 1440 px y a 390 px de ancho.

**Cómo leer esto.** Cada hallazgo lleva el número medido y, al lado, con qué se
compara. «1,00 frente a un mínimo de 4,5» quiere decir: mide 1,00, la norma pide
4,5. No hay que calcular nada.

**Lo que no he podido comprobar y tienes que ver tú en tu Chrome** va marcado
con **[VER EN CHROME]**. Son cosas de gesto o de animación; el navegador
integrado no las ejecuta.

---

## Trampa nueva para la lista de EMPIEZA-AQUI

A las cinco que ya había, añade esta, que me ha costado un rato:

6. **`elemento.focus()` mueve el foco pero no dispara el evento `focus`.**
   Un componente que reacciona al foco parece roto y no lo está. Para probarlo
   de verdad: `elemento.dispatchEvent(new FocusEvent('focus'))`.

Por esa trampa estuve a punto de dar por roto el teclado del atlas. **No lo
está**: al enfocar un punto, su ficha se abre correctamente.

Y una séptima, que me costó un hallazgo entero en falso:

7. **`window.scrollTo()` mueve la página pero no ejecuta los manejadores de
   scroll**, porque casi todos viven dentro de un `requestAnimationFrame`, que
   está congelado (trampa 1). Cualquier cosa que dependa del scroll —la navbar,
   el carrusel— parecerá que no reacciona. Hay que llamar a la función a mano
   después de mover el scroll. Ver 1.1.

---

# 1 · Accesibilidad y contraste

## 1.1 · La navbar: comprobada, está bien ← RETIRADO

**En la primera versión de esta auditoría dije que la navbar era invisible sobre
las cuatro secciones oscuras. Era falso.** Lo apunto aquí en vez de borrarlo para
que no se vuelva a levantar la liebre.

Lo que hace de verdad `design.js` (líneas 107-133):

- Mientras estás en el hero, la navbar es transparente sobre fondo crema.
- **En cuanto sales del hero se le añade la clase `nav-scrolled`**, que le pone
  fondo crema al 90 % y un desenfoque por detrás (`backdrop-filter: blur(12px)`).
- Además se esconde al bajar y reaparece al subir (clase `nav-hidden`).

Medido sección por sección, con el fondo real por debajo del texto:

| Sección | Fondo de la sección | Contraste real de la navbar |
|---|---|---|
| hero | crema | 11,06 |
| bridge | crema | 11,06 |
| sensory | `#171a16` | **9,06** |
| guide | `#34322d` | **9,28** |
| services-intro | crema | 11,06 |
| perfil | `#465f73` | **9,65** |
| first-visit | crema | 11,06 |
| services-closing | `#34322d` | **9,28** |
| direct-booking | crema | 11,06 |

Todas entre 9,06 y 11,06, frente al mínimo de 4,5. **La navbar es el elemento
mejor resuelto de contraste de toda la página.** No hay nada que tocar.

**Por qué me equivoqué**, que es lo que interesa: se juntaron dos trampas de la
lista. La clase `nav-scrolled` se aplica dentro de un `requestAnimationFrame`
(trampa 1: congelado), así que nunca llegaba a ponerse; y el fondo de `.nav`
tiene `transition` (trampa 5), así que aunque se hubiera puesto, se habría leído
el valor de arranque, transparente. Dos capas de la misma mentira.

Para medir la navbar hay que hacer las tres cosas: matar la transición, mover el
scroll **y** llamar a `updateNavVisibility()` a mano.

## 1.1b · El cristal de la navbar · CAMBIADO 21-08-2026

Petición de Mery: que el efecto cristal se vea **desde el principio** y que sea
**más transparente**, porque apenas se apreciaba.

Estaba en `.nav-scrolled`, o sea que sólo aparecía **al salir del hero**, y con
un 90 % de opacidad: casi opaco, el desenfoque no se notaba. Ahora vive en la
regla base de `.nav`, con **62 % de opacidad y 16 px de desenfoque**.
`.nav-scrolled` se queda sólo con el filete de abajo.

**El 62 % no es un número estético, es el suelo.** Con más transparencia el
texto de la barra deja de cumplir el mínimo sobre la sección más oscura:

| Sección | Fondo | Contraste de la barra |
|---|---|---|
| las cinco crema | `#f2eee5` | 11,06 |
| **sensory** | `#171a16` | **4,73** ← el peor |
| guide y cierre | `#34322d` | 5,31 |
| perfil | `#465f73` | 6,34 |

Mínimo exigido: 4,5. Por debajo del **60 %** de opacidad, `sensory` cae a 4,1 y
deja de cumplir. Si algún día se quiere más cristal, hay que cambiar antes el
color del texto de la barra, no la opacidad.

**Un límite de esta medición:** el cálculo usa el color de fondo de cada sección,
no las fotos. Donde pase una imagen oscura por debajo de la barra, el contraste
local puede ser peor que el de la tabla. Eso hay que mirarlo a ojo.

## 1.2 · Textos por debajo del mínimo de contraste

Medidos con las animaciones neutralizadas, sobre su fondo real:

| Dónde | Texto | Contraste | Mínimo |
|---|---|---|---|
| `guide`, pie de la imagen | «Archivo facial · Fig. 02» | **1,49** | 4,5 |
| `bridge`, atlas | «Mueve el ratón por la lámina» | **1,63** | 4,5 |
| `services-intro`, tarjetas | «Duración», «Precio» | **1,86** | 4,5 |
| `services-intro`, tarjetas | número grande «01»…«04» | **1,86** | 3 |
| `guide`, pestañas | números «03» y «04» | **3,11** y **3,88** | 4,5 |
| `perfil` (banda azul) | «Práctica», «Especialidad», «Consulta» | **3,88** | 4,5 |

El de la lámina duele especialmente: **es la única instrucción de cómo se usa el
atlas** y está a 1,63. Quien no la lea no sabe que la lámina se recorre.

El patrón de fondo es siempre el mismo: **mortero `#b7b0a5` sobre crema**, o
**pizarra `#465f73` sobre arena**. Son dos parejas de tokens que no dan el
mínimo juntas. Merece la pena decidirlo en `tokens.css` una vez, no tarjeta a
tarjeta.

## 1.3 · Objetivos táctiles por debajo de 44 px

Medido a 390 px de ancho. El mínimo son 44×44 px.

| Control | Tamaño real |
|---|---|
| Botón «Menú» | **42 × 16** |
| Enlaces del menú abierto (×4) | **114 × 14** |
| «Elegir esta sesión» (el CTA de cada tarjeta) | **254 × 31** |
| Términos «Ki» y «tsubo» | **26 × 16** y **53 × 16** |
| Marca «EME PÉREZ» del pie | **113 × 38** |

El botón «Menú» es **el único control de navegación que existe en móvil** y mide
16 px de alto. Y los cuatro enlaces del menú desplegado están separados unos
45 px entre sí, pero su zona sensible sólo mide 14 px: **el hueco entre enlaces
no responde al dedo**.

Los puntos del atlas sí cumplen: 44×44 en móvil, 52×52 en escritorio. Bien.

## 1.4 · No hay enlace de salto al contenido

No existe el enlace «saltar al contenido» que permite a quien navega con teclado
esquivar la cabecera. En una página de 12 pantallas de alto se nota.

## 1.5 · El panel «Conocer la técnica» no gestiona el foco

Cuando se abre, `design.js` lo saca de la tarjeta y lo cuelga del final del
`<body>` (línea 1044), por detrás del pie de página. Consecuencias:

- **El foco no entra en el panel.** Se queda en el botón que lo abrió, que ahora
  está en otra parte del documento. Con Tab recorres el resto de la página por
  detrás del panel antes de llegar a su contenido.
- **La ✕ de cerrar queda la última de todo el orden de tabulación.**
- No lleva `role="dialog"` ni `aria-modal="true"`, así que un lector de pantalla
  no anuncia que se ha abierto una capa ni se queda dentro de ella.

Lo que sí funciona bien y no hay que tocar: cerrar con Escape, cerrar pinchando
el fondo, y que el foco vuelva al botón al cerrar. Eso ya está.

## 1.6 · Los campos del formulario a 10 px

Los dos formularios (el del orientador y el de `#cita`) tienen **todos** los
campos a 10 px de tamaño de letra.

En iOS, cualquier campo por debajo de 16 px hace que Safari **haga zoom
automático al tocarlo**, y ya no se sale del zoom. Es un salto brusco justo en el
paso de reservar.

Además, el campo «Email o teléfono» es `type="text"` con `autocomplete="email"` y
sin `inputmode`: el móvil abre el teclado de letras aunque quieras escribir un
teléfono, y el autorrelleno sólo ofrece correos.

## 1.7 · Detalles menores

- **Dos tarjetas tienen el mismo titular.** Las sesiones 01 y 02 son ambas
  `<h3>Shiatsu corporal</h3>`. Quien navega por titulares con lector de pantalla
  no puede distinguirlas: lo que las separa (60 vs 90 min) vive en la letra
  pequeña de abajo.
- **`.sensory-counter` dice «03 — 10»** y las secciones son nueve. Además un
  lector de pantalla lo lee tal cual, sin contexto.
- **Los puntos del carrusel son `aria-hidden`**, así que quien usa lector no
  tiene ninguna pista de «vas por la 2 de 4».

---

# 2 · Móvil

Probado a 390 px. **No hay desbordamiento horizontal en ninguna sección** — eso
está limpio.

## 2.1 · El atlas en móvil está bien resuelto

`atlas.js` detecta `max-width:800px` y cambia de modo: la lámina se ve entera y
quieta (390 × 437), los puntos se tocan directamente a 44×44, y la ficha se
ancla abajo con `position:fixed`. Es la decisión correcta y no hay que tocarla.

**Pero el aviso «Mueve el ratón por la lámina» se oculta en móvil** (`display:none`)
y no lo sustituye nada. En móvil no hay ninguna indicación de que los puntos se
puedan tocar.

## 2.2 · La banda azul de Eme

Mide **1.371 px de alto en móvil**, es la segunda sección más larga. El retrato
ocupa 350 px de los 390 disponibles. Estructuralmente correcta, sin
desbordamientos. **[VER EN CHROME]** el equilibrio entre retrato y texto: eso es
juicio visual, no medida.

## 2.3 · El carrusel en móvil

Las flechas ← → se ocultan (miden 0×0) y se navega deslizando. La tarjeta se
asoma la siguiente, que es lo que hay que conseguir. Correcto.

**Corrección del 21-08-2026:** aquí dije que en móvil las cuatro tarjetas estaban
al 100 % de opacidad. Era falso, y era otra vez la trampa 1: lo medí antes de que
`document.fonts.ready` disparase el primer pintado del carrusel. **La atenuación
al 45 % de las tarjetas laterales también ocurre en móvil.** Ver 4.5.

**[VER EN CHROME]** el deslizamiento con el dedo y que el `scroll-snap` centre
bien. El navegador integrado no ejecuta gestos reales.

## 2.4 · El menú

Se abre y se cierra correctamente, `aria-expanded` se actualiza bien. El único
problema es el de tamaño ya contado en 1.3.

---

# 3 · Ritmo de la página entera

Página completa: **10.710 px en escritorio (12 pantallas), 12.550 px en móvil
(15 pantallas)**. Nueve secciones.

| # | Sección | Alto | Pantallas | Fondo |
|---|---|---|---|---|
| 1 | hero | 1.040 | 1,16 | crema |
| 2 | bridge + atlas | 1.163 | 1,29 | crema |
| 3 | sensory | 1.125 | 1,25 | **negro** |
| 4 | guide (orientador) | 998 | 1,11 | **carbón** |
| 5 | services-intro (carrusel) | 1.389 | 1,54 | crema |
| 6 | perfil (Eme) | 1.429 | 1,59 | **azul** |
| 7 | first-visit | 1.751 | 1,95 | crema |
| 8 | services-closing | 702 | 0,78 | **carbón** |
| 9 | direct-booking | 1.018 | 1,13 | crema |

## 3.1 · El orientador llega antes que las sesiones

El recorrido que querías es *técnica → sesiones → quién → primera vez →
reservar*. El real es:

> técnica → **pausa** → **orientador** → sesiones → quién → primera vez →
> cierre → reservar

El orientador (sección 4) pregunta «¿cómo llegas hoy?» y recomienda una sesión
**antes de que la página haya presentado las sesiones** (sección 5). Se te pide
elegir antes de saber entre qué eliges.

Es el desajuste de fondo del ritmo. Cambiar el orden es barato: mover el bloque
`<section class="guide">` detrás de `services-intro`.

## 3.2 · Las secciones 8 y 9 hacen lo mismo

Sí, hay dos seguidas que hacen lo mismo, y son las del final.

- **8 · `services-closing`**: «Ya puedes elegir» + botón **«Pedir cita»** que
  apunta a `#cita`.
- **9 · `direct-booking`** (id `cita`): «Cuéntanos cuándo te viene bien» + el
  formulario de verdad.

El botón de la 8 te desplaza 702 px hacia abajo, o sea **a la sección que ya
venía justo después**. Es un CTA que lleva a lo que ya estabas a punto de ver.
La 8 se puede fundir en la 9 o eliminar sin perder nada.

## 3.3 · Dos formularios de reserva idénticos

El orientador (`.booking-form`) y `#cita` (`.direct-booking-form`) tienen los
mismos campos: Nombre / Email o teléfono / Preferencia. Son dos caminos
paralelos a la misma acción, con dos maquetaciones distintas que mantener.

## 3.4 · Dos secciones oscuras seguidas

`sensory` (`#171a16`) y `guide` (`#34322d`) van pegadas: 2.123 px de oscuridad
continua, y los dos tonos son lo bastante parecidos como para leerse como uno
solo. La pausa sensorial, que existe para ser un respiro, se funde con el
orientador y deja de funcionar como pausa.

Todo lo demás alterna bien claro/oscuro. Es el único punto donde se rompe.

## 3.5 · Falta el acceso a reservar en la navegación

El menú tiene: Shiatsu · Encuentra tu sesión · Sesiones · Eme. **No hay enlace a
«Cita»**, que es el punto de conversión. En una página de 12 pantallas, la única
forma de llegar a reservar es bajar del todo o pinchar el CTA de una tarjeta.

---

# 4 · Consistencia del sistema

## 4.1 · Lo del hover no era un botón suelto: es la norma

Encontraste un botón con reposo azul y hover negro. **Son cinco, y es toda la
familia primaria.** Hay dos convenciones de hover contradictorias conviviendo:

| Familia | Reposo | Hover | Quiénes |
|---|---|---|---|
| **A** | pizarra `#465f73` | **carbón `#34322d`** | `.hero-cta`, `.service-cta`, `.booking-submit`, `.guide-primary`, `.guide-back` |
| **B** | transparente | **pizarra `#465f73`** | `.options-arrow`, `.option-detail-close`, `.option-detail-btn` |

En la familia A el hover te aleja del color de marca; en la B te lleva a él. Hay
que elegir una.

*(La inversión de `.service-cta` dentro de `services-closing` — hover a crema —
sí está bien: es la adaptación correcta a fondo oscuro. Esa no la toques.)*

## 4.2 · La jerarquía visual de las tarjetas está invertida

Dentro de cada tarjeta de sesión hay dos acciones:

| Botón | Qué hace | Tamaño | Tratamiento |
|---|---|---|---|
| «Conocer la técnica» | informar | 12 px, alto 47 | botón con borde completo |
| **«Elegir esta sesión»** | **convertir** | **10 px, alto 26** | línea fina arriba, sin caja |

**La acción secundaria pesaba más que la principal.**

**ARREGLADO el 21-08-2026** (`design.css` v=77). Decisión de Mery: darle a
«Elegir esta sesión» el tratamiento del botón «Pedir cita» (`.service-cta`):
relleno pizarra, texto crema, forma orgánica, 12 px.

| | Antes | Ahora |
|---|---|---|
| Tamaño de letra | 10 px | **12 px** |
| Alto | 26 px | **56 px** (centrada) · 47 px (laterales) |
| Ancho | — | **324 px**, a todo el ancho de la tarjeta |
| Contraste del texto sobre el botón | — | **5,77** frente al mínimo de 4,5 |

Ahora los dos botones miden lo mismo y lo que los distingue es el relleno:
«Conocer la técnica» con borde, «Elegir esta sesión» relleno. Jerarquía
primario/secundario correcta.

De paso esto resuelve una línea de 1.3: en móvil el botón pasa de 31 px a
**47 px** de alto, por encima del mínimo de 44.

**Texto del botón, 21-08-2026:** decisión de Mery, pasa de «Elegir esta sesión»
a **«Pedir cita»**, el mismo rótulo que los otros dos CTA de la página. Como los
cuatro botones quedaban con el mismo texto, cada uno lleva ahora un añadido
invisible en pantalla pero que sí lee un lector de pantalla, con el nombre de su
sesión: «Pedir cita · Shiatsu corporal, 60 minutos». Se usa la clase `.sr-only`
que ya existía.

Un efecto colateral que hubo que atender: la regla
`.option-card:hover .option-pick{color:var(--accent)}` ponía el texto en pizarra,
que ahora es el color de relleno del propio botón. Habría quedado pizarra sobre
pizarra. Retirada.

## 4.3 · Tres colores para el mismo papel de «botón secundario»

Todos son botones de borde con la misma forma orgánica:

- `.hero-secondary` → borde y texto **carbón**
- `.option-detail-btn` → borde y texto **pizarra**
- `.guide-back` → borde y texto **pizarra**

Mismo papel, dos colores.

## 4.4 · Cuatro tamaños de letra para controles

10 px (`.option-pick`), 12 px (los CTA), 16 px (pestañas del archivo y flechas),
18 px (la ✕ de cerrar). Y dos tamaños de botón redondo: 36 px las flechas del
carrusel, 31 px la ✕.

## 4.5 · Las tarjetas laterales del carrusel al 45 %

En escritorio, las tres tarjetas no centradas bajan a `opacity: 0.45`. Su texto
queda entre **2,36 y 2,41 de contraste**, frente al 4,5 exigido.

Y encima el botón «Conocer la técnica» de esas tarjetas llevaba además su propio
`opacity: 0.34`. Multiplicado: **0,15 de opacidad, contraste 1,22**. Un botón
prácticamente invisible.

**ARREGLADO el 21-08-2026** (`design.css` v=77). Retirado ese `opacity:.34`. El
apagado ya lo daba la tarjeta; la segunda opacidad sólo lo multiplicaba. El botón
pasa de **0,15 a 0,45** de opacidad efectiva, igual que el resto del contenido de
su tarjeta.

**PENDIENTE DE DECISIÓN — el suelo del 0,45.** Esto no lo he tocado porque es tu
efecto de carrusel, no un fallo. Pero mientras las tarjetas laterales estén al
45 %, **cualquier** texto que lleven dentro se queda entre 1,98 y 2,41 de
contraste, frente al mínimo de 4,5. Incluido ya el botón nuevo de reservar.

Mis números para que decidas: subir el suelo de **0,45 a 0,72** deja el texto de
las tarjetas laterales en unos 4,7 y sigue distinguiendo claramente la centrada
de las de los lados. Por debajo de 0,70 no hay forma de cumplir el mínimo.

Ese botón, en las tarjetas laterales, también lleva `aria-disabled="true"` y
**no abre nada al pulsarlo**: el primer clic centra la tarjeta y el segundo abre
(está documentado a propósito en `design.js` línea 1074). Para ratón es un patrón
defendible. Para teclado y lector de pantalla no: se anuncia como «no
disponible» y el primer clic no produce ningún cambio visible.

## 4.6 · El texto de los botones: unos a la izquierda y otros al centro

**ARREGLADO el 21-08-2026** (`design.css` v=78). Regla del sistema fijada por
Mery: **el texto de un botón va siempre alineado a la izquierda.**

Lo curioso del caso: **no había ni una sola línea de `text-align` en todo
`design.css`.** El centrado venía del propio navegador, que centra por defecto el
texto de cualquier `<button>` — pero no el de un `<a>`. Por eso los CTA que son
enlaces (`.hero-cta`, `.service-cta`, `.option-pick`) iban a la izquierda y los
que son botones (`.booking-submit`, `.guide-primary`, `.guide-back`) al centro,
sin que nadie lo hubiera decidido.

Encima de eso, `.option-detail-btn` centraba dos veces: por el navegador y por su
propio `justify-content:center`. Era el único que se notaba a simple vista.

Ahora los once botones con texto arrancan exactamente en su `padding` izquierdo,
comprobado uno a uno. Los dos que sólo llevan icono —las flechas ← → del carrusel
y la ✕ de cerrar— se quedan centrados a propósito.

## 4.7 · Las tres fotos eran el mismo componente escrito tres veces

**ARREGLADO el 21-08-2026** (`design.css` v=79). Petición de Mery: usar para la
foto de Eme el mismo componente que las demás, y hacerla más pequeña.

El marco de papel —cabecera con rótulo y número, ventana 4/5, pie con título y
contexto— estaba escrito **tres veces**, en `.hero-art`, `.perfil-retrato` y
`.first-visit-archive`, con el mismo código y pequeñas divergencias por
descuido. Ahora hay un componente, `.specimen`, y cada sección sólo añade lo
suyo: su sitio en la rejilla y el tratamiento de su imagen.

Lo que quedaba divergente sin que nadie lo hubiera decidido:

| | Hero | Eme | Primera sesión |
|---|---|---|---|
| Tope de ancho | sí | **ninguno** | sólo en móvil |
| `align-items` de la cabecera | `flex-start` | `flex-start` | sin declarar |
| Pie con `line-height` | sí | **no** | sí |

**Por eso la foto de Eme salía la más grande de la página:** era la única de las
tres sin tope de ancho, así que se comía las seis columnas enteras de su rejilla.

Medido a 1440 px, las tres cartelas son ahora idénticas:

| | Antes | Ahora |
|---|---|---|
| Marco | hero 544 · **Eme 660** · primera 544 | **544 × 782** las tres |
| Ventana de la imagen | Eme **618 × 773** | **502 × 628** las tres |
| Cabecera / pie | 40-48 / 64 | **48 / 64** las tres |

Se conservan a propósito las tres diferencias que sí eran decisiones: el rótulo
y el pie de Eme van en pizarra sobre la banda azul, la ventana de «primera
sesión» tiene fondo carbón para su lámina en negativo, y el hero mantiene su
grano y su parallax.

## 4.8 · Las fotos estaban numeradas fuera de orden

**ARREGLADO el 21-08-2026.** La serie de cartelas iba **01 → 04 → 03** según se
baja por la página. El 02 se lo había quedado la sección del facial, que está
comentada desde el 18-08 y ya no se pinta, así que el número estaba libre.

| Sección | Antes | Ahora |
|---|---|---|
| hero | 01 | **01** |
| perfil · Eme | 04 | **02** |
| primera sesión | 03 | **03** |

*(No he tocado las otras dos numeraciones porque son series aparte, con su propio
rótulo: «Diagrama 01» en el atlas y «Archivo facial · Fig. 02» en el orientador.
Si quieres que todo sea una sola serie correlativa, dímelo.)*

## 4.10 · Componente de botón · HECHO 21-08-2026

`design.css` v=90. Había **cinco familias de botón** con tres tamaños de letra y
tres colores para el mismo papel (hallazgos 4.1, 4.2, 4.3, 4.4). Ahora hay un
componente, `.btn`, tomando como patrón el botón del hero, que es el aprobado:

| | |
|---|---|
| `.btn` | la forma: silueta orgánica, doble contorno, 12 px, texto a la izquierda, flecha opcional |
| `.btn--fill` | relleno pizarra, texto crema — acción principal |
| `.btn--ghost` | sólo borde pizarra — acción secundaria |
| `.btn--sm` | versión compacta, para tarjetas y cabecera |

**16 botones**, todos con la misma tipografía y la misma silueta, ninguno por
debajo del mínimo de contraste. Alturas: 66-67 px los normales, 49 px los `sm`,
33 px el de la cabecera. *(En el carrusel salen 42 y 50 porque las tarjetas
laterales están escaladas: es el efecto, no una inconsistencia.)*

**Lo que costó de verdad no fue crear el componente, fue quitar lo viejo.** Al
añadirlo, las reglas antiguas seguían ahí peleando: mismo botón declarado dos
veces con valores distintos. **27 reglas borradas, 5.263 caracteres menos de
CSS.** Un componente que convive con lo que venía a sustituir no es un
componente, son dos.

Y una regla suelta que sobrevivió a la primera pasada —los botones de la ficha
con su propio relleno— dejaba tres alturas distintas dentro de la misma
variante. Se caza midiendo, no leyendo.


### Corrección del mismo día · la forma sí era distinta

Di el componente por bueno comprobando que el `border-radius` **declarado** era
idéntico en los 16 botones. Y lo era. Mery miró la pantalla y dijo que los veía
todos diferentes. Tenía razón.

**El radio orgánico está en porcentajes**, así que el radio real en píxeles
depende de la proporción de la caja. Mismo CSS, siluetas distintas:

| Botón | Caja | Proporción |
|---|---|---|
| Hero (el aprobado) | 320×66 | 4,83 |
| Enviar solicitud | 483×67 | **7,17** |
| Tarjetas del carrusel | 273×42 | 6,44 |
| Cerrar ficha | 151×49 | **3,05** |

De 3,05 a 7,17: más del doble. Unos salían ovalados y otros casi redondos.

Arreglado fijando **ancho y alto** en cada talla, todas con la proporción del
hero. Ahora las cuatro tallas son 320×68, 223×47, 188×40 y 136×29 —
**proporción 4,71 a 4,74 en los dieciséis**. Los `min-width:100%` que estiraban
unos botones y otros no, fuera.

**La lección:** comparar el CSS declarado no prueba que dos cosas se vean igual.
Con valores relativos —porcentajes, `em`, `vw`— hay que medir el resultado
renderizado. Es la misma clase de error que la navbar y que el foco del atlas:
medir la intención en vez del resultado.


### Segunda corrección · el componente estaba bien, el reparto no

Mery volvió a decir que los veía todos distintos. Volvía a tener razón, y el
fallo no estaba en el componente sino en **cómo lo había repartido yo**:

**1 · El efecto imán le faltaba a 10 de los 18 botones.** Incluso a «Qué es el
Shiatsu», en el hero, justo al lado de «Conoce la técnica», que sí lo llevaba.
Los ocho del carrusel tampoco. Un botón que se mueve al acercar el ratón y otro
idéntico que no se mueve **no son el mismo botón**, midan lo que midan.

**2 · Las tallas estaban repartidas sin criterio.** En el cierre, «Pedir cita»
320×68 y «Ver orientador» 223×47: dos botones juntos, tamaños distintos. Y el
texto más largo en la caja más pequeña. En el orientador, los dos en talla
pequeña sin ninguna razón — el panel tiene 661 px útiles y caben de sobra.

**3 · La letra sí estaba bien:** 12 px en los dieciocho. Lo que se leía como
«tipografía más pequeña» era la caja, no la tipografía.

Ahora: **imán en los dieciocho**, y **una sola talla por sección**.

| Dónde | Talla |
|---|---|
| hero, orientador, cierre, reserva | **320 × 68** |
| carrusel | 223 × 47 · el interior de la tarjeta sólo da 225 px |
| cabecera | 136 × 29 · decisión de Mery, es la única excepción |

Para que los dos del orientador cupieran en talla normal hubo que apilarlos en
vez de ponerlos en fila: 320 + 320 + 24 de hueco son 664 y sólo hay 661.

**La lección:** tener un componente no garantiza nada si se aplica a ojo. Las
tres veces que Mery dijo «los veo diferentes» tenía razón y yo había comprobado
lo que no era — primero el radio declarado, luego la proporción, y al final
resultó ser el imán y el reparto de tallas. Lo que hay que medir es lo que
distingue a un botón de otro **en pantalla**, atributo por atributo, no si
comparten clase.


### La cartela de Eme · comprobada a fondo 21-08-2026

Mery la seguía viendo enorme y con medidas distintas a la 01. Esta vez comparé
**todas** las propiedades calculadas de cada parte —ficha, cabecera, ventana,
imagen y pie—, no una lista elegida por mí. Unas 340 por elemento.

**Las tres cartelas miden 544 × 782 exactamente.** La de Eme no es más grande.

Las únicas diferencias reales que salieron, y ninguna es de tamaño:

| Qué | Por qué |
|---|---|
| Color del rótulo y del pie | A propósito: pizarra sobre la banda azul |
| Sitio en la rejilla y margen inferior | Cada una va en su sección |
| `--foto-zoom` sólo en el hero | Correcto: sólo se aplica a lo que está en pantalla |
| **`aspect-ratio` de la imagen de Eme** | Ver abajo |

**El `aspect-ratio` no es un defecto, es lo contrario.** La imagen de Eme es la
única de la página que lleva `width` y `height` en el HTML, y por eso el
navegador le calcula una proporción propia. Eso es justo lo que pide el hallazgo
5.2: **las otras nueve imágenes deberían llevarlo también**, para que el texto no
salte al cargar.

**Entonces, ¿por qué se veía enorme?** No era la cartela, era lo de al lado. La
columna de texto tenía **dos frases** —unos 300 px de alto— junto a una foto de
782. Con los textos nuevos:

| | Antes | Ahora |
|---|---|---|
| Alto de la foto | 782 | 782 |
| Alto del texto | ~300 | **779** |
| Alto de la sección | 1.429 | **1.281** |

Tres píxeles de diferencia entre las dos columnas. El problema no era de medidas,
era de contenido.


### La sección de Eme en un viewport · 21-08-2026

Medía **1.281 px** sobre un viewport de 900: sobraban 381. De dónde salían:

| Pieza | Alto |
|---|---|
| Relleno arriba + abajo | 270 |
| Encabezado en fila propia a todo lo ancho | 158 |
| Hueco entre filas | 72 |
| Fila de foto y texto | 782 |

Tres cambios, y **ninguno toca el tamaño de la foto** —sigue en 544 × 782, igual
que las otras dos cartelas—:

1. Relleno propio de la sección: de 135 px a `clamp(40px,6vh,56px)`.
2. El encabezado deja de ocupar fila propia: se apila sobre el texto en la
   columna izquierda, y la foto pasa a ocupar las dos filas a la derecha.
3. La ficha de datos pasa de tres renglones apilados a **una fila de tres**:
   de 165 px a 51. Sin quitar ni un dato.

Resultado: **900 de 900. Exacto.**

**Dónde deja de caber, que es lo que hay que saber:**

| Alto de ventana | Sección | ¿Cabe? |
|---|---|---|
| 1080 | 1080 | sí |
| 900 | 900 | sí, exacto |
| **880** | 883 | **se pasa 3 px** |
| 760 | 869 | se pasa 109 px |

**El suelo está en ~885 px de alto de ventana.** Y la causa es estructural: la
foto encoge con la altura de pantalla porque su ancho se calcula con `svh`,
pero **el texto no encoge**: la columna izquierda se queda clavada en 778 px a
cualquier altura.

Para bajar de ahí habría que ligar también el cuerpo de letra y los márgenes del
texto a la altura de ventana. Se puede —llegaría hasta unos 760— pero la letra
bajaría a 14 px. Es una decisión de legibilidad, no técnica: pendiente de Mery.


### El titular de Eme no era como los demás · 21-08-2026

Mery lo vio a ojo. Medido, eran **dos** diferencias, no una:

| Sección | Tamaño | Peso |
|---|---|---|
| hero, Shiatsu, sesiones, primera sesión, cierre | 90,72 px | 700 |
| orientador y reserva *(van dentro de un panel)* | 63,36 px | 700 |
| **Eme** | **63,36 px** | **400** ← el único de la página en 400 |

El peso pesa más que el tamaño: era el único titular de toda la web en 400.

Ahora está en **90,72 px y peso 700**, con la familia a la que pertenece. Y en
**una sola línea**: en dos no cabría la sección en un viewport.

**Y de paso mejora el suelo de altura.** El titular en una línea ocupa 80 px en
vez de 122, así que la columna izquierda baja de 778 a 736:

| Alto de ventana | Antes | Ahora |
|---|---|---|
| 900 | cabe | cabe |
| 850 | se pasaba 33 | **cabe exacto** |
| 820 | se pasaba 63 | se pasa 14 |

El suelo baja de **~885 px a ~845 px** de alto de ventana.

**Un aviso para móvil:** a 390 px de ancho, «Eme Pérez» ocupa 316 px en una
columna de 316. Justo al límite. En pantallas más estrechas (un iPhone SE, 360)
se partirá en dos líneas. Ahí no importa, porque en móvil la sección es una
columna y no tiene que caber en una pantalla.

## 4.11 · Las tres cartelas de foto, idénticas · HECHO 21-08-2026

Petición de Mery: que las fotos 01, 02 y 03 sean exactamente iguales. Lo eran en
medidas desde v=79, pero no en efectos:

| | Antes | Ahora |
|---|---|---|
| Grano sobre el papel | sólo el hero | **las tres** |
| Flotación lenta | sólo el hero | **las tres** |
| Fondo de la ventana | crema, crema, **carbón** | crema las tres |
| Mezcla y filtro | tres tratamientos distintos | **el del hero en las tres** |

Lo único que sigue siendo de cada una es el **encuadre** (`object-position`):
son fotos distintas y recortarlas igual dejaría la cara de Eme fuera del marco.

**Ojo con la 03.** Su lámina se veía en negativo (fondo carbón y mezcla
`screen`). Ahora se ve como las otras dos: oscura sobre papel claro. Es más
coherente, pero es un cambio visible — conviene mirarla.

**Zoom al scroll.** La foto crece de 1,00 a 1,08 dentro del marco según sube por
la pantalla. Medido: el marco se queda en 544 × 782 y la ventana en 502 × 628 en
todo el recorrido; sólo se mueve la imagen. Se desactiva con «reducir
movimiento».

## 4.12 · Con `prefers-reduced-motion` las flechas del carrusel están muertas

`design.js` línea 967 mete **todo** el carrusel dentro de
`if (carouselTrack && !matchMedia('(prefers-reduced-motion: reduce)').matches)`.
Quien tenga activado «reducir movimiento» en su sistema no recibe los escuchadores
de las flechas ← →: siguen visibles y no hacen nada.

*(Leído en el código, no medido: no puedo emular esa preferencia aquí.)*

Lo bueno: en ese modo las tarjetas quedan todas al 100 % y los cuatro botones
«Conocer la técnica» abren bien. Es, irónicamente, la versión más accesible.

---

# 5 · Peso y rendimiento

**Carga inicial: 1.516 KB.** Más 6 imágenes diferidas ≈ 370 KB. Total ~1,9 MB.

| Recurso | Peso | Comentario |
|---|---|---|
| `anatomia-maestra-web.png` | **450 KB** | 1600×1131 nativo, se muestra a 500×626 |
| 3 × Libre Baskerville `.ttf` | **466 KB** | en `.woff2` bajarían a ~120 KB |
| `mapa-facial.jpeg` | 131 KB | JPEG |
| `orientador-metodo.jpeg` | 109 KB | JPEG |
| `atlas-puntos-limpio.webp` | 104 KB | |
| `gsap.min.js` + `ScrollTrigger.min.js` | **114 KB** | |
| `design.css` | 80 KB | |
| `design.js` | 52 KB | |

**Las dos ganancias grandes, por este orden:**

1. **Las fuentes en `.woff2`** — 466 KB → ~120 KB. Un solo cambio, ~350 KB. Es
   el formato estándar para web; el `.ttf` es formato de sistema operativo.
2. **El PNG del hero a WebP** y al tamaño que se usa — 450 KB → ~60-80 KB.

## 5.1 · Archivos que no usa nadie

Confirmado cruzando `assets/` contra `index.html`, `design.css`, `design.js` y
`atlas.js`:

| Archivo | Peso |
|---|---|
| `assets/anatomia-maestra.png` | **2,7 MB** |
| `assets/lamina-meridianos.jpeg` | 304 KB |
| `assets/atlas-puntos.jpeg` | 108 KB |
| `assets/fonts/Pecita.otf` | 863 KB |
| `assets/fonts/Pompiere-Regular.ttf` | 37 KB |
| `assets/fonts/Manuscribe-Free.otf` | 9 KB |
| `assets/fonts/LibreBaskerville-Italic.ttf` | 172 KB (se usa la variable) |

**Total: ~4,2 MB muertos.** No pesan al cargar la página, pero sí se suben a
Netlify. `orientador-cuerpo`, `orientador-ritmo` y `mapa-facial` **sí se usan**
(las carga `design.js` para el orientador, aunque en el HTML sólo aparezcan
dentro del bloque comentado). No las borres.

## 5.2 · Ninguna imagen declara sus dimensiones

Sólo `eme-retrato.webp` lleva `width` y `height`. Las otras nueve no, así que el
navegador no reserva su hueco y el texto salta al cargarlas.

## 5.3 · GSAP se carga y `scroll-motion.js` está parado

`gsap` + `ScrollTrigger` son 114 KB que se descargan siempre. `design.js` sí los
usa cuando están (línea 10 bifurca según exista `window.ScrollTrigger`), así que
**no son peso muerto** — pero conviene tenerlo presente cuando se decida qué
hacer con los dos motores de movimiento.

---

# 6 · Sobre `--plate-w`: un dato para tu decisión

Está bloqueado elegir entre 1600 y 2600. Un dato medido que quizá cambie la
pregunta:

**La lámina original mide 736 × 824 px.** A `--plate-w: 1600px` se está
ampliando **2,17 veces**. En una pantalla Retina eso son 4,3 veces el píxel real:
la lámina se ve blanda. A 2600 serían **3,5 veces**, y peor.

Además, a 1600 el visor (980 × 504) enseña **el 17 % de la lámina**. A 2600
enseñaría cerca del 10 %.

La decisión de fondo no es 1600 o 2600: es **si hace falta un escaneo de la
lámina a más resolución**. Con el archivo actual, 2600 no es una opción real.

## 6.1 · El atlas con teclado: los puntos quedan fuera de vista

El teclado abre las fichas correctamente. Pero la lámina sólo se mueve mientras
el ratón está dentro del visor (`atlas.js`, `bucle()` sólo corre si `dentro`), y
el visor es `overflow:hidden`, así que no puede desplazarse solo.

Resultado medido en reposo: **de los 9 puntos, sólo el 03 está dentro del área
visible.** Quien tabula abre la ficha del punto 01 sin ver nunca el punto 01.

Se arregla desplazando la lámina al punto que recibe el foco, reutilizando `tx`
y `ty` que ya existen.

---

# Por dónde empezaría

Ordenado por «qué hace que la pieza parezca sin terminar», que para un caso de
portfolio pesa más que «a cuánta gente afecta».

1. ~~**El botón invisible del carrusel** (4.5).~~ **HECHO** · v=77
2. ~~**Dar peso a «Elegir esta sesión»** (4.2).~~ **HECHO** · v=77
2b. **Decidir el suelo de opacidad de las tarjetas laterales** (4.5). Es lo único
   que queda abierto del carrusel, y bloquea el contraste de todo su contenido.
3. **Elegir una convención de hover** (4.1) y **un solo color de botón
   secundario** (4.3). *(La alineación del texto, 4.6, ya está resuelta: v=78.)*
4. **Los textos bajo el mínimo de contraste** (1.2), resueltos en `tokens.css`
   y no uno a uno. El peor es la instrucción del atlas, a 1,63.
5. **Campos del formulario a 16 px** (1.6). Evita el zoom de iOS en el paso de
   reservar.
6. **Tamaño táctil del botón «Menú» y de los enlaces del menú** (1.3).
7. **`width` y `height` en las nueve imágenes que no los llevan** (5.2).
8. **Mover el orientador detrás de las sesiones** (3.1) y **fundir la sección 8
   en la 9** (3.2). Esto cambia el argumento de la pieza: decisión de Mery.
9. **Foco dentro del panel de detalle** (1.5) y **atlas con teclado** (6.1).
10. **Faena de mantenimiento, toda junta**: fuentes a `.woff2`, el PNG del hero
    a WebP, y borrar los 4,2 MB de archivos muertos (5, 5.1).

# Lo que hay que ver en Chrome

Nada de esto se puede dar por bueno desde aquí:

- El deslizamiento del carrusel con el dedo, y que centre bien.
- El recorrido de la lámina con el ratón (`MARGEN`, `SUAVIDAD`, `FRENO`,
  `PEGUE`, `TOQUE`).
- El primer-clic-centra / segundo-clic-abre de las tarjetas laterales.
- El equilibrio visual del retrato de Eme en la banda azul, en móvil.
