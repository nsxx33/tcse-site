
(function () {
  var keys = ["gclid", "gbraid", "wbraid"];
  function stored(key) {
    try { return (window.localStorage.getItem("tcse_" + key) || "").trim(); }
    catch (e) { return ""; }
  }
  function save(key, value) {
    if (!value) return;
    try { window.localStorage.setItem("tcse_" + key, value); } catch (e) {}
  }
  function fill() {
    var params = new URLSearchParams(window.location.search);
    keys.forEach(function (key) {
      var fromUrl = (params.get(key) || "").trim();
      if (fromUrl) save(key, fromUrl);
      var value = fromUrl || stored(key);
      var el = document.getElementById(key);
      if (el) el.value = value;
    });
  }
  function setThanks() {
    var form = document.querySelector('form[name="tcse-lead"]');
    if (!form) return;
    form.action = window.innerWidth < 700 ? "thank-you-m.html" : "thank-you.html";
  }
  fill();
  setThanks();
  document.addEventListener("DOMContentLoaded", function () { fill(); setThanks(); });
})();
