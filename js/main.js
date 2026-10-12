// main.js — shared UI: mobile nav and spotlight dismiss

document.addEventListener('DOMContentLoaded', () => {

  // ─── Mobile hamburger nav ────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navDrawer  = document.getElementById('navDrawer');

  if (hamburger && navDrawer) {
    hamburger.addEventListener('click', () => {
      navDrawer.classList.toggle('open');
      const isOpen = navDrawer.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close drawer when a link is clicked
    navDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navDrawer.classList.remove('open'));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navDrawer.contains(e.target)) {
        navDrawer.classList.remove('open');
      }
    });
  }

  // ─── Spotlight box dismiss ───────────────────────────────────
  const spotlightPanel = document.getElementById('spotlightPanel');
  const closeSpotlight = document.getElementById('closeSpotlight');

  if (spotlightPanel && closeSpotlight) {
    // Dismiss on click — hides until next page load/refresh
    closeSpotlight.addEventListener('click', () => {
      spotlightPanel.style.transition = 'opacity 0.2s';
      spotlightPanel.style.opacity = '0';
      setTimeout(() => spotlightPanel.classList.add('hidden'), 200);
    });
  }

});
