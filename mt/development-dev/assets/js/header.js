document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('.c-header');
  const nav = document.querySelector('.c-header__nav');
  const hamburger = document.querySelector('.c-header__hamburger');
  const megaItems = Array.from(document.querySelectorAll('.c-header__item--has-mega'));
  const plainLinks = Array.from(document.querySelectorAll('.c-header__item:not(.c-header__item--has-mega) .c-header__link'));
  const desktopQuery = window.matchMedia('(min-width: 768px)');

  if (!header || !nav || !hamburger) {
    return;
  }

  function setExpanded(item, expanded) {
    const trigger = item.querySelector('.c-header__link');

    if (trigger) {
      trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }

  function closeAllMega(exceptItem) {
    megaItems.forEach(function (item) {
      if (item !== exceptItem) {
        item.classList.remove('is-active');
        setExpanded(item, false);
      }
    });
  }

  function openMega(item) {
    closeAllMega(item);
    item.classList.add('is-active');
    setExpanded(item, true);
  }

  function closeMega(item) {
    item.classList.remove('is-active');
    setExpanded(item, false);
  }

  function closeMobileNav() {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
    nav.classList.remove('is-open');
    document.body.classList.remove('u-overflow-hidden');
  }

  function toggleMobileNav() {
    const isOpen = hamburger.classList.toggle('is-open');

    nav.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    document.body.classList.toggle('u-overflow-hidden', isOpen);

    if (!isOpen) {
      closeAllMega();
    }
  }

  hamburger.addEventListener('click', function (event) {
    event.stopPropagation();
    toggleMobileNav();
  });

  megaItems.forEach(function (item) {
    const trigger = item.querySelector('.c-header__link');
    let closeTimer;

    if (!trigger) {
      return;
    }

    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();

      const isActive = item.classList.contains('is-active');

      if (isActive) {
        closeMega(item);
      } else {
        openMega(item);
      }
    });

    item.addEventListener('mouseenter', function () {
      if (!desktopQuery.matches) {
        return;
      }

      clearTimeout(closeTimer);
      openMega(item);
    });

    item.addEventListener('mouseleave', function () {
      if (!desktopQuery.matches) {
        return;
      }

      closeTimer = setTimeout(function () {
        closeMega(item);
      }, 120);
    });

    item.addEventListener('focusin', function () {
      if (!desktopQuery.matches) {
        return;
      }

      openMega(item);
    });

    item.addEventListener('focusout', function () {
      if (!desktopQuery.matches) {
        return;
      }

      setTimeout(function () {
        if (!item.contains(document.activeElement)) {
          closeMega(item);
        }
      }, 0);
    });
  });

  plainLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth < 768 && nav.classList.contains('is-open')) {
        closeMobileNav();
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!header.contains(event.target)) {
      closeAllMega();
      if (nav.classList.contains('is-open')) {
        closeMobileNav();
      }
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllMega();
      if (nav.classList.contains('is-open')) {
        closeMobileNav();
      }
    }
  });

  desktopQuery.addEventListener('change', function (event) {
    if (event.matches) {
      closeMobileNav();
    }
  });

  const mobileSearchInput = document.querySelector('#header-mobile-search-q');
  const mobileSearchClear = document.querySelector('.c-header__mobile-search-clear');

  if (mobileSearchInput && mobileSearchClear) {
    function syncMobileSearchClear() {
      if (mobileSearchInput.value.trim()) {
        mobileSearchClear.removeAttribute('hidden');
      } else {
        mobileSearchClear.setAttribute('hidden', '');
      }
    }

    mobileSearchInput.addEventListener('input', syncMobileSearchClear);
    mobileSearchClear.addEventListener('click', function () {
      mobileSearchInput.value = '';
      mobileSearchInput.focus();
      syncMobileSearchClear();
    });
    syncMobileSearchClear();
  }
});
