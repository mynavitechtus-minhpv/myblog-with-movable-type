/* ==========================================================================
   Hero First View Slider - Controller
   Dot / Next は CSS アニメーションの実表示（opacity）に同期
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
    const dots = hero.querySelectorAll('.c-hero-fv__dot');
    const nextBtn = hero.querySelector('.c-hero-fv__next');

    if (!slides.length || !dots.length) return;

    let currentSlideIndex = 0;
    let rafId = 0;

    /**
     * Initialize animation delays for all slides, text lines, and images
     * based on slide count (dynamic: works with any number of slides)
     */
    function initSlideDelays() {
      const totalSlides = slides.length;
      // Set --total-slides CSS variable for animation duration calculation
      hero.style.setProperty('--total-slides', totalSlides);

      slides.forEach((slide, slideIndex) => {
        const slideDelay = slideIndex * SLIDE_DURATION;
        slide.style.animationDelay = `${slideDelay / 1000}s`;

        // Text lines: base delay = slide start + 800ms, then +500ms per line
        const lines = slide.querySelectorAll('.c-hero-fv__line');
        lines.forEach((line, lineIndex) => {
          const lineDelay = slideDelay + 800 + (lineIndex * 500);
          line.style.animationDelay = `${lineDelay / 1000}s`;
        });

        // Image zoom: same delay as slide
        const img = slide.querySelector('.c-hero-fv__slide-img');
        if (img) {
          img.style.animationDelay = `${slideDelay / 1000}s`;
        }
      });
    }

    // Initialize delays on load
    initSlideDelays();

    /**
     * slideMaster のフェードと一致させるため、表示中スライドは opacity 最大の要素とする。
     * Date.now() % 15s は animation-delay 変更後に無効になるため使わない。
     */
    function getActiveSlideIndexFromDom() {
      const ops = Array.from(slides).map(function (slide) {
        return parseFloat(window.getComputedStyle(slide).opacity) || 0;
      });
      const maxOp = Math.max.apply(null, ops);
      /* フェードの谷で全枚低 opacity の瞬間は前のインデックスを維持 */
      if (maxOp < 0.08) {
        return null;
      }
      let best = 0;
      let bestOp = -1;
      ops.forEach(function (op, i) {
        if (op > bestOp) {
          bestOp = op;
          best = i;
        }
      });
      return best;
    }

    function syncDotsFromDom() {
      const newIndex = getActiveSlideIndexFromDom();
      if (newIndex === null) return;
      if (newIndex !== currentSlideIndex) {
        currentSlideIndex = newIndex;
        dots.forEach((dot, index) => {
          dot.classList.toggle('is-active', index === currentSlideIndex);
        });
      }
    }

    function tick() {
      syncDotsFromDom();
      rafId = window.requestAnimationFrame(tick);
    }

    rafId = window.requestAnimationFrame(tick);

    function goToSlide(index) {
      const targetDelay = index * SLIDE_DURATION;

      slides.forEach((slide, slideIndex) => {
        const animationDelay = (slideIndex * SLIDE_DURATION - targetDelay) / 1000;
        
        // Force animation restart: remove animation-name → reflow → restore
        slide.style.animationName = 'none';
        void slide.offsetHeight; // trigger reflow
        slide.style.animationName = '';
        slide.style.animationDelay = `${animationDelay}s`;

        const lines = slide.querySelectorAll('.c-hero-fv__line');
        lines.forEach((line, lineIndex) => {
          const baseDelay = slideIndex * SLIDE_DURATION + 800 + lineIndex * 500;
          const newDelay = (baseDelay - targetDelay) / 1000;
          
          line.style.animationName = 'none';
          void line.offsetHeight;
          line.style.animationName = '';
          line.style.animationDelay = `${newDelay}s`;
        });

        const img = slide.querySelector('.c-hero-fv__slide-img');
        if (img) {
          const imgDelay = (slideIndex * SLIDE_DURATION - targetDelay) / 1000;
          
          img.style.animationName = 'none';
          void img.offsetHeight;
          img.style.animationName = '';
          img.style.animationDelay = `${imgDelay}s`;
        }
      });

      currentSlideIndex = index;
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', function () {
        goToSlide(index);
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        let idx = getActiveSlideIndexFromDom();
        if (idx === null) idx = currentSlideIndex;
        const next = (idx + 1) % slides.length;
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
        let idx = getActiveSlideIndexFromDom();
        if (idx === null) idx = currentSlideIndex;
        let targetIndex;
        if (diff > 0) {
          targetIndex = (idx + 1) % slides.length;
        } else {
          targetIndex = (idx - 1 + slides.length) % slides.length;
        }
        goToSlide(targetIndex);
      }
    }

    window.addEventListener('beforeunload', function () {
      if (rafId) window.cancelAnimationFrame(rafId);
    });
  }
})();
