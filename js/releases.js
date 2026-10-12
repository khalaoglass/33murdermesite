// releases.js — filter releases by type, reads URL param on load

document.addEventListener('DOMContentLoaded', () => {
  const tabs  = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('#releasesList .release-card');

  if (!tabs.length || !cards.length) return;

  // Read ?filter=xxx from URL to pre-select a tab
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('filter') || 'all';
  setFilter(initial);

  // Tab click handler
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setFilter(tab.dataset.filter);
      // Update URL without reloading
      const url = new URL(window.location);
      if (tab.dataset.filter === 'all') {
        url.searchParams.delete('filter');
      } else {
        url.searchParams.set('filter', tab.dataset.filter);
      }
      history.replaceState(null, '', url);
    });
  });

  function setFilter(filter) {
    // Update active tab
    tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.filter === filter);
    });

    // Show/hide cards
    cards.forEach(card => {
      const type = card.dataset.type;
      const show = filter === 'all' || type === filter;
      card.style.display = show ? '' : 'none';
    });
  }
});
