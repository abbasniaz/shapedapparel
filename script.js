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

function cartTotals() {
  const items = cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
  return { items, subtotal };
}

function renderProducts(filter = "all") {
  if (!grid) return;
  grid.innerHTML = products
    .filter((p) => filter === "all" || p.category === filter)
    .slice(0, 8)
    .map((p) => `
      <article class="product-card float-card reveal">
        <div class="product-visual"><div class="mock-shirt" style="background:${p.color};color:${p.print}">SH</div></div>
        <div class="product-content">
          <h3 class="product-title">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-foot">
            <span>$${p.price}</span>
            <button class="add shine" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `).join("");
  observeReveals();
}

function saveCart() {
  localStorage.setItem("shapedCart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const wrap = document.querySelector("#cart-items");
  const count = document.querySelector("#cart-count");
  const sumItems = document.querySelector("#summary-items");
  const sumSubtotal = document.querySelector("#summary-subtotal");

  const { items, subtotal } = cartTotals();

  if (count) count.textContent = items;
  if (sumItems) sumItems.textContent = items;
  if (sumSubtotal) sumSubtotal.textContent = `$${subtotal.toFixed(2)}`;

  if (!wrap) return;
  wrap.innerHTML = cart.length
    ? cart.map((i) => `
      <div class="cart-item">
        <div><b>${i.name}</b><div>$${i.price}</div></div>
        <div class="qty">
          <button data-minus="${i.id}">−</button>
          <span>${i.qty}</span>
          <button data-plus="${i.id}">+</button>
        </div>
      </div>
    `).join("")
    : `<p>Your bag is empty.</p>`;
}

function toast(msg) {
  const el = document.querySelector(".toast");
  if (!el) return;
  el.textContent = msg;
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

function toggleQuoteModal(open) {
  const modal = document.querySelector("#quote-modal");
  if (!modal) return;
  modal.classList.toggle("show", open);
  modal.setAttribute("aria-hidden", String(!open));
}

document.addEventListener("click", (e) => {
  const t = e.target;

  if (t.matches(".add")) {
    const p = products.find((x) => x.id == t.dataset.id);
    if (!p) return;
    const found = cart.find((x) => x.id === p.id);
    found ? found.qty++ : cart.push({ ...p, qty: 1 });
    saveCart();
    toast("Added to bag");
  }

  if (t.dataset.filter !== undefined) {
    document.querySelectorAll(".filters button").forEach((b) => b.classList.remove("active"));
    t.classList.add("active");
    renderProducts(t.dataset.filter);
  }

  if (t.dataset.plus) {
    const item = cart.find((x) => x.id == t.dataset.plus);
    if (!item) return;
    item.qty++;
    saveCart();
  }

  if (t.dataset.minus) {
    const item = cart.find((x) => x.id == t.dataset.minus);
    if (!item) return;
    item.qty--;
    cart = cart.filter((x) => x.qty > 0);
    saveCart();
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

document.querySelector("#checkout")?.addEventListener("click", () => {
  if (!cart.length) return toast("Your bag is empty");
  toggleQuoteModal(true);
});

document.querySelector("#quote-close")?.addEventListener("click", () => toggleQuoteModal(false));

document.querySelector("#quote-checkout-form")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.querySelector("#q-name")?.value.trim();
  const email = document.querySelector("#q-email")?.value.trim();
  const company = document.querySelector("#q-company")?.value.trim();

  if (!name || !email) return toast("Please add name and email");

  const { items, subtotal } = cartTotals();
  const bulkDiscount = items >= 10 ? 0.10 : 0;
  const discounted = subtotal * (1 - bulkDiscount);
  const tax = discounted * 0.08;
  const total = discounted + tax;

  const result = document.querySelector("#quote-result");
  if (!result) return;

  result.innerHTML = `
    <p><strong>Quotation for:</strong> ${name}${company ? ` (${company})` : ""}</p>
    <p><strong>Email:</strong> ${email}</p>
    <hr style="border-color:rgba(255,255,255,.16)">
    <p>Items: <strong>${items}</strong></p>
    <p>Subtotal: <strong>$${subtotal.toFixed(2)}</strong></p>
    <p>Bulk Discount (${items >= 10 ? "10%" : "0%"}): <strong>-$${(subtotal * bulkDiscount).toFixed(2)}</strong></p>
    <p>Estimated Tax (8%): <strong>$${tax.toFixed(2)}</strong></p>
    <p style="font-size:18px">Estimated Total: <strong>$${total.toFixed(2)}</strong></p>
  `;
  result.classList.add("show");
});

function initHeroSlideshow() {
  const hero = document.querySelector(".hero-slideshow");
  if (!hero) return;
  const slides = [...hero.querySelectorAll(".hero-slide")];
  const dots = [...hero.querySelectorAll(".hero-dot")];
  const prev = hero.querySelector(".hero-prev");
  const next = hero.querySelector(".hero-next");
  if (!slides.length) return;

  let idx = 0, timer = null, sx = 0, ex = 0;
  const INTERVAL = 4000, SWIPE = 40;

  const go = (i) => {
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle("is-active", n === idx));
    dots.forEach((d, n) => {
      const active = n === idx;
      d.classList.toggle("is-active", active);
      d.setAttribute("aria-selected", String(active));
    });
  };

  const n = () => go(idx + 1);
  const p = () => go(idx - 1);
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const start = () => { stop(); timer = setInterval(n, INTERVAL); };

  next?.addEventListener("click", () => { n(); start(); });
  prev?.addEventListener("click", () => { p(); start(); });
  dots.forEach((d, i) => d.addEventListener("click", () => { go(i); start(); }));

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  hero.addEventListener("touchstart", (e) => { stop(); sx = e.changedTouches[0].clientX; ex = sx; }, { passive: true });
  hero.addEventListener("touchmove", (e) => { ex = e.changedTouches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", (e) => {
    ex = e.changedTouches[0].clientX;
    const dx = ex - sx;
    if (Math.abs(dx) >= SWIPE) dx < 0 ? n() : p();
    start();
  }, { passive: true });

  go(0); start();
}

let observer;
function observeReveals() {
  if (observer) observer.disconnect();
  const items = document.querySelectorAll(".reveal,.stagger");
  observer = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        observer.unobserve(en.target);
      }
    });
  }, { threshold: 0.14 });
  items.forEach((i) => observer.observe(i));
}

renderProducts();
renderCart();
initHeroSlideshow();
observeReveals();
