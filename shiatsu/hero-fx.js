/* Shiatsu · portada viva (PROTOTIPO, 25-oct-2026).
   Sustituye la imagen del torso por un lienzo WebGL con tu mismo collage y dos efectos:
   · brisa: las flores y hojas se mecen muy poco (máscara en assets/hero-mapas.png, canal rojo)
   · profundidad: al mover el ratón o inclinar el móvil, flores, esqueleto y fondo se desplazan
     a distinta velocidad (canal verde de la misma imagen).
   Si algo falla (sin WebGL, sin «reducir movimiento»…), se queda la imagen de siempre.
   Para quitarlo: borrar la línea de hero-fx.js en index.html. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const img = document.querySelector('.hero-art .specimen-window img');
  if (!img) return;
  const frame = img.parentElement;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-fx';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = 1600; canvas.height = 1131;
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) return;

  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const FS = `precision mediump float;varying vec2 v;uniform sampler2D uImg,uMap;uniform float uT;uniform vec2 uTilt;
void main(){
  vec4 m=texture2D(uMap,v);
  float yy=1.-v.y;
  float f=smoothstep(.84,.20,yy);              /* más arriba, más se mece */
  float w=m.r*f;
  vec2 sway=vec2(sin(uT*.85+yy*8.+v.x*5.)+.55*sin(uT*1.9+v.x*17.+yy*3.),.45*cos(uT*.7+v.x*9.))*.0032*w;
  vec2 par=vec2(uTilt.x,-uTilt.y)*(m.g-.30)*.026;   /* profundidad */
  vec2 uv=clamp(v+sway+par,.001,.999);
  gl_FragColor=vec4(texture2D(uImg,uv).rgb,1.);
}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uT = gl.getUniformLocation(prog, 'uT'), uTilt = gl.getUniformLocation(prog, 'uTilt');

  const tex = (unit, source) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };

  /* ---- entrada: ratón, inclinación del móvil o, si no hay nada, un balanceo lento ---- */
  let target = [0, 0], cur = [0, 0], lastInput = -1e9, running = false, visible = true, t0 = performance.now();
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  addEventListener('pointermove', e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    target = [clamp((e.clientX / innerWidth - .5) * 2, -1, 1), clamp((e.clientY / innerHeight - .5) * 2, -1, 1)];
    lastInput = performance.now();
  }, { passive: true });
  const onTilt = e => {
    if (e.gamma == null) return;
    target = [clamp(e.gamma / 22, -1, 1), clamp(((e.beta || 0) - 55) / 22, -1, 1)];
    lastInput = performance.now();
  };
  if (typeof DeviceOrientationEvent !== 'undefined') {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      /* iPhone: pide permiso la primera vez que se toca la imagen */
      frame.addEventListener('pointerup', () => {
        DeviceOrientationEvent.requestPermission().then(s => { if (s === 'granted') addEventListener('deviceorientation', onTilt); }).catch(() => {});
      }, { once: true });
    } else addEventListener('deviceorientation', onTilt);
  }

  const draw = now => {
    running = false;
    if (!visible || document.hidden) return;
    const t = (now - t0) / 1000;
    const idle = (now - lastInput) > 3500;
    const goal = idle ? [Math.sin(t * .35) * .45, Math.cos(t * .27) * .3] : target;
    cur[0] += (goal[0] - cur[0]) * .06; cur[1] += (goal[1] - cur[1]) * .06;
    gl.uniform1f(uT, t);
    gl.uniform2f(uTilt, cur[0], cur[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    running = true; requestAnimationFrame(draw);
  };
  const start = () => { if (!running) { running = true; requestAnimationFrame(draw); } };

  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: .01 }).observe(frame);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });

  const go = () => {
    const map = new Image();
    map.onload = () => {
      try {
        tex(0, img); tex(1, map);
        gl.uniform1i(gl.getUniformLocation(prog, 'uImg'), 0);
        gl.uniform1i(gl.getUniformLocation(prog, 'uMap'), 1);
        gl.viewport(0, 0, canvas.width, canvas.height);
        canvas.style.objectPosition = getComputedStyle(img).objectPosition;
        frame.append(canvas);
        gl.uniform1f(uT, 0); gl.uniform2f(uTilt, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        frame.classList.add('fx-on');                   /* la imagen se esconde, el lienzo ya la sustituye */
        window.heroFx = { canvas, gl };
        start();
      } catch (err) { canvas.remove(); frame.classList.remove('fx-on'); }
    };
    map.onerror = () => {};
    map.src = 'assets/hero-mapas.png?v=1';
  };
  if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
})();
