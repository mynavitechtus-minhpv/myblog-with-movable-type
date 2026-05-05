(function () {
  const toggles = document.querySelectorAll("[data-member-feedback-toggle]");
  if (!toggles.length) {
    return;
  }

  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const card = btn.closest("[data-member-feedback-card]");
      if (!card) {
        return;
      }
      const expanded = card.classList.toggle("c-member-feedback__card--expanded");
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  });
})();
