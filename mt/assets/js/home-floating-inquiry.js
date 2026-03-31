(function () {
  'use strict';

  const DEFAULT_HOME_FLOATING_INQUIRY_DELAY_MS = 15000;
  const SP_FV_REVEAL_RATIO_DEFAULT = 0.7;

  var floatingInquiry = document.querySelector('.c-home-floating-inquiry');
  if (!floatingInquiry) {
    return;
  }

  var clusterEl = floatingInquiry.querySelector('.c-home-floating-inquiry__cluster');

  var fvSelector =
    floatingInquiry.getAttribute('data-home-floating-inquiry-fv') ||
    floatingInquiry.getAttribute('data-home-float-fv') ||
    floatingInquiry.getAttribute('data-floating-nav-fv') ||
    floatingInquiry.getAttribute('data-float-nav-fv') ||
    '#js-home-floating-inquiry-fv';
  var delayRaw =
    floatingInquiry.getAttribute('data-home-floating-inquiry-delay') ||
    floatingInquiry.getAttribute('data-home-float-delay') ||
    floatingInquiry.getAttribute('data-floating-nav-delay') ||
    floatingInquiry.getAttribute('data-float-nav-delay');
  var delayMs = parseInt(delayRaw || String(DEFAULT_HOME_FLOATING_INQUIRY_DELAY_MS), 10);
  if (isNaN(delayMs) || delayMs < 0) {
    delayMs = DEFAULT_HOME_FLOATING_INQUIRY_DELAY_MS;
  }
  var desktopQuery = window.matchMedia('(min-width: 1024px)');

  var startTime = null;
  var pollTimer = null;
  var rafScheduled = false;

  function queryFv() {
    try {
      return document.querySelector(fvSelector);
    } catch (e) {
      return null;
    }
  }

  function getSpFvRevealRatio() {
    var raw =
      floatingInquiry.getAttribute('data-home-floating-inquiry-sp-fv-reveal') ||
      floatingInquiry.getAttribute('data-home-float-sp-fv-reveal') ||
      floatingInquiry.getAttribute('data-floating-nav-sp-fv-reveal') ||
      floatingInquiry.getAttribute('data-float-nav-sp-fv-reveal');
    var r = parseFloat(raw);
    if (isNaN(r) || r < 0 || r > 1) {
      return SP_FV_REVEAL_RATIO_DEFAULT;
    }
    return r;
  }

  function isSpPastFvReveal() {
    var fv = queryFv();
    if (!fv) {
      return false;
    }
    var ratio = getSpFvRevealRatio();
    var rect = fv.getBoundingClientRect();
    var topDoc = rect.top + window.pageYOffset;
    var h = fv.offsetHeight || rect.height;
    if (h <= 0) {
      return false;
    }
    return window.pageYOffset >= topDoc + h * ratio;
  }

  function isFvScrolledOut() {
    var fv = queryFv();
    if (!fv) {
      return false;
    }
    return fv.getBoundingClientRect().bottom <= 0;
  }

  function isDelayElapsed() {
    if (startTime === null) {
      return false;
    }
    return Date.now() - startTime >= delayMs;
  }

  function shouldShow() {
    if (desktopQuery.matches) {
      return isDelayElapsed() && isFvScrolledOut();
    }
    return isSpPastFvReveal();
  }

  function clearPositionStyles() {
    floatingInquiry.style.bottom = '';
    floatingInquiry.style.position = '';
    floatingInquiry.style.top = '';
    floatingInquiry.style.left = '';
    floatingInquiry.style.right = '';
    floatingInquiry.style.width = '';
    if (clusterEl) {
      clusterEl.style.top = '';
      clusterEl.style.transform = '';
    }
  }

  function clearSpScrollPad() {
    document.documentElement.classList.remove('is-home-floating-inquiry-sp-active');
    document.documentElement.style.removeProperty('--home-floating-inquiry-sp-pad');
  }

  function updateSpScrollPad() {
    var bottomPad = 20;
    var gap = 16;
    var barH = floatingInquiry.offsetHeight || 0;
    document.documentElement.classList.add('is-home-floating-inquiry-sp-active');
    document.documentElement.style.setProperty(
      '--home-floating-inquiry-sp-pad',
      barH + bottomPad + gap + 'px'
    );
  }

  function updateVisibility() {
    var show = shouldShow();
    if (show) {
      floatingInquiry.classList.add('is-visible');
    } else {
      floatingInquiry.classList.remove('is-visible');
    }
  }

  function updateDesktopPosition() {
    if (!clusterEl) {
      return;
    }

    clusterEl.style.top = '50%';
    clusterEl.style.transform = 'translateY(-50%)';
  }

  function updatePosition() {
    if (!floatingInquiry.classList.contains('is-visible')) {
      clearPositionStyles();
      clearSpScrollPad();
      return;
    }

    clearPositionStyles();

    if (desktopQuery.matches) {
      clearSpScrollPad();
      updateDesktopPosition();
    } else {
      updateSpScrollPad();
    }
  }

  function onScrollOrResize() {
    updateVisibility();
    if (!rafScheduled) {
      rafScheduled = true;
      window.requestAnimationFrame(function () {
        rafScheduled = false;
        updatePosition();
      });
    }
  }

  function startDelayPolling() {
    if (pollTimer !== null) {
      return;
    }
    pollTimer = window.setInterval(function () {
      if (!desktopQuery.matches) {
        return;
      }
      updateVisibility();
      updatePosition();
      if (isDelayElapsed() && isFvScrolledOut()) {
        window.clearInterval(pollTimer);
        pollTimer = null;
      }
    }, 250);
  }

  function init() {
    startTime = Date.now();
    updateVisibility();
    updatePosition();
    startDelayPolling();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', onScrollOrResize);
  } else {
    desktopQuery.addListener(onScrollOrResize);
  }
})();
