(function () {
  'use strict';

  var grid = document.getElementById('photoGrid');
  var searchInput = document.getElementById('boardSearch');
  var emptyMsg = document.getElementById('photoEmpty');
  var lightbox = document.getElementById('photoLightbox');
  var lightboxImage = document.getElementById('photoLightboxImage');
  var lightboxTitle = document.getElementById('photoLightboxTitle');
  var closeBtn = document.querySelector('.photo-lightbox-close');
  var prevBtn = document.querySelector('.photo-lightbox-prev');
  var nextBtn = document.querySelector('.photo-lightbox-next');
  var photos = [];
  var currentIndex = -1;
  var incomingPhotos = {
    '2024003.jpg': true,
    '20240457.jpg': true,
    '20240510_133026.jpg': true,
    '2024071.jpg': true,
    '2025000.jpg': true,
    '2025009.jpg': true,
    '2025014.jpg': true,
    '2025022.jpg': true,
    '2025033.jpg': true,
    '20250389.jpg': true,
    '20250489.jpg': true,
    '20250918_021259.jpg': true,
    '20250918_021418.jpg': true,
    '____________.jpg': true,
    'img_5490.jpg': true,
    'img_5491.jpg': true,
    'img_5492.jpg': true,
    'img_5512.jpg': true
  };

  var knownMeta = {
    'hrg2.jpg': { title: 'Official Portrait', category: 'press', description: 'Official press photo for media use.' },
    'hijab1.jpg': { title: 'Editorial', category: 'press', description: 'Editorial press shot for articles and promo features.' },
    'hijab2.jpg': { title: 'Alternate Look', category: 'press', description: 'Alternate press photo with the same raw energy.' },
    'hijab3.jpg': { title: 'Live - On Stage', category: 'live', description: 'Live performance photo with crowd energy.' },
    'album_cover.jpg': { title: 'Album Art - Pain Heals Part III', category: 'artwork', description: 'Official cover art for Pain Heals Part III.' },
    'pain-heals-part-i-cover.jpg': { title: 'Album Art - Pain Heals Part I', category: 'artwork', description: 'Official cover art for Pain Heals Part I.' },
    'pain-heals-part-ii-cover.jpg': { title: 'Album Art - Pain Heals Part II', category: 'artwork', description: 'Official cover art for Pain Heals Part II.' },
    'update.jpeg': { title: 'BTS - Studio Session', category: 'bts', description: 'Behind the scenes while making new releases.' },
    'playing-geoguessr-and-found-a-confederate-flag-in-germany-v0-3hlk0lnufqk71.jpg': { title: 'Geoguessr Flag Find', category: 'press', description: 'Archive screenshot from an online geolocation game session.' },
    'southern-belle-racist-as-hell-v0-1r657vtgd8if1.jpg': { title: 'Southern Belle Image', category: 'press', description: 'Archival photo capture included in the media gallery.' },
    'this-couple-couldnt-see-anything-wrong-with-sporting-a-v0-c2j3yvi7wt731.jpg': { title: 'Couple Snapshot', category: 'press', description: 'Archival social media image included for documentation.' },
    'confederate-latina-v0-ep5wsbla7rvg1.jpg': { title: 'Confederate Latina', category: 'press', description: 'Archival image captured for the media timeline.' },
    'found-an-old-kkk-membership-application-in-my-grandfathers-v0-aar3u6d5d6fc1.jpg': { title: 'Membership Application Photo', category: 'press', description: 'Archived image from the reference collection.' },
    '____________.jpg': { title: 'Untitled Photo', category: 'press', description: 'Photo from the Pain Heals media archive.' }
  };

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function inferCategory(fileName) {
    var lower = fileName.toLowerCase();
    if (lower.indexOf('cover') >= 0 || lower.indexOf('art') >= 0) return 'artwork';
    if (lower.indexOf('live') >= 0 || lower.indexOf('stage') >= 0) return 'live';
    if (lower.indexOf('bts') >= 0 || lower.indexOf('update') >= 0) return 'bts';
    if (lower.indexOf('press') >= 0 || lower.indexOf('portrait') >= 0 || lower.indexOf('hijab') >= 0 || lower.indexOf('hrg') >= 0) return 'press';
    return 'press';
  }

  function titleFromName(fileName) {
    var decoded = fileName;
    try {
      decoded = decodeURIComponent(fileName);
    } catch (e) {
      decoded = fileName;
    }
    var base = decoded.replace(/\.[^.]+$/, '');
    return base
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }

  function getPhotoMeta(fileName) {
    var meta = knownMeta[fileName.toLowerCase()];
    if (meta) return meta;
    return {
      title: titleFromName(fileName),
      category: inferCategory(fileName),
      description: 'Photo from the Pain Heals media archive.'
    };
  }

  function createCardHtml(item, index) {
    var number = String(index + 1).padStart(3, '0');
    var safeTitle = escapeHtml(item.title);
    var safeDesc = escapeHtml(item.description);
    var safeAlt = escapeHtml(item.alt);

    return ''
      + '<article class="photo-card" data-title="' + safeTitle.toLowerCase() + '">'
      +   '<button class="photo-card-open" type="button" aria-label="Open ' + safeTitle + '" data-index="' + index + '">'
      +     '<img src="' + item.url + '" alt="' + safeAlt + '" loading="lazy" decoding="async" />'
      +     '<span class="photo-card-scanline" aria-hidden="true"></span>'
      +   '</button>'
      +   '<div class="photo-card-content">'
      +     '<div class="photo-card-meta">'
      +       '<span class="thread-author">Anonymous</span>'
      +       '<span class="thread-date">2026</span>'
      +       '<span class="thread-no">No.' + number + '</span>'
      +     '</div>'
      +     '<h2>[ ' + safeTitle + ' ]</h2>'
      +     '<p>' + safeDesc + '</p>'
      +     '<div class="photo-card-actions">'
      +       '<a href="' + item.url + '" target="_blank" rel="noopener">[ View Full ]</a>'
      +       '<a href="mailto:press@33murderme.com">[ Request Hi-Res ]</a>'
      +     '</div>'
      +   '</div>'
      + '</article>';
  }

  function renderGrid() {
    grid.innerHTML = photos.map(createCardHtml).join('');

    grid.querySelectorAll('.photo-card-open').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-index'), 10);
        openLightbox(idx);
      });
    });

    applyFilterAndSearch();
  }

  function applyFilterAndSearch() {
    var query = (searchInput.value || '').trim().toLowerCase();
    var visibleCount = 0;
    var cards = grid.querySelectorAll('.photo-card');

    cards.forEach(function (card) {
      var title = card.getAttribute('data-title') || '';
      var text = card.textContent.toLowerCase();
      var show = !query || title.indexOf(query) >= 0 || text.indexOf(query) >= 0;
      card.classList.toggle('hidden', !show);
      if (show) visibleCount += 1;
    });

    emptyMsg.classList.toggle('hidden', visibleCount !== 0);
  }

  function openLightbox(index) {
    if (index < 0 || index >= photos.length) return;
    currentIndex = index;
    var item = photos[index];
    lightboxImage.src = item.url;
    lightboxImage.alt = item.alt;
    lightboxTitle.textContent = '[ ' + item.title + ' ]';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = '';
    document.body.style.overflow = '';
  }

  function shiftLightbox(step) {
    if (currentIndex < 0 || photos.length === 0) return;
    var next = currentIndex + step;
    if (next < 0) next = photos.length - 1;
    if (next >= photos.length) next = 0;
    openLightbox(next);
  }

  function parseFolderListing(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var links = Array.prototype.slice.call(doc.querySelectorAll('a[href]'));
    var fileNames = links
      .map(function (a) { return a.getAttribute('href') || ''; })
      .filter(function (href) { return /\.(jpe?g|png|gif|webp)$/i.test(href); })
      .map(function (href) {
        var rawName = href.split('/').pop();
        try {
          return decodeURIComponent(rawName);
        } catch (e) {
          return rawName;
        }
      });

    var unique = [];
    fileNames.forEach(function (name) {
      if (unique.indexOf(name) < 0) unique.push(name);
    });
    return unique;
  }

  function spreadPhotos(fileNames) {
    var existing = [];
    var added = [];
    fileNames.forEach(function (name) {
      if (incomingPhotos[name.toLowerCase()]) added.push(name);
      else existing.push(name);
    });
    existing.sort(function (a, b) { return a.localeCompare(b); });
    added.sort(function (a, b) { return a.localeCompare(b); });
    var result = [];
    var ei = 0;
    var ai = 0;
    var total = existing.length + added.length;
    for (var n = 0; n < total; n++) {
      if (ei >= existing.length) {
        result.push(added[ai++]);
      } else if (ai >= added.length) {
        result.push(existing[ei++]);
      } else if ((ei / existing.length) <= (ai / added.length)) {
        result.push(existing[ei++]);
      } else {
        result.push(added[ai++]);
      }
    }
    return result;
  }

  function buildPhotoData(fileNames) {
    return fileNames.map(function (name) {
      var meta = getPhotoMeta(name);
      return {
        file: name,
        url: 'photos/' + encodeURIComponent(name),
        alt: meta.title + ' photo',
        title: meta.title,
        category: meta.category,
        description: meta.description
      };
    });
  }

  function initEvents() {
    searchInput.addEventListener('input', applyFilterAndSearch);

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', function () { shiftLightbox(-1); });
    nextBtn.addEventListener('click', function () { shiftLightbox(1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') shiftLightbox(-1);
      if (e.key === 'ArrowRight') shiftLightbox(1);
    });
  }

  function showPhotos(names) {
    photos = names.length ? buildPhotoData(spreadPhotos(names)) : [];
    renderGrid();
  }

  fetch('photos/manifest.json')
    .then(function (resp) {
      if (!resp.ok) throw new Error('no manifest');
      return resp.json();
    })
    .then(function (names) {
      if (!Array.isArray(names) || !names.length) throw new Error('empty manifest');
      showPhotos(names.filter(function (name) {
        return typeof name === 'string' && /\.(jpe?g|png|gif|webp)$/i.test(name);
      }));
    })
    .catch(function () {
      fetch('photos/')
        .then(function (resp) { return resp.text(); })
        .then(function (html) { showPhotos(parseFolderListing(html)); })
        .catch(function () { showPhotos([]); });
    });

  initEvents();
})();
