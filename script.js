const products = [
  { id: 1, name: 'Intent Essential Tee', category: 'tees', price: 28, color: '#111111', print: '#ffffff', desc: 'Premium everyday cotton tee' },
  { id: 2, name: 'Statement Tee', category: 'tees', price: 32, color: '#eee9df', print: '#111111', desc: 'Clean oversized streetwear fit' },
  { id: 3, name: 'Intent Pullover Hoodie', category: 'hoodies', price: 58, color: '#292929', print: '#c5a572', desc: 'Midweight fleece hoodie' },
  { id: 4, name: 'Built Crewneck', category: 'hoodies', price: 52, color: '#866b54', print: '#ffffff', desc: 'Soft premium crewneck' },
  { id: 5, name: 'Business Polo', category: 'workwear', price: 42, color: '#17232b', print: '#ffffff', desc: 'Professional branded polo' },
  { id: 6, name: 'Team Performance Tee', category: 'workwear', price: 36, color: '#f1f1ed', print: '#111111', desc: 'Lightweight team apparel' },
  { id: 7, name: 'Core Logo Tee', category: 'tees', price: 30, color: '#30483e', print: '#ffffff', desc: 'Signature SHAPED logo tee' },
  { id: 8, name: 'Custom Order Deposit', category: 'workwear', price: 50, color: '#b89a6a', print: '#111111', desc: 'Start a custom apparel project' },
  { id: 9, name: 'Bright Colour Graphics Shirt', category: 'tees', price: 29.99, color: '#ff6b6b', print: '#ffffff', desc: 'Eye-catching bright graphic tee — soft, breathable' }
];

let cart = JSON.parse(localStorage.getItem('shapedCart') || '[]');
const grid = document.querySelector('#product-grid');

function renderProducts(filter = 'all') {
  if (!grid) return;
  grid.innerHTML = products
    .filter(p => filter === 'all' || p.category === filter)
    .map(p => `
      <article class="product-card">
        <div class="card-media">
          <!-- product images may be added later; placeholder color used -->
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${p.color};color:${p.print};">
            <strong>${p.name}</strong>
          </div>
        </div>
        <div class="card-body">
          <h4 class="card-title">${p.name}</h4>
          <p class="card-sub">${p.desc}</p>
          <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
            <button class="btn btn-primary add" data-id="${p.id}">Add</button>
            <div style="font-weight:700">$${p.price}</div>
          </div>
        </div>
      </article>
    `).join('');
}

function save() {
  localStorage.setItem('shapedCart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const wrap = document.querySelector('#cart-items');
  const count = document.querySelector('#cart-count');
  if (count) count.textContent = cart.reduce((s, i) => s + (i.qty || 0), 0);
  if (!wrap) return;
  if (!cart.length) { wrap.innerHTML = '<p>Your bag is empty</p>'; return; }
  wrap.innerHTML = cart.map(i => `<div>${i.name} × ${i.qty}</div>`).join('');
}

function toast(t) {
  const el = document.querySelector('.toast');
  if (!el) return; el.textContent = t; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1800);
}

function toggleCart(open) {
  const cartEl = document.querySelector('.cart');
  const overlay = document.querySelector('.overlay');
  if (cartEl) cartEl.classList.toggle('open', open);
  if (overlay) overlay.classList.toggle('show', open);
}

document.addEventListener('click', e => {
  const el = e.target;
  if (el.matches('.add')) {
    const id = Number(el.dataset.id);
    const p = products.find(x => x.id === id);
    if (!p) return;
    const found = cart.find(x => x.id === p.id);
    if (found) found.qty = (found.qty || 1) + 1;
    else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
    save();
    toast('Added to cart');
  }
});

// Cart button handlers (safely guard elements)
const cartBtn = document.querySelector('.cart-button');
if (cartBtn) cartBtn.addEventListener('click', () => toggleCart(true));
const cartClose = document.querySelector('.cart-close');
if (cartClose) cartClose.addEventListener('click', () => toggleCart(false));

// Initial render
renderProducts();
renderCart();

// Theme toggle (persisted) — DEFAULT: light to ensure visuals are visible
(function () {
  const root = document.documentElement;
  const key = 'shaped-theme';

  function applyTheme(t) {
    if (t === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme'); // default is light
  }

  // initialize (default to light)
  const saved = localStorage.getItem(key) || 'light';
  applyTheme(saved);

  // expose toggle function for the button
  window.toggleTheme = function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(key, next);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = next === 'light' ? '🌞' : '🌙';
  };

  // wire the button when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', window.toggleTheme, { passive: true });
    // set initial icon according to saved theme
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = saved === 'light' ? '🌞' : '🌙';
  });
})();
