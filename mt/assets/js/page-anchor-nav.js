(function () {
  'use strict';

  const nav = document.querySelector('.c-page-anchor-nav');
  if (!nav) return;

  const links = nav.querySelectorAll('.c-page-anchor-nav__item[href]');

  function getHeaderHeight() {
    const header = document.querySelector('.c-header');
    return header ? header.offsetHeight : 0;
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;

      const target = document.getElementById(href.substring(1));
      if (!target) return;

      e.preventDefault();

      const offset = getHeaderHeight();
      const top =
        target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
