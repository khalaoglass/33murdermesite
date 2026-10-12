/* player.js — reusable music player for 33murderme */

(function () {
  'use strict';

  function fileExt(src) {
    var match = String(src).match(/\.([a-z0-9]+)(?:\?.*)?$/i);
    return match ? '.' + match[1].toLowerCase() : '.mp3';
  }

  function downloadName(track) {
    return track.title.replace(/^Track \d+ — /, '') + fileExt(track.src);
  }

  /* Build playlist from the track threads on this page */
  var threads = document.querySelectorAll('.board-thread[data-track-index]');
  var playlist = [];

  threads.forEach(function (el) {
    var idx = parseInt(el.getAttribute('data-track-index'), 10);
    var titleEl = el.querySelector('.thread-post-title');
    var imgEl = el.querySelector('.thread-thumb');
    var dl = el.querySelector('.track-dl-link');
    playlist.push({
      index: idx,
      title: titleEl ? titleEl.textContent.trim() : 'Track ' + (idx + 1),
      src: dl ? dl.getAttribute('href') : '',
      cover: imgEl ? imgEl.src : 'assets/album_cover.jpg'
    });
  });

  if (!playlist.length) return;

  /* ─── DOM REFS ──────────────────────────────────────────────── */
  var audio        = document.getElementById('audioElement');
  var playerWrap   = document.getElementById('musicPlayer');
  var playerTitle  = document.getElementById('playerTitle');
  var playerCover  = document.getElementById('playerCover');
  var playPauseBtn = document.getElementById('playPauseBtn');
  var prevBtn      = document.getElementById('prevBtn');
  var nextBtn      = document.getElementById('nextBtn');
  var progressBar  = document.getElementById('progressBar');
  var currentTime  = document.getElementById('currentTime');
  var totalTime    = document.getElementById('totalTime');
  var volumeBar    = document.getElementById('volumeBar');
  var playAllBtn   = document.getElementById('playAllBtn');
  var dlBtn        = document.getElementById('playerDlBtn');

  if (!audio || !playerWrap) return;

  var currentIndex = -1;
  var isPlaying    = false;

  /* ─── HELPERS ───────────────────────────────────────────────── */
  var TITLE_PX_PER_SEC = 48;
  var TITLE_GAP_PX = 48;
  var titleAnim = null;
  var titleDistance = 0;

  function titleTrack() {
    var track = playerTitle.querySelector('.player-title-track');
    if (!track) {
      playerTitle.textContent = '';
      track = document.createElement('span');
      track.className = 'player-title-track';
      playerTitle.appendChild(track);
    }
    return track;
  }

  function setPlayerTitle(text) {
    var track = titleTrack();
    track.textContent = '';
    var main = document.createElement('span');
    main.className = 'player-title-text';
    main.textContent = text;
    var copy = document.createElement('span');
    copy.className = 'player-title-text player-title-copy';
    copy.setAttribute('aria-hidden', 'true');
    copy.textContent = text;
    track.appendChild(main);
    track.appendChild(copy);
    titleDistance = 0;
    fitPlayerTitle();
  }

  function fitPlayerTitle() {
    if (!playerTitle) return;
    var track = titleTrack();
    var main = track.querySelector('.player-title-text');
    var copy = track.querySelector('.player-title-copy');
    if (!main) return;
    var fits = main.offsetWidth <= playerTitle.clientWidth + 1;
    if (fits) {
      playerTitle.classList.remove('is-overflow');
      if (copy) copy.style.display = 'none';
      if (titleAnim) {
        titleAnim.cancel();
        titleAnim = null;
      }
      track.style.transform = '';
      titleDistance = 0;
      return;
    }
    if (copy) copy.style.display = '';
    playerTitle.classList.add('is-overflow');
    var distance = Math.round(main.offsetWidth + TITLE_GAP_PX);
    if (titleAnim && titleAnim.playState === 'running' && Math.abs(distance - titleDistance) < 3) return;
    titleDistance = distance;
    if (titleAnim) titleAnim.cancel();
    titleAnim = track.animate([
      { transform: 'translateX(0px)' },
      { transform: 'translateX(' + (-distance) + 'px)' }
    ], {
      duration: (distance / TITLE_PX_PER_SEC) * 1000,
      iterations: Infinity,
      easing: 'linear'
    });
  }

  window.addEventListener('resize', fitPlayerTitle);
  if (window.ResizeObserver) {
    new ResizeObserver(fitPlayerTitle).observe(playerTitle);
  }

  function fmt(sec) {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function highlightTrack(idx) {
    threads.forEach(function (el) {
      el.classList.remove('playing');
    });
    if (idx >= 0 && idx < threads.length) {
      threads[idx].classList.add('playing');
    }
  }

  /* ─── LOAD & PLAY ──────────────────────────────────────────── */
  function loadTrack(idx, autoplay) {
    if (idx < 0 || idx >= playlist.length) return;
    currentIndex = idx;
    var track = playlist[idx];

    audio.src = track.src;
    if (playerCover) playerCover.src = track.cover;
    highlightTrack(idx);
    playerWrap.classList.add('active');
    setPlayerTitle(track.title);

    // Update download button
    if (dlBtn && track.src) {
      dlBtn.href = track.src;
      dlBtn.download = downloadName(track);
    }

    if (autoplay) {
      audio.play().then(function () {
        isPlaying = true;
        playPauseBtn.textContent = '⏸';
      }).catch(function () {});
    }
  }

  function togglePlay() {
    if (currentIndex < 0) {
      loadTrack(0, true);
      return;
    }
    if (audio.paused) {
      audio.play().then(function () {
        isPlaying = true;
        playPauseBtn.textContent = '⏸';
      }).catch(function () {});
    } else {
      audio.pause();
      isPlaying = false;
      playPauseBtn.textContent = '▶';
    }
  }

  function playNext() {
    if (currentIndex < 0) return;
    var next = (currentIndex + 1) % playlist.length;
    loadTrack(next, true);
  }

  function playPrev() {
    if (currentIndex < 0) return;
    // If more than 3s in, restart current track
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    var prev = (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack(prev, true);
  }

  /* ─── EVENTS ────────────────────────────────────────────────── */
  playPauseBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', playNext);
  prevBtn.addEventListener('click', playPrev);

  audio.addEventListener('timeupdate', function () {
    currentTime.textContent = fmt(audio.currentTime);
    if (audio.duration) {
      progressBar.value = (audio.currentTime / audio.duration) * 100;
    }
  });

  audio.addEventListener('loadedmetadata', function () {
    totalTime.textContent = fmt(audio.duration);
    progressBar.value = 0;
  });

  audio.addEventListener('ended', playNext);

  progressBar.addEventListener('input', function () {
    if (audio.duration) {
      audio.currentTime = (progressBar.value / 100) * audio.duration;
    }
  });

  // Volume
  audio.volume = 0.8;
  volumeBar.addEventListener('input', function () {
    audio.volume = volumeBar.value / 100;
  });

  /* ─── TRACK CLICK HANDLERS ─────────────────────────────────── */
  document.querySelectorAll('.track-play-link[data-index]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var idx = parseInt(this.getAttribute('data-index'), 10);
      if (idx === currentIndex && !audio.paused) {
        togglePlay();
      } else {
        loadTrack(idx, true);
      }
    });
  });

  /* ─── PLAY ALL ──────────────────────────────────────────────── */
  if (playAllBtn) {
    playAllBtn.addEventListener('click', function (e) {
      e.preventDefault();
      loadTrack(0, true);
    });
  }

  /* ─── DOWNLOAD ALL ─────────────────────────────────────────── */
  var downloadAllBtn = document.getElementById('downloadAllBtn');
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // Stagger downloads 500ms apart so browsers don't block them
      playlist.forEach(function (track, i) {
        if (!track.src) return;
        setTimeout(function () {
          var a = document.createElement('a');
          a.href = track.src;
          a.download = downloadName(track);
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, i * 500);
      });
    });
  }

})();
