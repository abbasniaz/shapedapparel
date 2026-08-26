const products = [
  { id: 1, name: 'Intent Essential Tee', category: 'tees', price: 28, color: '#111111', print: '#ffffff', desc: 'Premium everyday cotton tee' },
  { id: 2, name: 'Statement Tee', category: 'tees', price: 32, color: '#eee9df', print: '#111111', desc: 'Clean oversized streetwear fit' },
  { id: 3, name: 'Intent Pullover Hoodie', category: 'hoodies', price: 58, color: '#292929', print: '#c5a572', desc: 'Midweight fleece hoodie' },
  { id: 4, name: 'Built Crewneck', category: 'hoodies', price: 52, color: '#866b54', print: '#ffffff', desc: 'Soft premium crewneck' },
  { id: 5, name: 'Business Polo', category: 'workwear', price: 42, color: '#17232b', print: '#ffffff', desc: 'Professional branded polo' },
  { id: 6, name: 'Team Performance Tee', category: 'workwear', price: 36, color: '#f1f1ed', print: '#111111', desc: 'Lightweight team apparel' },
  { id: 7, name: 'Core Logo Tee', category: 'tees', price: 30, color: '#30483e', print: '#ffffff', desc: 'Signature SHAPED logo tee' },
  { id: 8, name: 'Custom Order Deposit', category: 'workwear', price: 50, color: '#b89a6a', print: '#111111', desc: 'Start a custom apparel project' }
];

let cart = JSON.parse(localStorage.getItem('shapedCart') || '[]');
const grid = document.querySelector('#product-grid');

function renderProducts(filter = 'all') {
  if (!grid) return;
  grid.innerHTML = products
    .filter((p) => filter === 'all' || p.category === filter)
    .map(
      (p) =>
        `<article class="product-card"><div class="product-visual" style="--product-color:${p.color};--print-color:${p.print}"></div><div class="product-info"><h3>${p.name}</h3><p>${p.desc}</p><div class="product-bottom"><strong>$${p.price.toFixed(2)}</strong><button class="add" data-id="${p.id}">Add to bag</button></div></div></article>`
    )
    .join('');
}

function renderCart() {
  const wrap = document.querySelector('#cart-items');
  const count = document.querySelector('#cart-count');
  const total = document.querySelector('#cart-total');
  if (!wrap || !count || !total) return;

  count.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  wrap.innerHTML = cart.length
    ? cart
        .map(
          (item) =>
            `<div class="cart-item"><div><strong>${item.name}</strong><p>$${item.price.toFixed(2)} × ${item.qty}</p></div><button data-remove="${item.id}">Remove</button></div>`
        )
        .join('')
    : '<p>Your bag is empty.</p>';
  total.textContent = `$${cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}`;
}

function save() {
  localStorage.setItem('shapedCart', JSON.stringify(cart));
  renderCart();
}

function toast(message) {
  const el = document.querySelector('.toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1800);
}

function toggleCart(open) {
  const cartEl = document.querySelector('.cart');
  const overlay = document.querySelector('.overlay');
  if (!cartEl || !overlay) return;
  cartEl.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
  cartEl.setAttribute('aria-hidden', String(!open));
}

function initSlideshow() {
  const slideshow = document.querySelector('[data-slideshow]');
  if (!slideshow) return;

  const slides = [...slideshow.querySelectorAll('[data-slide]')];
  const dots = [...slideshow.querySelectorAll('[data-slide-dot]')];
  const prevButton = slideshow.querySelector('[data-slide-prev]');
  const nextButton = slideshow.querySelector('[data-slide-next]');
  if (!slides.length) return;

  let currentIndex = 0;
  let intervalId;

  const renderSlides = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === currentIndex);
    });

    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', String(isActive));
    });
  };

  const startAutoSlide = () => {
    window.clearInterval(intervalId);
    intervalId = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      renderSlides();
    }, 4000);
  };

  const goToSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    renderSlides();
    startAutoSlide();
  };

  prevButton?.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextButton?.addEventListener('click', () => goToSlide(currentIndex + 1));

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.slideIndex || 0);
      goToSlide(index);
    });
  });

  slideshow.addEventListener('mouseenter', () => window.clearInterval(intervalId));
  slideshow.addEventListener('mouseleave', startAutoSlide);

  renderSlides();
  startAutoSlide();
}

document.addEventListener('click', (e) => {
  if (e.target.matches('.add')) {
    const product = products.find((x) => x.id == e.target.dataset.id);
    if (!product) return;
    const found = cart.find((x) => x.id === product.id);
    found ? found.qty++ : cart.push({ ...product, qty: 1 });
    save();
    toast(`${product.name} added`);
  }

  if (e.target.matches('[data-remove]')) {
    cart = cart.filter((x) => x.id != e.target.dataset.remove);
    save();
  }

  if (e.target.matches('[data-filter]')) {
    document.querySelectorAll('[data-filter]').forEach((button) => button.classList.remove('active'));
    e.target.classList.add('active');
    renderProducts(e.target.dataset.filter);
  }
});

document.querySelector('.cart-button')?.addEventListener('click', () => toggleCart(true));
document.querySelector('.cart-close')?.addEventListener('click', () => toggleCart(false));
document.querySelector('.overlay')?.addEventListener('click', () => toggleCart(false));

document.querySelector('.menu-toggle')?.addEventListener('click', (e) => {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  nav.classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', String(nav.classList.contains('open')));
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => document.querySelector('.nav')?.classList.remove('open'));
});

document.querySelector('#checkout')?.addEventListener('click', () => {
  toggleCart(false);
  location.hash = 'custom';
  toast('Complete the quote form to request your order');
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

renderProducts();
renderCart();
initSlideshow();
