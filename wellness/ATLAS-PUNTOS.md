# Atlas de puntos · Sección Shiatsu — PROPUESTA PARA CORREGIR

Sustituye el marcador de posición `.pressure-stage` (los tres círculos abstractos
con `Dedos · Palmas · Puntos de presión`) de la sección
`La lógica de la acupuntura. Sin agujas.`

**Estado: borrador. Nada de esto está en código todavía.**
Corrige encima de este archivo y me lo devuelves. Cuando esté aprobado, se maqueta.

---

## Criterio con el que están elegidos

Los puntos **bajan por el cuerpo de la cabeza al pie**: entrecejo → hombro →
pecho → espalda → mano → pierna → planta del pie. No es casualidad, es para que el diagrama se lea
de arriba abajo como se lee la página, y para que el visitante entienda de un
vistazo que el Shiatsu no es "masaje de espalda": toca todo el recorrido.

Son puntos **clásicos y reconocibles** (los que cualquier profesional espera ver),
no rarezas de manual. Y cubren las tres quejas con las que la gente llega:
cabeza/pantallas, hombros cargados, cansancio de fondo.

---

## Los 7 puntos

> Eran 5. El 19-08 Mery pidió dos más porque se le hacía corto: entraron
> **Danchū** (pecho) y **Meimon** (espalda). Con ellos, la figura de espalda
> deja de tener un solo punto y el torso deja de estar vacío.
> La numeración se rehízo entera para que siga yendo de la cabeza al pie.

| Nº | Punto | Dónde | Para qué |
|---|---|---|---|
| 01 | **Indō** 印堂 | Entre las cejas, línea media de la frente | Calmar la mente, dormir |
| 02 | **Kensei** 肩井 | Alto del hombro, sobre el trapecio | Hombros cargados, cuello |
| 03 | **Danchū** 膻中 | Centro del pecho, sobre el esternón | Pecho apretado, respiración corta |
| 04 | **Meimon** 命門 | Columna, a la altura de la cintura | Lumbares, frío, falta de fondo |
| 05 | **Gōkoku** 合谷 | Dorso de la mano, entre pulgar e índice | Dolor de cabeza, mandíbula |
| 06 | **Ashi Sanri** 足三里 | Cuatro dedos bajo la rodilla | Energía de fondo, digestión |
| 07 | **Yūsen** 湧泉 | Planta del pie, tercio delantero | Bajar revoluciones, dormir |
| 08 | **Kinshin · Gyokueki** 金津・玉液 | Bajo la lengua, a los lados del frenillo | Boca seca, llagas, voz tomada |
| 09 | **Ginkō** 齦交 | Dentro del labio superior, en el frenillo | Encías, muelas, nariz congestionada |

Los dos últimos van sobre los **dos diagramas de boca** de la lámina. Se ponen
porque son puntos de presión y están dibujados ahí, sin más.

La ficha 08 lleva además una **nota de técnica**, separada por un filete:

> En el facial japonés la boca se trabaja por dentro: se amasa la mejilla sobre
> el músculo de la masticación. Descarga la mandíbula y levanta el tercio
> inferior del rostro.

Va ahí porque explica algo que poca gente conoce del facial japonés y que puede
interesar a bastantes clientas. **Es la única ficha con nota de técnica.**
Pendiente de que Eme confirme que ella lo hace: si no lo hace, hay que quitarla.

### Los nombres, que es lo que da la textura

- **Kensei** — «el pozo del hombro». El punto que todo el mundo se aprieta solo
  sin saber cómo se llama.
- **Danchū** — el centro del pecho. Donde se nota el nudo.
- **Meimon** — «la puerta de la vida». En la columna, a la altura de la cintura.
- **Gōkoku** — «el valle que se une». Está lejos de la cabeza y aun así la
  afloja: ahí se entiende sin discurso qué es un meridiano.
- **Ashi Sanri** — «tres distancias más de pierna». Quien lo trabajaba aguantaba
  tres ri más de camino. Es el punto de la vitalidad en Japón.
- **Yūsen** — «el manantial que brota». Cierra el atlas por abajo y cierra la
  idea: la sesión termina devolviéndote al cuerpo.

⚠️ **Kensei y Gōkoku** se evitan clásicamente durante el embarazo. Sólo hay que
escribirlo en la web si el atlas es didáctico — ver la decisión más abajo.

Los avisos de ubicación exacta siguen pendientes de que **Eme los valide**:
están puestos a ojo sobre un escaneo blando.

---

## Suplentes, por si quieres cambiar alguno

| Punto | Dónde | Para qué | Por qué podría entrar |
|---|---|---|---|
| **Taiyō** 太陽 (sien) | En el hueco de la sien, un dedo por fuera del final de la ceja. | Vista cansada, cefalea de pantalla. | El más pertinente si quieres cargar la sección hacia el facial. |
| **Shinmon** 神門 (C7) | En el pliegue de la muñeca, del lado del meñique. | Ansiedad, insomnio, palpitaciones. | Si quieres que el atlas hable más de calma que de tensión física. |
| **Sanchiku** 攢竹 (V2) | En el nacimiento de la ceja, junto al lagrimal. | Ojos cansados, presión en la frente. | Muy visual en un diagrama de rostro. |

Mi recomendación: **dejar los siete como están**. Si acaso, cambiar el 01 (Indō)
por Taiyō sólo si decides que la sección tiene que mirar más al facial.

---

## Decidido: ILUSTRATIVO (19-08-2026)

El atlas cuenta **dónde está cada punto y para qué sirve**. Nada de cómo
presionarlo en casa.

Qué significa en la práctica:

- Las fichas describen el punto y lo que atiende la sesión. **Sin instrucciones**
  de presión (cuánta, cuánto tiempo, cuántas veces) y **sin segunda persona**
  que suene a invitación.
- **Los avisos de embarazo de Kensei y Gōkoku se quedan en este documento**, como
  nota interna. NO salen en la web. Sólo harían falta si algún día se invita a
  presionar.
- Tampoco hace falta la línea de «esto no sustituye una consulta médica».

Si alguna vez se cambia a didáctico, hay que meter las tres cosas de golpe:
instrucciones, contraindicación de embarazo y aviso médico. No vale a medias.

---

## Cómo encajaría en la sección (sin diseñar todavía)

- El `.pressure-stage` de ahora es una caja de `50vh` con rejilla de 3 columnas.
  Cinco puntos en recorrido vertical **no caben en esa estructura**: habrá que
  rehacerla, no reaprovecharla.
- La etiqueta `Diagrama 01 · Presión manual` pasaría a algo como
  `Diagrama 01 · Atlas de puntos`.
- El orden cabeza→pie es lo que hace que funcione. Si cambias un punto,
  cámbialo por otro de la misma altura del cuerpo si puede ser.

---

## Aparte: el enlace muerto de esta misma sección

`Cómo funciona el Shiatsu ↘` apunta a `href="#corporal"`, que está dentro del
bloque comentado. Cuando toquemos la sección para meter el atlas, lo redirijo a
`#sesiones` — a menos que prefieras quitarlo.
