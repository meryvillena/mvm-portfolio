# Wellness · Eme Pérez — empieza aquí

**Si abres un solo archivo del proyecto, que sea este.** Los demás son consulta.

---

## Qué es

Caso de portfolio. Web de **Eme Pérez**, profesional de Shiatsu y facial japonés
en Madrid. Eme **es un personaje**: inspirado en una profesional real, pero los
datos son inventados. Ver `REFERENCIA-INSPIRACION.md` antes de escribir textos.

Lo que se defiende: que una técnica manual se puede explicar **sin misticismo y
sin jerga**, y que el cuerpo se puede mostrar como un mapa que se recorre.

## Dónde está, una línea por pieza

| | |
|---|---|
| Estructura y secciones | **Terminada.** 9 secciones |
| Sistema de diseño y tokens | **Cerrado** |
| Sección Shiatsu + atlas de puntos | **Terminada.** 9 puntos sobre lámina |
| Carrusel de sesiones | **Terminado.** 4 tarjetas con foto |
| Sección de Eme | **Textos definitivos metidos** el 21-08-2026 |
| Movimiento de scroll (`scroll-motion.js`) | **Parado a propósito.** No reactivar sin leer abajo |
| Auditoría de UI | **Hecha.** Ver `AUDITORIA-UI.md` ← pendiente decidir qué se arregla |
| Auditoría de diseño | **Hecha** el 21-08-2026. Ver `AUDITORIA-DISENO.md` |
| Auditoría de contenido | **Orientador reescrito y metido.** Quedan 6 textos fijos que aún nombran sesiones. Ver `TEXTOS-ORIENTADOR-Y-SESIONES.md` |

## Cómo levantarlo

```bash
python3 -m http.server 8780 --directory "/Users/meryvillena/Documents/Claude/Projects/portfolio-web/wellness"
```

Recargar siempre con **Ctrl+Shift+R**. Al tocar CSS o JS **hay que subir el
número de versión** en `index.html`, si no el navegador sirve el archivo viejo.

| Archivo | Versión | Línea |
|---|---|---|
| `tokens.css` | v=10 | 14 |
| `design.css` | v=105 | 15 |
| `design.js` | v=60 | ~525 |
| `atlas.js` | v=3 | ~582 |

---

# LA AUDITORÍA DE UI

## Antes de empezar: trampas de verificación

Costaron horas de descubrir. **Leerlas o repetirás los mismos tropiezos.**

1. **El navegador integrado congela `requestAnimationFrame`** cuando el panel
   queda oculto. Cualquier bucle de animación deja de correr y parece roto.
2. **No ejecuta el desplazamiento suave.** `behavior:'smooth'` no hace nada;
   `'auto'` sí. Un carrusel que no se mueve puede no estar roto.
3. **Renderiza a 289 px de ancho** aunque `innerWidth` diga 1440. Se cuela por
   la rama de móvil sin avisar.
4. **`loading="lazy"` no dispara.** Las imágenes no cargan y `naturalWidth` es 0.
   Para comprobarlas: `img.loading='eager'; img.src=img.src;`
5. **Las transiciones CSS se congelan al leerlas.** `getComputedStyle` devuelve
   el valor de arranque. Para medir de verdad: `elemento.style.transition='none'`
   antes de leer.

**Conclusión práctica:** medir propiedades y geometría sí funciona. Todo lo que
dependa de animación o de gesto real, **lo tiene que probar Mery en su Chrome**.
Decirlo claro en vez de dar por bueno lo que no se ha visto.

## Qué auditar, en este orden

**1 · Accesibilidad y contraste.** Es lo más barato de arreglar y lo que más
gente afecta. Contraste real de textos sobre sus fondos, no sobre el que se
supone. Recorrido de teclado por toda la página. Textos alternativos de las
imágenes. Que los objetivos táctiles lleguen a 44 px.

**2 · Móvil, de verdad.** Sólo se ha revisado el atlas y por encima. Sin ver:
la sección de Eme en banda azul con el retrato, el carrusel, el formulario de
reserva, y el menú. Probar a 390 px y a 320 px.

**3 · Ritmo de la página entera.** Nunca se ha mirado de arriba abajo del tirón.
El atlas y la sección de Eme entraron los últimos y son piezas pesadas: puede
que desequilibren. ¿Hay dos secciones seguidas que hagan lo mismo? ¿Se entiende
el recorrido: técnica → sesiones → quién → primera vez → reservar?

**4 · Consistencia del sistema.** Botones, enlaces, fichas y etiquetas: ¿siguen
todos las mismas reglas? Hoy apareció un botón cuyo hover era negro y su reposo
azul. Puede haber más.

**5 · Peso y rendimiento.** Qué pesa la página entera. Hay imágenes en `assets/`
que ya no usa nadie (las láminas que sustituyeron las fotos de las tarjetas).

## Lo que está decidido. No rediscutir sin hablarlo

- **El atlas se recorre por posición del ratón**, no arrastrando. Mery probó las
  alternativas en `prueba-movimiento.html` y eligió esta. Las constantes de
  `atlas.js` (`MARGEN`, `SUAVIDAD`, `FRENO`, `PEGUE`, `TOQUE`) son las que probó.
- **Los puntos son azul pizarra**, no carmín. Se probó el carmín y se descartó:
  era cálido como la lámina y se fundía con ella.
- **El disco de papel bajo cada punto no se quita.** Es lo único que hace visible
  el punto del hombro sobre la figura oscura (contraste 1,9 sobre un mínimo de 3).
- **Las fichas dicen dónde está el punto y para qué sirve. Y ya.** Nada de cómo
  presionarlo en casa, ni de explicar por qué la lámina dibuja tal cosa.
- **La sección de Eme va en banda azul a sangre.** No devolverla a fondo claro.
- **`scroll-motion.js` está parado a propósito.** Hay dos motores de movimiento
  mutuamente excluyentes; corre el de repuesto de `design.js`. Además, ese
  archivo anima `.pressure-a/b/c`, que ya no existen. Ver `SIGUIENTE-PASO.md`.

## Lo que está bloqueado

- **El texto de la sección de Eme.** Falta que Mery pase los datos reales:
  formación, escuela, años de práctica, por qué el Shiatsu, si hace trabajo
  intraoral. Sin eso el texto es genérico y no se puede auditar.
- **Que Eme valide** la colocación de los 9 puntos del atlas.
- **`--plate-w`** (el zoom de la lámina, en `.atlas-viewport`): 1600 o 2600.
  Decisión de Mery mirándolo.

---

## Los otros documentos, qué es cada uno

Limpieza del 21-08-2026: se borraron 7 papeles de trabajo ya cumplidos (los
textos del orientador y de Eme, los briefings y las fichas de tarjetas, que ya
no coincidían con la web, y la prueba de tipografía). Están en git.

| | |
|---|---|
| **`SISTEMA-DE-DISENO.html`** | **El documento de entrega.** Lee `tokens.css` y se pinta solo: no puede desincronizarse. Ábrelo con el servidor, no con doble clic |
| `REFERENCIA-INSPIRACION.md` | La profesional real en la que se inspira, y **qué no se puede tomar de ella**. Esto no caduca |
| `ATLAS-PUNTOS.md` | El contenido de los 9 puntos. Sigue vivo mientras Eme no valide su colocación |
| `AUDITORIA-UI.md` | **Papel de trabajo.** Materia prima del informe. Ojo: sus cifras ya están caducadas |
| `AUDITORIA-DISENO.md` | **Papel de trabajo.** Igual |
| `MAPA-ENLACES.md` | **Papel de trabajo.** Igual |
| `SIGUIENTE-PASO.md` | **Caducado.** Cita v=72 cuando vamos por v=104. Se borra con el informe |
| `prueba-escala.html` | **Temporal.** Antes/después de los 5 tamaños. Se borra cuando lo valides |

**Los cuatro se borran cuando el informe de auditoría los haya absorbido.** No
antes: son la materia prima de la historia que va al portfolio.

*(Quedan además cuatro HTML de fases anteriores —`fase-2-movimiento`,
`plan-trabajo`, `prueba-movimiento`, `sistema-visual`— sin revisar. `prueba-movimiento`
es donde se probaron las alternativas del atlas, así que ése no se toca sin mirar.)*
