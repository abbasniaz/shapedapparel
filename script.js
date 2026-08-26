const products = [
  { id: 1, name: "Intent Essential Tee", category: "tees", price: 28, color: "#111111", print: "#ffffff", desc: "Premium everyday cotton tee" },
  { id: 2, name: "Statement Tee", category: "tees", price: 32, color: "#eee9df", print: "#111111", desc: "Clean oversized streetwear fit" },
  { id: 3, name: "Intent Pullover Hoodie", category: "hoodies", price: 58, color: "#292929", print: "#c5a572", desc: "Midweight fleece hoodie" },
  { id: 4, name: "Built Crewneck", category: "hoodies", price: 52, color: "#866b54", print: "#ffffff", desc: "Soft premium crewneck" },
  { id: 5, name: "Business Polo", category: "workwear", price: 42, color: "#17232b", print: "#ffffff", desc: "Professional branded polo" },
  { id: 6, name: "Team Performance Tee", category: "workwear", price: 36, color: "#f1f1ed", print: "#111111", desc: "Lightweight team apparel" },
  { id: 7, name: "Core Logo Tee", category: "tees", price: 30, color: "#30483e", print: "#ffffff", desc: "Signature SHAPED logo tee" },
  { id: 8, name: "Custom Order Deposit", category: "workwear", price: 50, color: "#b89a6a", print: "#111111", desc: "Start a custom apparel project" }
];

let cart = JSON.parse(localStorage.getItem("shapedCart") || "[]");
const grid = document.querySelector("#product-grid");

function renderProducts(filter = "all") {
  if (!grid) return;
  grid.innerHTML = products
    .filter((p) => filter === "all" || p.category === filter)
    .slice(0, 4)
    .map((p) => `
      <article class="product-card">
        <div class="product-visual">
          <div class="mock-shirt" style="background:${p.color};color:${p.print}">SH</div>
        </div>
        <div class="product-content">
          <h3 class="product-title">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-foot">
            <span class="price">$${p.price}</span>
            <button class="add" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function save() {
  localStorage.setItem("shapedCart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const wrap = document.querySelector("#cart-items");
  const count = document.querySelector("#cart-count");
  if (count) count.textContent = cart.reduce((s, i) => s + i.qty, 0);
  if (!wrap) return;
  wrap.innerHTML = cart.length
    ? cart
        .map(
          (i) => `
          <div class="cart-item">
            <div><b>${i.name}</b><div>$${i.price}</div></div>
            <div class="qty">
              <button data-minus="${i.id}">−</button>
              <span>${i.qty}</span>
              <button data-plus="${i.id}">+</button>
            </div>
          </div>
        `
        )
        .join("")
    : `<p>Your bag is empty.</p>`;
}

function toast(t) {
  const el = document.querySelector(".toast");
  if (!el) return;
  el.textContent = t;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1800);
}

function toggleCart(open) {
  const cartEl = document.querySelector(".cart");
  const overlay = document.querySelector(".overlay");
  if (!cartEl || !overlay) return;
  cartEl.classList.toggle("open", open);
  overlay.classList.toggle("show", open);
  cartEl.setAttribute("aria-hidden", String(!open));
}

document.addEventListener("click", (e) => {
  const t = e.target;

  if (t.matches(".add")) {
    const p = products.find((x) => x.id == t.dataset.id);
    if (!p) return;
    const found = cart.find((x) => x.id === p.id);
    found ? found.qty++ : cart.push({ ...p, qty: 1 });
    save();
    toast("Added to bag");
  }

  if (t.dataset.filter !== undefined) {
    document.querySelectorAll(".filters button").forEach((b) => b.classList.remove("active"));
    t.classList.add("active");
    renderProducts(t.dataset.filter);
  }

  if (t.dataset.plus) {
    const i = cart.find((x) => x.id == t.dataset.plus);
    if (!i) return;
    i.qty++;
    save();
  }

  if (t.dataset.minus) {
    const i = cart.find((x) => x.id == t.dataset.minus);
    if (!i) return;
    i.qty--;
    cart = cart.filter((x) => x.qty > 0);
    save();
  }
});

document.querySelector(".cart-button")?.addEventListener("click", () => toggleCart(true));
document.querySelector(".cart-close")?.addEventListener("click", () => toggleCart(false));
document.querySelector(".overlay")?.addEventListener("click", () => toggleCart(false));

document.querySelector(".menu-toggle")?.addEventListener("click", () => {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  nav.classList.toggle("open");
  document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", String(nav.classList.contains("open")));
});

document.querySelector("#checkout")?.addEventListener("click", () => toast("Checkout is coming soon"));
document.querySelector(".quote-form")?.addEventListener("submit", () => toast("Submitting quote request..."));

renderProducts();
renderCart();

/* Hero slideshow + swipe */
(function initHeroSlideshow() {
  const hero = document.querySelector(".hero-slideshow");
  if (!hero) return;

  const slides = [...hero.querySelectorAll(".hero-slide")];
  const dots = [...hero.querySelectorAll(".hero-dot")];
  const nextBtn = hero.querySelector(".hero-next");
  const prevBtn = hero.querySelector(".hero-prev");

  if (!slides.length || !dots.length || !nextBtn || !prevBtn) return;

  let index = 0;
  let timer = null;
  const interval = 4000;
  const swipeThreshold = 40;
  let touchStartX = 0;
  let touchEndX = 0;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, si) => s.classList.toggle("is-active", si === index));
    dots.forEach((d, di) => {
      const active = di === index;
      d.classList.toggle("is-active", active);
      d.setAttribute("aria-selected", String(active));
    });
  }

  function next() { show(index + 1); }
  function prev() { show(index - 1); }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    stop();
    timer = setInterval(next, interval);
  }

  nextBtn.addEventListener("click", () => { next(); start(); });
  prevBtn.addEventListener("click", () => { prev(); start(); });
  dots.forEach((dot, i) => dot.addEventListener("click", () => { show(i); start(); }));

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);

  hero.addEventListener("touchstart", (e) => {
    stop();
    touchStartX = e.changedTouches[0].clientX;
    touchEndX = touchStartX;
  }, { passive: true });

  hero.addEventListener("touchmove", (e) => {
    touchEndX = e.changedTouches[0].clientX;
  }, { passive: true });

  hero.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) >= swipeThreshold) {
      if (deltaX < 0) next();
      else prev();
    }
    start();
  }, { passive: true });

  show(0);
  start();
})();
