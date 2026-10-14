const buttons = [...document.querySelectorAll('.ui-button')];

const formerMineral = [...document.querySelectorAll('.palette article')]
  .find(article => article.querySelector('h3')?.textContent.trim() === 'Mineral');
if (formerMineral) {
  formerMineral.style.setProperty('--c', '#465F73');
  formerMineral.querySelector('h3').textContent = 'Pizarra';
  formerMineral.querySelector('p').textContent = '#465F73';
  const paletteNote = formerMineral.closest('section')?.querySelector('aside p');
  if (paletteNote) paletteNote.textContent = 'La base combina cal, arenas, mortero y carbón. Pizarra deriva del azul grisáceo de las flores del torso y funciona como acento cromático del sistema.';
}

const paletteSection = [...document.querySelectorAll('section')]
  .find(section => section.querySelector('.label h2')?.textContent.trim() === 'Paleta');

if (paletteSection) {
  const handwritingStudy = document.createElement('section');
  handwritingStudy.className = 'handwriting-study';
  handwritingStudy.innerHTML = `
    <div class="label"><span>02—B</span><h2>Voz manuscrita</h2></div>
    <p class="status-note"><strong>Nueva prueba.</strong> Reenie Beanie aplicada a una anotación sensorial y a una frase breve. La tipografía todavía no está aprobada.</p>
    <div class="handwriting-grid">
      <article class="handwriting-card reenie"><span>04 / Reenie Beanie</span><p>ritmo suave<br>presión adaptada<br>rostro · cuello · hombros</p><small>Una pausa para escuchar el cuerpo.</small></article>
    </div>
    <aside><strong>Criterio de decisión</strong><p>La elegida debe aportar humanidad sin parecer infantil, cosmética o decorativa. Se limitará a notas breves, nunca a navegación, botones ni textos funcionales.</p></aside>`;
  paletteSection.before(handwritingStudy);
}

const materialNote = document.querySelector('.material .hand-note');
if (materialNote) {
  materialNote.classList.add('reenie-note');
  const noteLabel = materialNote.querySelector('small');
  if (noteLabel) noteLabel.textContent = 'Nota manual · Reenie Beanie';
}

const canAnimate = !matchMedia('(prefers-reduced-motion: reduce)').matches
  && matchMedia('(pointer: fine)').matches;

if (canAnimate) {
  const magnets = buttons.map(button => ({
    button, x: 0, y: 0, targetX: 0, targetY: 0, scale: 1, targetScale: 1
  }));
  const attractionRadius = 170;

  addEventListener('pointermove', event => {
    magnets.forEach(magnet => {
      const rect = magnet.button.getBoundingClientRect();
      const centreX = rect.left + rect.width / 2 - magnet.x;
      const centreY = rect.top + rect.height / 2 - magnet.y;
      const deltaX = event.clientX - centreX;
      const deltaY = event.clientY - centreY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < attractionRadius) {
        const proximity = 1 - distance / attractionRadius;
        const pull = proximity * proximity;
        magnet.targetX = deltaX * (0.16 + pull * 0.34);
        magnet.targetY = deltaY * (0.16 + pull * 0.34);
        magnet.targetScale = 1 + pull * 0.025;
        magnet.button.classList.add('is-attracted');
      } else {
        magnet.targetX = 0;
        magnet.targetY = 0;
        magnet.targetScale = 1;
        magnet.button.classList.remove('is-attracted');
      }
    });
  }, { passive: true });

  function animateMagnets() {
    magnets.forEach(magnet => {
      const returning = magnet.targetX === 0 && magnet.targetY === 0;
      const ease = returning ? 0.085 : 0.16;
      magnet.x += (magnet.targetX - magnet.x) * ease;
      magnet.y += (magnet.targetY - magnet.y) * ease;
      magnet.scale += (magnet.targetScale - magnet.scale) * 0.12;
      magnet.button.style.setProperty('--mag-x', `${magnet.x.toFixed(2)}px`);
      magnet.button.style.setProperty('--mag-y', `${magnet.y.toFixed(2)}px`);
      magnet.button.style.setProperty('--mag-scale', magnet.scale.toFixed(4));
    });
    requestAnimationFrame(animateMagnets);
  }

  addEventListener('mouseleave', () => magnets.forEach(magnet => {
    magnet.targetX = 0;
    magnet.targetY = 0;
    magnet.targetScale = 1;
    magnet.button.classList.remove('is-attracted');
  }));

  requestAnimationFrame(animateMagnets);
}
