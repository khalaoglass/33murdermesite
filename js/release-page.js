// release-page.js — populate release detail page from URL params
// URL format: release.html?id=single1&title=Track%20Name&type=singles&date=2025&sc=https://...&ig=https://...

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);

  const id    = params.get('id')    || '';
  const title = params.get('title') || '[ Track / Album Title ]';
  const type  = params.get('type')  || 'singles';
  const date  = params.get('date')  || '[ Release Date ]';
  const sc    = params.get('sc')    || '#';
  const ig    = params.get('ig')    || '#';
  const spot  = params.get('spotify') || '#';
  const apple = params.get('apple')   || '#';
  const yt    = params.get('yt')      || '#';
  const img   = params.get('img')     || 'assets/img/latest-cover.jpg';

  // Page title
  document.title = `${title} — 33murderme`;

  // Hero image
  const heroImg = document.getElementById('releaseHeroImg');
  if (heroImg && img) heroImg.src = img;

  // Board slug + title
  const slugEl = document.getElementById('releaseSlug');
  const titleEl = document.getElementById('releaseTitle');
  const displaySlug = type === 'singles' ? '/before-pain-heals-vault/' : `/${type}/`;
  if (slugEl)  slugEl.textContent  = displaySlug;
  if (titleEl) titleEl.textContent = ` — ${title}`;

  // Metadata
  const dateEl = document.getElementById('releaseDateEl');
  const scLink = document.getElementById('releaseSCLink');
  const igLink = document.getElementById('releaseIGLink');
  if (dateEl) dateEl.textContent = date;
  if (scLink) { scLink.href = sc;  scLink.textContent = sc !== '#' ? sc : '[ SoundCloud Link ]'; }
  if (igLink) { igLink.href = ig;  igLink.textContent = ig !== '#' ? ig : '@33murderme'; }

  // Stream links
  const spotEl  = document.getElementById('spotifyLink');
  const appleEl = document.getElementById('appleLink');
  const scEl    = document.getElementById('scLink');
  const ytEl    = document.getElementById('ytLink');
  if (spotEl)  spotEl.href  = spot;
  if (appleEl) appleEl.href = apple;
  if (scEl)    scEl.href    = sc;
  if (ytEl)    ytEl.href    = yt;

  // SoundCloud embed — update src if a real track URL is given
  if (sc && sc !== '#') {
    const embed = document.getElementById('scEmbed');
    if (embed) {
      const encodedUrl = encodeURIComponent(sc);
      embed.src = `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23cc0000&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false`;
    }
  }

  // Player artwork
  const playerArt = document.getElementById('playerArt');
  if (playerArt && img) playerArt.src = img;

  // Player track name
  const playerTrackName = document.getElementById('playerTrackName');
  if (playerTrackName) playerTrackName.textContent = title;

  // Toggle between SoundCloud embed and HTML5 player
  const toggleBtn   = document.getElementById('togglePlayerMode');
  const scPlayer    = document.getElementById('scPlayer');
  const html5Player = document.getElementById('html5Player');
  let showingSC = true;

  toggleBtn?.addEventListener('click', () => {
    showingSC = !showingSC;
    if (showingSC) {
      scPlayer?.classList.remove('hidden');
      html5Player?.classList.add('hidden');
      toggleBtn.textContent = 'Switch to HTML5 Player';
    } else {
      scPlayer?.classList.add('hidden');
      html5Player?.classList.remove('hidden');
      toggleBtn.textContent = 'Switch to SoundCloud Player';
    }
  });
});
