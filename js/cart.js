// cart.js — shopping cart for merch page (localStorage-backed)

// ─── Product catalog (mirrors HTML data attributes) ──────────────
const CATALOG = {};
document.querySelectorAll('.product-card[data-id]').forEach(card => {
  CATALOG[card.dataset.id] = {
    id:    card.dataset.id,
    name:  card.dataset.name,
    price: parseFloat(card.dataset.price),
    img:   card.querySelector('img') ? card.querySelector('img').src : '',
  };
});

// ─── Cart state ──────────────────────────────────────────────────
const CART_KEY = '33mm_cart';

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
  if (window._33mm && window._33mm.syncCartBadge) window._33mm.syncCartBadge();
}

function addItem(id) {
  const cart = loadCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    const product = CATALOG[id];
    if (!product) return;
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  openCart();
}

function removeItem(id) {
  saveCart(loadCart().filter(i => i.id !== id));
}

function changeQty(id, delta) {
  const cart = loadCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  saveCart(item.qty === 0 ? cart.filter(i => i.id !== id) : cart);
}

// ─── Cart drawer UI ──────────────────────────────────────────────
function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartBackdrop')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartBackdrop')?.classList.remove('open');
  document.body.style.overflow = '';
}

function fmt(n) { return '$' + n.toFixed(2); }

function renderCart() {
  const cart     = loadCart();
  const itemsEl  = document.getElementById('cartItems');
  const emptyEl  = document.getElementById('cartEmpty');
  const subEl    = document.getElementById('cartSubtotal');
  if (!itemsEl) return;

  // Remove old rendered items (keep the empty message el)
  itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = '';
    if (subEl)   subEl.textContent = '$0.00';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${item.img}" alt="${item.name}" onerror="this.style.background='#1e1e1e';this.removeAttribute('src')" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove">✕</button>
    `;
    itemsEl.appendChild(el);
  });

  if (subEl) subEl.textContent = fmt(subtotal);
}

// ─── Stripe checkout stub ────────────────────────────────────────
// When you're ready: add your Stripe publishable key and a
// serverless function endpoint (Netlify Functions / Vercel Edge)
// to create a Checkout Session.
async function handleCheckout() {
  // TODO: replace with real Stripe integration
  // const stripe = Stripe('pk_live_...');
  // const resp = await fetch('/api/create-checkout-session', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ items: loadCart() }),
  // });
  // const { sessionId } = await resp.json();
  // await stripe.redirectToCheckout({ sessionId });
  alert('Checkout coming soon! Stripe integration will be wired up when the shop launches.');
}

// ─── Event wiring ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // "Add to Cart" buttons
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => addItem(btn.dataset.id));
  });

  // Cart toggle (nav button)
  document.getElementById('cartToggle')?.addEventListener('click', openCart);

  // Close button
  document.getElementById('cartClose')?.addEventListener('click', closeCart);

  // Backdrop click closes cart
  document.getElementById('cartBackdrop')?.addEventListener('click', closeCart);

  // Checkout button
  document.getElementById('checkoutBtn')?.addEventListener('click', handleCheckout);

  // Qty + remove (delegated)
  document.getElementById('cartItems')?.addEventListener('click', e => {
    const qtyBtn    = e.target.closest('.qty-btn');
    const removeBtn = e.target.closest('.cart-item-remove');
    if (qtyBtn)    changeQty(qtyBtn.dataset.id, parseInt(qtyBtn.dataset.delta));
    if (removeBtn) removeItem(removeBtn.dataset.id);
  });

  // External openCart event (from main.js cart icon on other pages)
  document.addEventListener('openCart', openCart);

  // Auto-open if navigated here via merch.html#cart
  if (window.location.hash === '#cart') openCart();

  // Initial render
  renderCart();
  if (window._33mm && window._33mm.syncCartBadge) window._33mm.syncCartBadge();
});
