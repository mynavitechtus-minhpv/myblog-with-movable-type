(function () {
  'use strict';

  var SCROLL_THRESHOLD_VH = 1;

  function init(el) {
    el.addEventListener('click', function (e) {
      var href = el.getAttribute('href');
      if (!href || href.charAt(0) !== '#') {
        return;
      }
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function updateVisibility(els, threshold) {
    var show = window.pageYOffset > threshold;
    els.forEach(function (el) {
      if (show) {
        el.classList.add('is-visible');
      } else {
        el.classList.remove('is-visible');
      }
    });
  }

  function run() {
    var els = Array.prototype.slice.call(
      document.querySelectorAll('.c-go-to-top[href^="#"]')
    );
    if (!els.length) {
      return;
    }

    els.forEach(init);

    var threshold = window.innerHeight * SCROLL_THRESHOLD_VH;

    function onScrollOrResize() {
      threshold = window.innerHeight * SCROLL_THRESHOLD_VH;
      updateVisibility(els, threshold);
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    updateVisibility(els, threshold);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
