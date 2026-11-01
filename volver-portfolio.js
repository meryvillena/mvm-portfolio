/* Botón «Volver al portfolio» para las demos y casos que viven fuera del escritorio.
   Mismo estilo que .btn del portfolio (Platinum: borde negro, gris, sombra dura).
   Se carga con <script src="…/volver-portfolio.js" defer></script>. Si la página va dentro de un iframe, no se muestra. */
(function () {
  try { if (window.top !== window.self) return; } catch (e) { return; }
  if (document.getElementById("volver-portfolio")) return;
  var ref = ""; try { ref = document.referrer || ""; } catch (e) {}
  var en = /\/en(\/|$)/.test(ref.replace(/^https?:\/\/[^/]+/, "")) || document.documentElement.lang === "en" || /-en\.html$/.test(location.pathname);
  var home = en ? "/en/" : "/";
  var mismoSitio = false; try { mismoSitio = !!ref && new URL(ref).origin === location.origin; } catch (e) {}
  var a = document.createElement("a");
  a.id = "volver-portfolio";
  a.href = home;
  a.textContent = en ? "← Back to portfolio" : "← Volver al portfolio";
  a.setAttribute("data-volver", "");
  a.addEventListener("click", function (e) {
    if (mismoSitio && history.length > 1) { e.preventDefault(); history.back(); }
  });
  var s = document.createElement("style");
  s.textContent =
    "#volver-portfolio{position:fixed;left:12px;bottom:12px;z-index:2147483000;box-sizing:border-box;" +
    "font:bold 12px/1.2 Geneva,'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0;text-transform:none;" +
    "padding:6px 12px;border:1px solid #000;background:#ddd;color:#111;text-decoration:none;cursor:pointer;" +
    "box-shadow:2px 2px 0 rgba(0,0,0,.3)}" +
    "#volver-portfolio:hover{background:#cfcfcf}#volver-portfolio:active{background:#bbb;box-shadow:none;transform:translate(2px,2px)}" +
    "#volver-portfolio:focus-visible{outline:2px solid #2b5fd6;outline-offset:2px}" +
    "@media print{#volver-portfolio{display:none}}";
  var poner = function () { document.head.appendChild(s); document.body.appendChild(a); };
  if (document.body) poner(); else document.addEventListener("DOMContentLoaded", poner);
})();
