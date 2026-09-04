(function () {
  var KEYS = ["gclid", "gbraid", "wbraid"];
  var TTL_MS = 90 * 24 * 60 * 60 * 1000;
  var PREFIX = "tcse_";
  var INTAKE_URL = "https://shop-command-phi.vercel.app/api/leads/intake";
  var THANKS_URL = "thank-you.html";

  function writeStore(key, value) {
    if (!value) return;
    try {
      window.localStorage.setItem(
        PREFIX + key,
        JSON.stringify({ v: String(value).trim(), t: Date.now() })
      );
    } catch (e) {}
  }

  function readStore(key) {
    try {
      var raw = window.localStorage.getItem(PREFIX + key);
      if (!raw) return "";
      try {
        var obj = JSON.parse(raw);
        if (obj && typeof obj === "object" && obj.v != null && obj.t != null) {
          if (Date.now() - Number(obj.t) > TTL_MS) {
            window.localStorage.removeItem(PREFIX + key);
            return "";
          }
          return String(obj.v).trim();
        }
      } catch (ignore) {}
      // Legacy plain string from older site.js — keep and refresh TTL.
      var legacy = String(raw).trim();
      if (legacy) writeStore(key, legacy);
      return legacy;
    } catch (e) {
      return "";
    }
  }

  function fill(form) {
    if (!form) return;
    var params = new URLSearchParams(window.location.search);
    KEYS.forEach(function (key) {
      var fromUrl = (params.get(key) || "").trim();
      if (fromUrl) writeStore(key, fromUrl);
      var value = fromUrl || readStore(key);
      var el = form.querySelector("#" + key) || form.querySelector('[name="' + key + '"]');
      if (el) el.value = value;
    });
  }

  function submitButton(form) {
    return form.querySelector('button[type="submit"], input[type="submit"]');
  }

  function bind(form) {
    form.setAttribute("method", "POST");
    form.setAttribute("action", INTAKE_URL);
    fill(form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      fill(form);
      var button = submitButton(form);
      if (button) button.disabled = true;
      fetch(INTAKE_URL, {
        method: "POST",
        body: new FormData(form),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("intake failed");
          window.location.assign(THANKS_URL);
        })
        .catch(function () {
          if (button) button.disabled = false;
          alert("Sorry — we could not send your request. Please try again.");
        });
    });
  }

  function boot() {
    var form = document.querySelector('form[name="tcse-lead"]');
    if (!form) return;
    bind(form);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
