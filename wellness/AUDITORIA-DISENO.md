# Auditoría de diseño · ¿hay sistema aquí dentro?

21-08-2026 · Sólo diseño. La auditoría de UI va aparte, en `AUDITORIA-UI.md`.

**La pregunta que contesta este documento:** si mañana esto cae en manos de otra
persona, ¿puede hacer pantallas nuevas sin preguntar y sin romper la estética?

**Respuesta corta: en color y en espaciado, sí. En tipografía, no.**

---

## Primero, tu duda: ¿funciona como Figma?

Sí. **`var(--token)` en CSS es exactamente un estilo de Figma.** Defines el valor
en un sitio y todo lo que lo use cambia a la vez. No hay que ir uno a uno.

El proyecto ya tiene ese fichero: **`tokens.css`**. Ahí viven los colores, los
espacios, la escala tipográfica y las fuentes.

**Pero un token sólo sirve si se usa.** Y ahí está el problema: hay partes de la
página que escriben el valor a mano, saltándose el token. Esas partes **no van a
cambiar** cuando cambies el token. Es como tener un estilo en Figma y luego
maquetar la mitad de las pantallas escribiendo el tamaño a pelo.

Medido:

| Capa | Con token | A mano | ¿Sistema? |
|---|---|---|---|
| **Color** | 103 | 2 *(y son transparencias legítimas)* | **Sí** |
| **Espaciado** (padding, margen, hueco) | 173 | 14 | **Casi** |
| **Tipografía** | 108 | **27** | **No** |

Si mañana cambias `--color-pizarra`, cambia en los 103 sitios. Funciona.
Si cambias `--type-heading-m`, **27 sitios se quedan como están**.

---

# 1 · Tipografía · es el agujero

## 1.1 · Tu ejemplo tenía razón

En «La lógica de la acupuntura. Sin agujas.», los dos párrafos:

| Párrafo | Clase | Tamaño | Interlineado |
|---|---|---|---|
| «El cuerpo, en la técnica del Shiatsu…» | *(ninguna)* | **18 px** | 27,9 |
| «Aquí abajo hay nueve…» | `.bridge-lead` | **16 px** | 25,6 |

Dos párrafos seguidos, mismo papel visual, dos tamaños. Y encima **el que se
llama «lead» es el pequeño**: el nombre dice lo contrario de lo que hace.

## 1.2 · Hay 15 tamaños en pantalla y 9 en el sistema

La escala definida en `tokens.css` tiene nueve peldaños. En la página se usan
**quince**. Los seis de más no salen de ningún sitio: se escribieron a mano.

| Tamaño | Veces | ¿Está en la escala? |
|---|---|---|
| 10 px | 138 | sí · `--type-micro` |
| 14 px | 71 | sí · `--type-body-small` |
| 16 px | 47 | sí · `--type-body` |
| 12 px | 37 | sí · `--type-ui` |
| 40,32 px | 29 | sí · `--type-heading-m` |
| 18 px | 14 | sí · `--type-lead` |
| 90,72 px | 11 | sí · `--type-display-xl` |
| **28,8 px** | 8 | **no** |
| **34,56 px** | 8 | **no** |
| 63,36 px | 6 | sí · `--type-heading-l` |
| **25,92 px** | 4 | **no** |
| **9 px** | 4 | **no** |
| **19 px** | 2 | **no** |
| **10,44 px** | 2 | **no** |
| **8,12 px** | 1 | **no** |

## 1.3 · Los 24 sitios que escriben el tamaño a mano

Cada uno se inventó su propia escala, con su propio `clamp`:

| Qué | Tamaño inventado |
|---|---|
| `.wordmark` (la marca de la cabecera) | `19px` |
| `.option-title` (titular de tarjeta) | `clamp(24px,1.8vw,30px)` |
| `.option-meta dd` (duración y precio) | `clamp(26px,2vw,34px)` |
| `.option-detail h3` (titular del panel) | `clamp(26px,2.4vw,36px)` |
| `.guide-result h2` (titular de ficha) | `clamp(36px,3vw,52px)` |
| `.guide-result-lead` | `clamp(18px,1.25vw,22px)` |
| `.guide-recommendation strong` | `clamp(24px,2vw,32px)` |
| `.direct-booking-heading h2` | `clamp(40px,5vw,52px)` |
| `.service-duration-options strong` | `34px` |
| `.archive-tabs>button>b` | `9px` y `8px` |
| `.sensory blockquote` | `13vw` |
| Cuatro titulares de sección en móvil | `clamp(52px,16vw,76px)` |

**Ese último es importante:** cuatro secciones repiten el mismo `clamp` a mano en
sus media queries en vez de que el token traiga su propia versión móvil. Si
mañana quieres subir los titulares en móvil, hay que tocar cuatro sitios.

## 1.4 · El atajo `font:` esconde el problema

Hay **48 declaraciones** con la forma corta `font: 700 24px/1.1 var(--font-editorial)`.
Ese atajo mete peso, tamaño, interlineado y familia de una vez. **En 11 de ellas
el tamaño va escrito a mano** aunque la familia sí use token. Es fácil que pasen
desapercibidas: parece que usan el sistema porque se ve un `var()` dentro.

## 1.5 · Y lo más grave: la fuente principal no existe

`--font-functional` es `"Adrianna Extended", "Avenir Next Condensed", "Helvetica Neue", sans-serif`.

**Adrianna Extended no está en el proyecto ni instalada en el sistema.** Medido
comparando anchos de texto: lo que se está viendo es **Avenir Next Condensed**,
que sólo existe en Mac.

| Dónde se abra | Qué fuente sale | Ancho relativo |
|---|---|---|
| Este Mac | Avenir Next Condensed | 100 % |
| Windows / Android | Helvetica o Arial | **+28 %** |

El 75 % del texto de la página usa esa variable. **Quien abra esto en Windows ve
otra web.** Para un sistema de diseño que se entrega a otra persona, esto es lo
primero de todo: una fuente que no viaja con el proyecto no es un token, es una
suposición.


## 1.6 · Lo que se descubrió al ir a arreglarlo · 21-08-2026

**Adrianna Extended nunca ha estado en este proyecto.** Ni en `assets/fonts/`,
ni en las carpetas de fuentes del Mac. Buscada, no aparece.

Es decir: **todo el diseño se ha hecho, sin saberlo, sobre la segunda opción de
la lista** — Avenir Next Condensed.

Y ahí está el problema real: **Avenir Next Condensed es de Apple.** Está en
`/System/Library/Fonts/`, con licencia de sistema. No se puede incrustar en una
web ni redistribuir. Así que no vale con «meter la fuente que ya usamos»:
hay que **elegir una sustituta**, y eso cambia la estética.

Anchos medidos de «Handgloves 123» a 100 px:

| Fuente | Ancho | Respecto a hoy | Licencia |
|---|---|---|---|
| **Avenir Next Condensed** | **534,9** | — *(lo que se ve hoy)* | Apple · no incrustable |
| PT Sans Narrow | 559,6 | **+4,6 %** | OFL · libre |
| Barlow Semi Condensed | 586,9 | +9,7 % | OFL · libre |
| Archivo Narrow | 592,6 | +10,8 % | OFL · libre |
| Fira Sans Condensed | 628,7 | +17,5 % | OFL · libre |
| Roboto Condensed | 635,4 | +18,8 % | OFL · libre |
| Helvetica Neue | 687,7 | +28,6 % | *(lo que se ve hoy en Windows)* |

**Todas las libres son más anchas.** Ninguna es un reemplazo neutro.

**Y eso tiene consecuencias medibles en lo que acabamos de ajustar:**

- La sección de Eme cabe hoy en **900 de 900, exacto**. Con una fuente más ancha,
  el texto ocupa más líneas y deja de caber.
- Los botones tienen ancho fijo (320 × 68, 223 × 47, 136 × 29) con el texto justo
  dentro. «Conocer la técnica» tiene hoy 50 px de holgura sobre 140 disponibles;
  un +18 % de anchura se los come.
- El menú de la cabecera pide 459 px con «Eme Pérez» y salta a hamburguesa
  a 1080. Con una fuente más ancha ese umbral sube.

Por eso el orden importa: **la fuente primero, la escala después.** Ajustar
tamaños antes de cerrar la fuente es trabajo que habrá que repetir.

**Para elegir:** `prueba-tipografia.html` en la raíz del proyecto compara las
cinco candidatas con los bloques reales de la web —rótulos en mayúsculas,
cuerpo, botón y ficha— junto a la actual como referencia.

*(Esa página carga las fuentes desde Google Fonts para poder verlas. Para
producción hay que descargarlas y servirlas desde `assets/fonts/`, tanto por
velocidad como por no mandar la IP de cada visitante a Google.)*


## 1.7 · HECHO · la fuente ya viaja con el proyecto · 21-08-2026

**PT Sans Narrow**, elegida por Mery. `tokens.css` v=7 · `design.css` v=100.

Cuatro `.woff2` en `assets/fonts/`, servidos desde el propio proyecto, con
licencia SIL OFL:

| Archivo | Peso | Tamaño |
|---|---|---|
| `PTSansNarrow-Regular-latin.woff2` | 400 | 11,1 KB |
| `PTSansNarrow-Regular-latinext.woff2` | 400 | 7,2 KB |
| `PTSansNarrow-Bold-latin.woff2` | 700 | 11,2 KB |
| `PTSansNarrow-Bold-latinext.woff2` | 700 | 7,0 KB |

**Por qué PT Sans Narrow y no Roboto Condensed**, que también gustaba: medido con
la frase real de la web a 16 px, PT queda a **+7,3 %** de lo que había y Roboto a
**+22 %**. Tres veces más disrupción, y seis veces más peso de archivo
(220 KB frente a 37).

**El peso 300 dejó de ser un problema.** PT Sans Narrow no tiene 300, pero la
página de prueba pedía 300 y el navegador ya mostraba su 400: lo que se aprobó
mirando era el peso real. Las 3 declaraciones de `font-weight:300` del CSS se han
cambiado a 400 para no pedir un peso inexistente.

### Lo que se temía que rompiera, y no rompió

| | Antes | Con PT Sans Narrow |
|---|---|---|
| Sección de Eme en un viewport | 900 / 900 | **900 / 900** |
| Botón más apretado | 50 px de holgura | **88 px** sobre 175 |
| Ancho del menú | 459 px | 520 px · le sobran 303 |
| Desborde horizontal | no | no |

Comprobado a 1440, 1100 y 390. Sin errores en consola. Los macrones salen:
la ficha 05 muestra **Gōkoku 合谷** correctamente, que era lo que exigía el
subconjunto latin-ext.

### Dos apuntes

- **Nadie usa hoy el peso 700 de PT Sans Narrow**: todo lo que va en negrita usa
  la fuente editorial. Los dos archivos bold **no se descargan** mientras no
  hagan falta, así que no cuestan nada. Se quedan por si mañana se necesitan.
- **Sigue pendiente pasar Libre Baskerville de `.ttf` a `.woff2`**: son 466 KB
  que bajarían a unos 120. Ahí está la ganancia grande de peso.

---

# 2 · Color · esto sí es un sistema

103 declaraciones de color con token, cero en hexadecimal, y sólo dos en `rgba`
—transparencias del carbón, que es un uso legítimo—.

Cinco colores de texto en toda la página, y los cinco son tokens:

| Color | Token | Veces |
|---|---|---|
| `#34322d` carbón | `--color-carbon` | 193 |
| `#465f73` pizarra | `--color-pizarra` | 96 |
| `#f2eee5` cal | `--color-cal` | 45 |
| `#b7b0a5` mortero | `--color-mortero` | 44 |
| `#d4c3ad` arena húmeda | `--color-arena-humeda` | 4 |

**Cambias el token y cambia todo.** Esta capa está lista para entregar.

*(Lo que sí falla del color son las combinaciones que no dan contraste —mortero
sobre crema, pizarra sobre arena—. Eso está en `AUDITORIA-UI.md`, punto 1.2:
es un problema de accesibilidad, no de sistema.)*

---

# 3 · Espaciado · casi

| Propiedad | Con token | A mano |
|---|---|---|
| `padding` | 74 | 3 |
| `margin` | 63 | 11 |
| `gap` | 36 | 0 |

La escala `--space-1` a `--space-32` se usa de verdad. Los `px` sueltos que
quedan son casi todos posicionamiento absoluto (`top`, `left`), que es un uso
razonable.

---

# 4 · Lo que le falta al sistema para poder entregarse

Ahora mismo `tokens.css` cubre color, espacio, tipo y algo de motion. Para que
alguien pueda hacer una pantalla nueva sin preguntar, faltan:

- **Componentes documentados.** `.btn` ya existe y está cerrado (fill / ghost /
  sm, flecha opcional). `.specimen` también. Pero no están escritos en ningún
  sitio: viven sólo en el CSS.
- **Reglas de uso**, no sólo valores. «El texto de un botón va siempre a la
  izquierda» es una regla del sistema que descubrimos a mano el 21-08. No está
  documentada en ninguna parte.
- **Qué token toca para qué papel.** Hoy `--type-lead` se usa para un párrafo
  destacado en un sitio y `--type-body` para el mismo papel en otro.
- **La versión móvil dentro del token.** Cuatro secciones repiten a mano el mismo
  `clamp` móvil.

---

# 5 · Por dónde empezar, en orden

1. **Meter la fuente en el proyecto** (1.5). Sin esto, el sistema no existe
   fuera de este Mac. Es lo primero y no admite discusión.
2. **Cerrar la escala tipográfica**: decidir cuántos peldaños hay de verdad
   (probablemente 9 o 10) y mover a token los 24 sitios que escriben a mano.
3. **Renombrar por papel, no por tamaño.** Que `--type-lead` signifique
   «párrafo de entrada» y se use siempre para eso. El caso `.bridge-lead` es la
   prueba de que hoy no es así.
4. **Escribir el documento del sistema**: los tokens, los dos componentes que ya
   existen (`.btn`, `.specimen`) y las reglas de uso.
5. **Las parejas de color sin contraste** — pero eso es UI, no diseño.

Los puntos 2 y 3 son el «buen curro» que intuías. El 1 es media hora.
