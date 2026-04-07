/* ==========================================================================
   TOP page — home.js
   Hero FV slider (was hero-fv.js). Loaded only on index.
   ========================================================================== */

(function () {
  'use strict';

  const SLIDE_DURATION = 5000;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroFV);
  } else {
    initHeroFV();
  }

  function initHeroFV() {
    const hero = document.getElementById('js-hero-fv');
    if (!hero) return;

    const slides = hero.querySelectorAll('.c-hero-fv__slide');
    const controls = hero.querySelector('.c-hero-fv__controls');
    const nextBtn = hero.querySelector('.c-hero-fv__next');

    if (!slides.length || !controls) return;

    const dotsFragment = document.createDocumentFragment();
    slides.forEach(function (_, index) {
      const dot = document.createElement('button');
      dot.className = 'c-hero-fv__dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', 'スライド' + (index + 1));
      dotsFragment.appendChild(dot);
    });
    controls.insertBefore(dotsFragment, nextBtn);

    const dots = controls.querySelectorAll('.c-hero-fv__dot');
    if (!dots.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentSlideIndex = 0;
    let intervalId = 0;

    function setActiveSlide(index) {
      currentSlideIndex = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function clearAutoplay() {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = 0;
      }
    }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      clearAutoplay();
      intervalId = window.setInterval(function () {
        const next = (currentSlideIndex + 1) % slides.length;
        setActiveSlide(next);
      }, SLIDE_DURATION);
    }

    function goToSlide(index) {
      setActiveSlide(index);
      startAutoplay();
    }

    setActiveSlide(0);
    startAutoplay();

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        goToSlide(index);
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        const next = (currentSlideIndex + 1) % slides.length;
        goToSlide(next);
      });
    }

    let touchStartX = 0;
    let touchEndX = 0;

    hero.addEventListener(
      'touchstart',
      function (e) {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    hero.addEventListener(
      'touchend',
      function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true }
    );

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        const targetIndex =
          diff > 0
            ? (currentSlideIndex + 1) % slides.length
            : (currentSlideIndex - 1 + slides.length) % slides.length;
        goToSlide(targetIndex);
      }
    }

    window.addEventListener('beforeunload', clearAutoplay);
  }
})();
