/* Medición de las páginas sueltas (GoatCounter: sin cookies, sin datos personales). Ver MEDICION.md.
   Se carga en /trabajemos-juntos/, /sobre-mi/, /automatizaciones/, /este-escritorio/, /respira/ y sus versiones /en/.
   Cuenta la visita y apunta dos sucesos: «correo/<página>» (clic en el enlace de correo) y «enlace/<página>/<destino>» (clic en un botón que sale a un proyecto o a Respira).
   No mide en local ni si el navegador manda «no rastrear». Para quitarlo: vaciar GC_CODIGO. */
(function () {
  var GC_CODIGO = "meryvillenaportfolio";
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!GC_CODIGO || local || navigator.doNotTrack === "1") return;
  var pagina = location.pathname.replace(/^\/|\/$/g, "") || "inicio";
  var listo = false, cola = [];
  function medir(n) {
    try {
      if (listo && window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "ev/" + n, title: n, event: true });
      else if (cola.length < 20) cola.push(n);
    } catch (e) {}
  }
  var sc = document.createElement("script");
  sc.async = true; sc.src = "//gc.zgo.at/count.js";
  sc.setAttribute("data-goatcounter", "https://" + GC_CODIGO + ".goatcounter.com/count");
  sc.onload = function () { listo = true; var c = cola; cola = []; c.forEach(medir); };
  document.head.appendChild(sc);
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var h = a.getAttribute("href") || "";
    if (/^mailto:/i.test(h)) return medir("correo/" + pagina);
    if (a.classList.contains("btn") && !/^\.\.\/$/.test(h)) {
      var destino = h.replace(/^https?:\/\//, "").replace(/^\.\.\//, "").replace(/[?#].*$/, "").replace(/^\/|\/$/g, "");
      medir("enlace/" + pagina + "/" + destino);
    }
  }, true);
})();
