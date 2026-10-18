/* Fotografía un bloque de la web para revisarlo.
   No forma parte del entregable: es la herramienta de la fase 2.

   node ver.js                    → el hero
   node ver.js carta              → la sección #carta
   node ver.js hero finde 21      → un día y una semilla concretos
   node ver.js hero finde 7 480   → y un ancho de pantalla (móvil)

   Deja la imagen en ../capturas/<bloque>.png
*/
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const [bloque = 'hero', dia = 'finde', semilla = '7', ancho = '1200'] = process.argv.slice(2);
const URL = 'file://' + path.join(__dirname, 'index.html');
const SALIDA = path.join(__dirname, '..', 'capturas');

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +ancho, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

  await p.goto(URL);
  await p.evaluate(() => { document.querySelector('.demo').open = true; });
  await p.selectOption('#d-dia', dia);
  await p.fill('#d-semilla', semilla);
  await p.dispatchEvent('#d-semilla', 'input');
  await p.waitForTimeout(250);
  await p.evaluate(() => { document.querySelector('.demo').open = false; });

  const destino = path.join(SALIDA, bloque + '.png');
  const el = p.locator('#' + bloque);
  if (!(await el.count())) { console.log('No existe #' + bloque); await b.close(); return; }

  // Se recorta a lo ANCHO DE LA PÁGINA, no a la caja del bloque: recortando
  // al elemento desaparecían los márgenes laterales y parecía que el diseño
  // iba a sangre cuando no era verdad.
  const caja = await el.boundingBox();
  await p.screenshot({
    path: destino,
    fullPage: true,
    clip: { x: 0, y: Math.max(0, caja.y - 24), width: +ancho, height: caja.height + 48 },
  });

  console.log('captura -> ' + destino);
  console.log('escenario: ' + dia + ' · semilla ' + semilla + ' · ' + ancho + 'px');
  console.log('errores de consola: ' + (errs.length ? errs.join(' | ') : 'ninguno'));
  await b.close();
})();
