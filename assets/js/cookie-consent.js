(function () {
  "use strict";
  var KEY = "delco_cookie_consent"; // "accepted" | "declined"

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode etc. */ }
  }

  function loadGatedEmbeds() {
    document.querySelectorAll("[data-cookie-src]").forEach(function (el) {
      var src = el.getAttribute("data-cookie-src");
      if (src && el.getAttribute("src") !== src) {
        el.setAttribute("src", src);
      }
    });
    document.querySelectorAll("[data-cookie-embed]").forEach(function (el) {
      el.hidden = true;
    });
  }

  function showBanner() {
    var b = document.getElementById("cookieBanner");
    if (b) b.hidden = false;
  }
  function hideBanner() {
    var b = document.getElementById("cookieBanner");
    if (b) b.hidden = true;
  }

  function accept() {
    setConsent("accepted");
    loadGatedEmbeds();
    hideBanner();
  }
  function decline() {
    setConsent("declined");
    hideBanner();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var consent = getConsent();
    if (consent === "accepted") {
      loadGatedEmbeds();
    } else if (consent !== "declined") {
      showBanner();
    }

    var acceptBtn = document.getElementById("cookieAccept");
    var declineBtn = document.getElementById("cookieDecline");
    if (acceptBtn) acceptBtn.addEventListener("click", accept);
    if (declineBtn) declineBtn.addEventListener("click", decline);

    document.querySelectorAll("[data-cookie-accept]").forEach(function (btn) {
      btn.addEventListener("click", accept);
    });

    var settingsLink = document.getElementById("cookieSettingsLink");
    if (settingsLink) {
      settingsLink.addEventListener("click", function (e) {
        e.preventDefault();
        showBanner();
      });
    }
  });
})();
