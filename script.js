const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const products = [
  { id: 1, name: "Intent Essential Tee", category: "tees", price: 28, desc: "Premium everyday cotton tee", color: "#111111" },
  { id: 2, name: "Statement Tee", category: "tees", price: 32, desc: "Clean oversized streetwear fit", color: "#ece6da" },
  { id: 3, name: "Intent Pullover Hoodie", category: "hoodies", price: 58, desc: "Midweight fleece hoodie", color: "#2e2e2e" },
  { id: 4, name: "Built Crewneck", category: "workwear", price: 52, desc: "Soft premium crewneck", color: "#8b735c" },
  { id: 5, name: "Studio Oversized Tee", category: "tees", price: 35, desc: "Relaxed drape with heavy cotton", color: "#1d2b36" },
  { id: 6, name: "Core Zip Hoodie", category: "hoodies", price: 64, desc: "Structured zip hoodie", color: "#385f4f" },
  { id: 7, name: "Utility Work Shirt", category: "workwear", price: 46, desc: "Durable twill work shirt", color: "#b99d6b" },
  { id: 8, name: "Corporate Polo", category: "workwear", price: 42, desc: "Smart fit branded polo", color: "#e5e7eb" }
];

const SIZED_CATEGORIES = new Set(["tees", "hoodies"]);
const AVAILABLE_SIZES = ["S", "M", "L", "XL"];

let activeFilter = "all";
let cart = [];
const CART_KEY = "shapedCartV1";

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  renderProducts();
  bindGlobalEvents();
  initReveal();
  initHeroSlideshow();
});

function bindGlobalEvents() {
  const menuBtn = $(".menu-toggle");
  const nav = $(".nav");
  menuBtn?.addEventListener("click", () => {
    nav?.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", nav?.classList.contains("open") ? "true" : "false");
  });

  $$(".filters button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".filters button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderProducts();
    });
  });

  $(".cart-button")?.addEventListener("click", openCart);
  $(".cart-close")?.addEventListener("click", closeCart);
  $(".overlay")?.addEventListener("click", closeCart);

  $("#checkout")?.addEventListener("click", () => {
    $("#quote-modal")?.setAttribute("aria-hidden", "false");
  });

  $("#quote-close")?.addEventListener("click", () => {
    $("#quote-modal")?.setAttribute("aria-hidden", "true");
  });

  $("#quote-checkout-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#q-name")?.value?.trim() || "Customer";
    const email = $("#q-email")?.value?.trim() || "-";
    const company = $("#q-company")?.value?.trim() || "-";
    const result = $("#quote-result");
    if (result) {
      result.innerHTML = `
        <p><strong>Quote request ready ✅</strong></p>
        <p><b>Name:</b> ${escapeHtml(name)}<br/>
           <b>Email:</b> ${escapeHtml(email)}<br/>
           <b>Company:</b> ${escapeHtml(company)}</p>
        <p><b>Items:</b><br/>${escapeHtml(cartSummaryText()).replace(/\n/g, "<br/>")}</p>
      `;
    }
  });

  $("#product-grid")?.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    if (t.matches(".add")) {
      const p = products.find((x) => x.id == t.dataset.id);
      if (!p) return;

      let selectedSize = null;
      if (SIZED_CATEGORIES.has(p.category)) {
        const sizeEl = document.querySelector(`.size-select[data-size-for="${p.id}"]`);
        selectedSize = sizeEl?.value || "M";
      }

      const found = cart.find((x) => x.id === p.id && (x.size || null) === (selectedSize || null));
      if (found) found.qty++;
      else cart.push({ ...p, size: selectedSize, qty: 1 });

      saveCart();
      toast(`Added to bag${selectedSize ? ` (${selectedSize})` : ""}`);
    }

    if (t.matches(".qty-plus")) {
      const idx = Number(t.dataset.i);
      if (!Number.isNaN(idx) && cart[idx]) {
        cart[idx].qty++;
        saveCart();
      }
    }

    if (t.matches(".qty-minus")) {
      const idx = Number(t.dataset.i);
      if (!Number.isNaN(idx) && cart[idx]) {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
        saveCart();
      }
    }

    if (t.matches(".remove-item")) {
      const idx = Number(t.dataset.i);
      if (!Number.isNaN(idx)) {
        cart.splice(idx, 1);
        saveCart();
      }
    }
  });
}

function renderProducts() {
  const grid = $("#product-grid");
  if (!grid) return;

  const visible = activeFilter === "all" ? products : products.filter((p) => p.category === activeFilter);

  grid.innerHTML = visible.map((p) => `
    <article class="product-card float-card">
      <div class="product-image" style="--pc:${p.color}">
        <div class="mini-shirt"></div>
        <span>SH</span>
      </div>
      <div class="product-body">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.desc)}</p>
        <div class="product-foot">
          <span>$${p.price}</span>
          <div style="display:flex;gap:8px;align-items:center">
            ${
              SIZED_CATEGORIES.has(p.category)
                ? `<select class="size-select" data-size-for="${p.id}" aria-label="Select size for ${escapeHtml(p.name)}">
                    ${AVAILABLE_SIZES.map(s => `<option value="${s}" ${s === "M" ? "selected" : ""}>${s}</option>`).join("")}
                  </select>`
                : ``
            }
            <button class="add shine" data-id="${p.id}" type="button">Add to Cart</button>
          </div>
        </div>
      </div>
    </article>
  `).join("");
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch { cart = []; }
  renderCart();
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}
function renderCart() {
  const itemsWrap = $("#cart-items");
  const countEl = $("#cart-count");
  const totalItemsEl = $("#summary-items");
  const subtotalEl = $("#summary-subtotal");

  const totalItems = cart.reduce((a, b) => a + (b.qty || 0), 0);
  const subtotal = cart.reduce((a, b) => a + (b.qty || 0) * (b.price || 0), 0);

  if (countEl) countEl.textContent = String(totalItems);
  if (totalItemsEl) totalItemsEl.textContent = String(totalItems);
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

  if (!itemsWrap) return;
  if (!cart.length) { itemsWrap.innerHTML = `<p class="empty">Your bag is empty.</p>`; return; }

  itemsWrap.innerHTML = cart.map((i, idx) => `
    <div class="cart-item">
      <div>
        <b>${escapeHtml(i.name)}</b>
        <div>$${i.price}${i.size ? ` • Size: ${escapeHtml(i.size)}` : ""}</div>
      </div>
      <div class="qty">
        <button class="qty-minus" data-i="${idx}" aria-label="Decrease quantity" type="button">−</button>
        <span>${i.qty}</span>
        <button class="qty-plus" data-i="${idx}" aria-label="Increase quantity" type="button">+</button>
      </div>
      <button class="remove-item" data-i="${idx}" aria-label="Remove item" type="button">×</button>
    </div>
  `).join("");
}

function cartSummaryText() {
  if (!cart.length) return "No items";
  return cart.map(i => `• ${i.name}${i.size ? ` (Size ${i.size})` : ""} x${i.qty} — $${(i.price * i.qty).toFixed(2)}`).join("\n");
}

function openCart() {
  $(".cart")?.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
}
function closeCart() {
  $(".cart")?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
}

function initHeroSlideshow() {
  const slides = $$(".hero-slide");
  const dots = $$(".hero-dot");
  const prev = $(".hero-prev");
  const next = $(".hero-next");
  if (!slides.length) return;

  let i = 0;
  let timer = null;

  const go = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
    dots.forEach((d, idx) => {
      d.classList.toggle("is-active", idx === i);
      d.setAttribute("aria-selected", idx === i ? "true" : "false");
    });
  };

  const play = () => { stop(); timer = setInterval(() => go(i + 1), 4000); };
  const stop = () => timer && clearInterval(timer);

  prev?.addEventListener("click", () => { go(i - 1); play(); });
  next?.addEventListener("click", () => { go(i + 1); play(); });
  dots.forEach((d, idx) => d.addEventListener("click", () => { go(idx); play(); }));

  go(0);
  play();
}

function initReveal() {
  const items = $$(".reveal, .stagger > *");
  if (!("IntersectionObserver" in window) || !items.length) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

function toast(msg) {
  const t = $(".toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.remove("show"), 1600);
}
function escapeHtml(v = "") {
  return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
