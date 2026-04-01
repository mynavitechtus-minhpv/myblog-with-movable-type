document.addEventListener('DOMContentLoaded', function () {
  var tracks = document.querySelectorAll('.js-slider-infinite-track');
  tracks.forEach(function (track) {
    if (!track || track.dataset.cloned === '1') return;

    var original = track.innerHTML;
    track.innerHTML = original + original;
    track.dataset.cloned = '1';
  });
});

