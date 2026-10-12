// stats.js — live counters for Stats bar

// ─── War Economy (global military spending) ─────────────────────
const ANNUAL_SPEND = 2718000000000; // SIPRI latest annual global total
const PER_SECOND_SPEND = ANNUAL_SPEND / 31536000;

// Start from beginning of current year so it shows YTD accumulation
const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();

function getWarEconomy() {
  const elapsedSeconds = (Date.now() - yearStart) / 1000;
  return elapsedSeconds * PER_SECOND_SPEND;
}

// ─── Refugees (36.4 million base, slow drift upward) ────────────
// UNHCR reports ~36.4M refugees; grows ~3,000/day on average
const REFUGEE_BASE = 36400000;
const REFUGEES_PER_SECOND = 3000 / 86400; // ~3,000 new per day

// Use Jan 1 of current year as base date
function getRefugeeCount() {
  const elapsedSeconds = (Date.now() - yearStart) / 1000;
  return REFUGEE_BASE + elapsedSeconds * REFUGEES_PER_SECOND;
}

// ─── Formatting ─────────────────────────────────────────────────
function formatNumber(n) {
  return Math.floor(n).toLocaleString('en-US');
}

function formatCurrency(n) {
  return Math.floor(n).toLocaleString('en-US');
}

// ─── Tick loop ──────────────────────────────────────────────────
function updateStats() {
  const warEl = document.getElementById('warEconomy');
  const refEl = document.getElementById('refugeeCount');

  if (warEl) warEl.textContent = formatCurrency(getWarEconomy());
  if (refEl) refEl.textContent = formatNumber(getRefugeeCount());
}

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  setInterval(updateStats, 100); // update 10x/sec for smooth ticking
});
