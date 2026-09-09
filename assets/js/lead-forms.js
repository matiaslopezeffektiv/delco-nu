(function () {
  "use strict";

  function serialize(form) {
    var data = new FormData(form);
    var params = new URLSearchParams();
    data.forEach(function (value, key) {
      params.append(key, value);
    });
    return params;
  }

  function showMessage(form, html) {
    var result = form.querySelector(".contact-result");
    if (result) result.innerHTML = html;
  }

  function handleSubmit(e) {
    e.preventDefault();
    var form = e.target;

    var requiredOk = true;
    form.querySelectorAll("[required]").forEach(function (field) {
      if (!field.value || !field.value.trim()) requiredOk = false;
    });
    if (!requiredOk) {
      showMessage(form, '<div class="alert alert-danger" role="alert">Fyll i namn och telefon.</div>');
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    showMessage(form, "Skickar...");

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: serialize(form),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data.ok) {
          showMessage(
            form,
            '<div class="alert alert-success" role="alert"><strong>Tack!</strong> Vi återkommer så snart vi kan.</div>'
          );
          form.reset();
        } else {
          showMessage(
            form,
            '<div class="alert alert-danger" role="alert">' +
              (result.data && result.data.error ? result.data.error : "Något gick fel. Försök igen.") +
              "</div>"
          );
        }
      })
      .catch(function () {
        showMessage(
          form,
          '<div class="alert alert-danger" role="alert">Något gick fel. Försök igen, eller ring oss på 040-814 88.</div>'
        );
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".delco-lead-form").forEach(function (form) {
      form.addEventListener("submit", handleSubmit);
    });
  });
})();
