# Mapa de enlaces · a dónde apunta cada cosa

Sacado del DOM real el 21-08-2026, no de lo que creíamos que había.
Se borra cuando el menú definitivo esté decidido y metido.

---

# ESTADO · 21-08-2026 · MENÚ NUEVO METIDO

`design.css` v=84. El menú aprobado está dentro y comprobado a 1440, 1200, 900 y
390, con el desplegable abierto y cerrado. Sin desbordes, sin errores.

| Enlace | Va a | ¿Existe el destino? |
|---|---|---|
| Shiatsu | `#shiatsu` | sí |
| **La técnica** | `#orientador` | sí |
| Sesiones | `#sesiones` | sí |
| **Primera sesión** | `#primera-sesion` | sí ← ya no es huérfana |
| Eme | `#eme` | sí |
| **Pedir cita** *(destacado)* | `#cita` | sí ← ya se puede reservar desde arriba |

**Cómo se llegó a «La técnica».** Tres intentos, y cada uno chocaba con algo que
ya estaba escrito en otro sitio:

| Candidato | Por qué no |
|---|---|
| «Encuentra tu sesión» | Prometía sesiones, y el orientador dejó de tenerlas |
| «Conoce el Shiatsu» | El menú tendría «Shiatsu» y «Conoce el Shiatsu»: dos entradas casi iguales |
| «Orientador de Shiatsu» | Repetía «Shiatsu» dos veces en la misma fila |
| «Conoce la técnica» | **Es el texto de los cuatro botones del carrusel**, que llevan a otro sitio |
| **«La técnica»** ← | Ninguna colisión. Y el más corto de todos. |

La lección, que vale para el resto del proyecto: **antes de bautizar algo, buscar
esas palabras en la página.** Tres de los cuatro descartes se cazan con un
`grep`, no con criterio.

**Nuevo enlace en la reserva.** Justo antes del formulario de `#cita`:
«¿Es tu primera sesión? Mira qué puedes esperar ↗» → `#primera-sesion`.
241 × 27 px, contraste 5,77. Va ahí porque es donde alguien duda de si sabe lo
suficiente para pedir cita. Moverlo después del formulario es un minuto.

Contraste del botón «Pedir cita»: **5,77** frente al mínimo de 4,5.

**El atlas se queda dentro de Shiatsu**, sin puerta propia. Decidido por Mery.
El problema 3 de este documento queda cerrado como «así lo queremos».

## Dos cosas que hubo que arreglar por el camino

**1 · Los seis enlaces no cabían.** El flex los encogía sin avisar: a 900 px los
seis se partían **en tres líneas** dentro de cajas de 41 px y la cabecera se
estiraba de 68 a 96 px.

Tres arreglos, y el tercero es el que de verdad importa:

- Los enlaces ya no se dejan encoger nunca.
- El menú de hamburguesa entra a **1080 px** en vez de a 800. Sólo cambia la
  cabecera; el resto del diseño sigue rompiendo a 800.
- **La rejilla de la cabecera era `1fr auto 1fr`**, que obliga a que las columnas
  de los extremos midan lo mismo. La marca se quedaba **503 px cuando sólo
  necesita 126**, y al menú no le llegaba. Ahora es `auto 1fr auto`: marca y menú
  piden lo suyo y la holgura se la queda el medio.

El cambio de rejilla es el que da el aire. Medido a 1200 px: antes quedaban
**0 px** entre la coletilla y el menú; ahora quedan **189**.

**2 · Un fallo de orden que dejaba la franja 800-1080 sin ningún menú.** Puse el
bloque nuevo antes de la regla que oculta el botón de hamburguesa, así que esa
regla lo pisaba: ni menú horizontal ni hamburguesa. Está anotado en el CSS para
que no se repita.

## Efecto secundario que conviene mirar

La cabecera pasa de **68 a 81 px** de alto, porque el botón «Pedir cita» lleva
relleno y estira la fila.

A cambio, los enlaces del menú pasan de **14 px de alto a 32**, que va en la
dirección buena del hallazgo 1.3 de la auditoría (el mínimo táctil son 44).

Si prefieres recuperar los 68 px, se le quita relleno al botón — pero los
enlaces vuelven a ser finos. Dímelo cuando lo veas.

## Lo que sigue abierto

- ~~El botón azul del hero~~ **RESUELTO.** Dice «Conoce la técnica» y sigue
  llevando a `#orientador`. **«Encuentra tu sesión» ya no existe en la página.**

  Los dos botones del hero apuntan ahora exactamente a las dos primeras entradas
  del menú, y con nombres emparejados:

  | Hero | Menú | Destino |
  |---|---|---|
  | Conoce la técnica | La técnica | `#orientador` |
  | Qué es el Shiatsu | Shiatsu | `#shiatsu` |

- **Roce que queda vivo, decidido por Mery:** «Conoce la técnica» (hero →
  orientador) y «Conocer la técnica» (los cuatro botones del carrusel → el panel
  de cada sesión) se diferencian en una letra y llevan a sitios distintos. Se
  acepta a propósito. Si algún día molesta, lo que hay que renombrar son los
  cuatro del carrusel, no el del hero.
- **El bucle del cierre**, sin tocar.

---

## Las nueve secciones y quién entra en ellas

| # | Sección | id | Cuántos enlaces la apuntan |
|---|---|---|---|
| 1 | hero | `#inicio` | 2 · las dos marcas «EME PÉREZ» |
| 2 | Shiatsu + atlas | `#shiatsu` | 2 · menú «Shiatsu» + botón «Qué es el Shiatsu» |
| 3 | pausa sensorial | **sin id** | **0** · no se puede enlazar |
| 4 | orientador | `#orientador` | 3 · menú, botón azul del hero, «Ver orientador» del cierre |
| 5 | sesiones (carrusel) | `#sesiones` | 1 fijo (menú) **+ 4 dinámicos** (el «Ver las sesiones» de cada ficha) |
| 6 | Eme | `#eme` | 1 · menú |
| 7 | primera sesión | `#primera-sesion` | **0** ← tiene id y nadie lo usa |
| 8 | cierre | **sin id** | **0** |
| 9 | cita | `#cita` | 5 · las 4 tarjetas + «Pedir cita» del cierre |

Y un décimo destino que no es sección: **`#atlas`**, dentro de `#shiatsu`.
Tiene id y **tampoco lo enlaza nadie**.

---

## Los quince enlaces, uno a uno

| Texto | Está en | Va a |
|---|---|---|
| EME PÉREZ | cabecera | `#inicio` |
| Shiatsu | cabecera | `#shiatsu` |
| **Encuentra tu sesión** | cabecera | **`#orientador`** |
| Sesiones | cabecera | `#sesiones` |
| Eme | cabecera | `#eme` |
| **Encuentra tu sesión** (botón azul) | hero | **`#orientador`** |
| Qué es el Shiatsu | hero | `#shiatsu` |
| Pedir cita ×4 | las 4 tarjetas | `#cita` |
| Ver las sesiones ×4 | las 4 fichas del orientador | `#sesiones` |
| Pedir cita | cierre | `#cita` |
| **Ver orientador** | cierre | **`#orientador`** |
| Continuar en WhatsApp | cita | `#cita` ← ver abajo |
| EME PÉREZ | pie | `#inicio` |

---

# Los cinco problemas que salen del mapa

## 1 · El menú tiene dos entradas que suenan a lo mismo y no lo son

> **Encuentra tu sesión** → orientador · **Sesiones** → carrusel

La que suena más a «aquí eliges» es precisamente **la que ya no tiene ninguna
sesión**. Desde que el orientador dejó de recomendar, esa etiqueta promete algo
que está en la otra puerta.

Es el enredo de fondo, y arrastra también al botón azul del hero, que dice lo
mismo y va al mismo sitio.

## 2 · «Primera sesión» es huérfana

1.751 px de alto —**la sección más larga de la página**— y **cero enlaces**.
Tiene id, o sea que en algún momento alguien pensó enlazarla, y nunca se hizo.
Sólo se llega bajando y teniendo suerte.

Ahí viven «Vienes como estás», los tres pasos de la sesión y las cinco preguntas
prácticas, incluida la nueva de «¿Me van a mover?».

## 3 · El atlas no tiene puerta propia

Es la pieza que sostiene el proyecto entero —el cuerpo como mapa que se
recorre— y **no hay un solo enlace que lleve a ella**. Se llega sólo si entras
por «Shiatsu» y sigues bajando por el texto.

## 4 · El bucle del cierre

```
cierre  ──«Ver orientador»──▶  orientador
                                   │
                          «Ver las sesiones»
                                   ▼
                               sesiones ──«Pedir cita»──▶  cita
                                   ▲                        ▲
                                   └── el cierre está aquí ─┘
```

El cierre está **detrás** del carrusel y su segundo botón manda **hacia arriba**.
Y el orientador ahora manda hacia abajo. Circuito cerrado.

## 5 · No se puede llegar a «Cita» desde el menú

Cinco enlaces apuntan a `#cita`, y **ninguno está en el menú**. En una página de
doce pantallas, para reservar hay que bajar del todo o encontrar una tarjeta.

*(Aparte: «Continuar en WhatsApp» apunta a `#cita`, o sea a sí mismo. Eso **no
está roto**: `design.js` lo deja inerte a propósito mientras `data-whatsapp-number`
esté vacío. Es un hueco esperando un número real, no un fallo.)*

---

# Propuesta para decidir

## El menú definitivo

| Hoy | Propuesta | Va a |
|---|---|---|
| Shiatsu | **Shiatsu** | `#shiatsu` |
| Encuentra tu sesión | **Cómo se trabaja** | `#orientador` |
| Sesiones | **Sesiones** | `#sesiones` |
| — | **Primera vez** | `#primera-sesion` |
| Eme | **Eme** | `#eme` |
| — | **Pedir cita** *(destacado)* | `#cita` |

Dos cambios de fondo:

- **«Encuentra tu sesión» → «Cómo se trabaja».** Describe lo que hay dentro
  ahora, y deja de competir con «Sesiones». *(Alternativa: «El método».)*
- **Entra «Pedir cita»**, marcado distinto del resto, y entra «Primera vez»,
  que hoy no tiene puerta.

Seis entradas son muchas para un menú. Si hay que recortar, la primera que
sobra es «Eme»: se llega bien bajando y no es una decisión que nadie tome desde
el menú.

## El botón azul del hero

Hoy dice «Encuentra tu sesión» y va al orientador. Dos salidas coherentes:

**A · Se queda en el orientador y cambia de nombre.** Mantiene el recorrido —
técnica, cómo se trabaja, sesiones— y aprovecha que el orientador ya termina
mandando al carrusel. Quien quiera saltarse el relato tiene «Sesiones» en el menú.

**B · Pasa a apuntar a `#sesiones`.** Camino corto: la primera pregunta de quien
llega es «qué ofreces». Pero se salta el orientador, que es la pieza que acabamos
de escribir.

**Recomiendo A**, porque el puente orientador → sesiones ya está construido y
sería raro rodearlo justo ahora.

## El bucle del cierre

Tres salidas, de menos a más radical:

1. Dejarlo. Es suave y mucha gente no lo nota.
2. Cambiar «Ver orientador» por algo que no vaya hacia atrás.
3. **Quitar la sección de cierre entera** — es el hallazgo 3.2 de la auditoría:
   esta sección y `#cita` hacen lo mismo, y su botón principal te baja 702 px a
   la sección que ya venía justo después.

## Dos huecos que decidir aparte

- **El atlas**: ¿le damos puerta propia, o se queda como recompensa de quien baja
  por «Shiatsu»?
- **La pausa sensorial y el cierre no tienen id.** Mientras no lo tengan, no se
  pueden enlazar aunque queramos.
