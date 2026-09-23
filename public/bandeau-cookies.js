(function () {
  try {
    if (localStorage.getItem("tarineo-cookies-ok") === "1") {
      var stale = document.getElementById("tarineo-bandeau-cookies");
      if (stale) stale.remove();
      return;
    }
  } catch (e) {
    /* private mode → afficher */
  }

  function dismiss() {
    try {
      localStorage.setItem("tarineo-cookies-ok", "1");
    } catch (e) {
      /* ignore */
    }
    var el = document.getElementById("tarineo-bandeau-cookies");
    if (el) el.remove();
  }

  function wire(btn) {
    if (!btn) return;
    btn.onclick = function (ev) {
      if (ev) ev.preventDefault();
      dismiss();
    };
  }

  var existing = document.getElementById("tarineo-bandeau-cookies");
  if (existing) {
    wire(document.getElementById("tarineo-cookies-ok"));
    return;
  }

  var wrap = document.createElement("div");
  wrap.id = "tarineo-bandeau-cookies";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-label", "Information cookies");
  wrap.className = "tarineo-bandeau-cookies";
  wrap.innerHTML =
    '<div class="tarineo-bandeau-cookies__card">' +
    '<p class="tarineo-bandeau-cookies__text">Tarineo utilise uniquement des cookies strictement nécessaires à la connexion, et une mesure d\u2019audience anonymisée (sans publicité). ' +
    '<a class="tarineo-bandeau-cookies__link" href="/legal/cookies">En savoir plus</a></p>' +
    '<button type="button" id="tarineo-cookies-ok" class="tarineo-bandeau-cookies__btn">Compris</button>' +
    "</div>";

  function mount() {
    document.body.appendChild(wrap);
    wire(document.getElementById("tarineo-cookies-ok"));
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
