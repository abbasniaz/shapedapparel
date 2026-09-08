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
const CART_KEEP_KEY = "shapedCartKeepV1";
const QUOTES_KEY = "shapedQuotesV1";
const LAST_QUOTE_KEY = "shapedLastQuoteV1";

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

  $("#clear-cart")?.addEventListener("click", () => {
    if (!cart.length) return;
    cart = [];
    saveCart();
    toast("Bag cleared");
  });

  const keepToggle = $("#cart-keep-toggle");
  if (keepToggle) {
    keepToggle.checked = localStorage.getItem(CART_KEEP_KEY) === "1";
    updateCartKeepNote(keepToggle.checked);
    keepToggle.addEventListener("change", () => {
      if (keepToggle.checked) {
        localStorage.setItem(CART_KEEP_KEY, "1");
        saveCart();
        toast("Bag will be kept on this device");
      } else {
        localStorage.removeItem(CART_KEEP_KEY);
        localStorage.removeItem(CART_KEY);
        toast("Bag will clear when you leave");
      }
      updateCartKeepNote(keepToggle.checked);
    });
  }

  $("#checkout")?.addEventListener("click", openQuoteModal);
  $("#payment-generate-quote")?.addEventListener("click", openQuoteModal);
  $("#quote-close")?.addEventListener("click", () => {
    $("#quote-modal")?.setAttribute("aria-hidden", "true");
  });

  $("#quote-checkout-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    generateQuote();
  });

  $("#quote-result")?.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.matches(".quote-print-btn")) printQuote();
    if (t.matches(".quote-new-btn")) resetQuoteForm();
  });

  $("#product-grid")?.addEventListener("click", onGridClick);
  $("#cart-items")?.addEventListener("click", onCartClick);
}

function renderProducts() {
  const grid = $("#product-grid");
  if (!grid) return;

  const visible = activeFilter === "all"
    ? products
    : products.filter((p) => p.category === activeFilter);

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

  revealGridItemsNow();
}

function onGridClick(e) {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.matches(".add")) handleAddToCart(t);
}

function onCartClick(e) {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.matches(".qty-plus")) handleQtyPlus(t);
  if (t.matches(".qty-minus")) handleQtyMinus(t);
  if (t.matches(".remove-item")) handleRemoveItem(t);
}

function handleAddToCart(buttonEl) {
  const p = products.find((x) => x.id == buttonEl.dataset.id);
  if (!p) return;

  let selectedSize = null;

  if (SIZED_CATEGORIES.has(p.category)) {
    const sizeEl = document.querySelector(`.size-select[data-size-for="${p.id}"]`);
    selectedSize = sizeEl?.value || "M";
  }

  const found = cart.find((x) => x.id === p.id && (x.size || null) === (selectedSize || null));

  if (found) {
    found.qty++;
  } else {
    cart.push({ ...p, size: selectedSize, qty: 1 });
  }

  saveCart();
  toast(`Added to bag${selectedSize ? ` (${selectedSize})` : ""}`);
}

function handleQtyPlus(btn) {
  const idx = Number(btn.dataset.i);
  if (!Number.isNaN(idx) && cart[idx]) {
    cart[idx].qty++;
    saveCart();
  }
}
function handleQtyMinus(btn) {
  const idx = Number(btn.dataset.i);
  if (!Number.isNaN(idx) && cart[idx]) {
    cart[idx].qty--;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart();
  }
}
function handleRemoveItem(btn) {
  const idx = Number(btn.dataset.i);
  if (!Number.isNaN(idx)) {
    cart.splice(idx, 1);
    saveCart();
  }
}

function loadCart() {
  const keep = localStorage.getItem(CART_KEEP_KEY) === "1";
  if (!keep) {
    localStorage.removeItem(CART_KEY);
    cart = [];
    renderCart();
    return;
  }

  try {
    const raw = localStorage.getItem(CART_KEY);
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch {
    cart = [];
  }
  renderCart();
}

function saveCart() {
  const keep = localStorage.getItem(CART_KEEP_KEY) === "1";
  if (keep) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  renderCart();
}

function updateCartKeepNote(isKept) {
  const note = $("#cart-keep-note");
  if (!note) return;
  note.textContent = isKept
    ? "Your bag is saved on this device and will still be here next time you visit."
    : "Your bag clears automatically when you leave — turn this on to keep items for next time.";
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

  if (!cart.length) {
    itemsWrap.innerHTML = `<p class="empty">Your bag is empty.</p>`;
    return;
  }

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
  return cart
    .map(i => `• ${i.name}${i.size ? ` (Size ${i.size})` : ""} x${i.qty} — $${(i.price * i.qty).toFixed(2)}`)
    .join("\n");
}

function openQuoteModal() {
  $("#quote-modal")?.setAttribute("aria-hidden", "false");
  resetQuoteForm();
}

function generateQuoteReference() {
  const stamp = new Date();
  const datePart = [
    stamp.getFullYear(),
    String(stamp.getMonth() + 1).padStart(2, "0"),
    String(stamp.getDate()).padStart(2, "0")
  ].join("");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SHAPED-${datePart}-${randomPart}`;
}

function generateQuote() {
  const name = $("#q-name")?.value?.trim() || "Customer";
  const email = $("#q-email")?.value?.trim() || "-";
  const company = $("#q-company")?.value?.trim() || "";
  const customerEmail = $("#q-customer-email")?.value?.trim() || "";
  const notes = $("#q-notes")?.value?.trim() || "";

  const items = cart.map((i) => ({
    name: i.name,
    size: i.size || "",
    qty: i.qty,
    price: i.price,
    lineTotal: +(i.qty * i.price).toFixed(2)
  }));
  const subtotal = +items.reduce((a, b) => a + b.lineTotal, 0).toFixed(2);

  const quote = {
    ref: generateQuoteReference(),
    createdAtISO: new Date().toISOString(),
    name,
    email,
    company,
    customerEmail,
    notes,
    items,
    subtotal
  };

  saveQuote(quote);
  renderQuoteResult(quote);
  populatePrintDoc(quote);
  submitQuoteToFormspree(quote);
}

function generateQuoteLink(quote) {
  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Quote ${escapeHtml(quote.ref)}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:24px;color:#111827}
    h1{margin:0 0 8px}
    .muted{color:#6b7280}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{border:1px solid #d1d5db;padding:8px;text-align:left}
    th{background:#f3f4f6}
  </style>
</head>
<body>
  <h1>SHAPED Quote</h1>
  <p class="muted">Reference: ${escapeHtml(quote.ref)}<br/>Date: ${escapeHtml(new Date(quote.createdAtISO).toLocaleString())}</p>
  <p><b>Name:</b> ${escapeHtml(quote.name)}<br/>
     <b>Email:</b> ${escapeHtml(quote.email)}<br/>
     <b>Company:</b> ${escapeHtml(quote.company || "-")}</p>
  <table>
    <thead>
      <tr>
        <th>Item</th><th>Size</th><th>Qty</th><th>Unit</th><th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${quote.items.map(i => `
        <tr>
          <td>${escapeHtml(i.name)}</td>
          <td>${escapeHtml(i.size || "-")}</td>
          <td>${i.qty}</td>
          <td>$${i.price.toFixed(2)}</td>
          <td>$${i.lineTotal.toFixed(2)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <p><b>Subtotal:</b> $${quote.subtotal.toFixed(2)}</p>
  ${quote.notes ? `<p><b>Notes:</b> ${escapeHtml(quote.notes)}</p>` : ""}
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

function submitQuoteToFormspree(quote) {
  const form = document.getElementById("formspree-quote-submit");
  if (!form) {
    toast("Quote generated, but Formspree form is missing");
    return;
  }

  const setVal = (name, value) => {
    const input = form.querySelector(`[name="${name}"]`);
    if (input) input.value = value;
  };

  setVal("name", quote.name);
  setVal("email", quote.email);
  setVal("customerEmail", quote.customerEmail || "");
  setVal("company", quote.company || "");
  setVal("quoteReference", quote.ref);
  setVal("quoteSubtotal", `$${quote.subtotal.toFixed(2)}`);
  setVal("quoteItems", cartSummaryText());
  setVal("quoteNotes", quote.notes || "-");
  setVal("quoteLink", generateQuoteLink(quote));

  fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" }
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Formspree returned ${res.status}`);
      toast("Quote sent to Formspree");
    })
    .catch((err) => {
      console.warn(err);
      toast("Quote generated, but Formspree send failed");
    });
}

function saveQuote(quote) {
  try {
    const raw = localStorage.getItem(QUOTES_KEY);
    const all = raw ? JSON.parse(raw) : [];
    (Array.isArray(all) ? all : []).push(quote);
    localStorage.setItem(QUOTES_KEY, JSON.stringify(Array.isArray(all) ? all : [quote]));
  } catch {}
  try {
    localStorage.setItem(LAST_QUOTE_KEY, JSON.stringify(quote));
  } catch {}
}

function loadLastQuote() {
  try {
    const raw = localStorage.getItem(LAST_QUOTE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function renderQuoteResult(quote, isReopened = false) {
  const result = $("#quote-result");
  if (!result) return;

  const quoteLink = generateQuoteLink(quote);

  const itemsHtml = quote.items.length
    ? quote.items
        .map((i) => `• ${escapeHtml(i.name)}${i.size ? ` (Size ${escapeHtml(i.size)})` : ""} x${i.qty} — $${i.lineTotal.toFixed(2)}`)
        .join("<br/>")
    : "No items";

  result.dataset.rendered = "true";
  result.innerHTML = `
    <p class="quote-ref-badge">Reference #: <strong>${escapeHtml(quote.ref)}</strong></p>
    <p><strong>${isReopened ? "Your last quotation" : "Quotation ready"} ✅</strong></p>
    <p><b>Name:</b> ${escapeHtml(quote.name)}<br/>
       <b>Email:</b> ${escapeHtml(quote.email)}<br/>
       <b>Company:</b> ${escapeHtml(quote.company || "-")}</p>
    <p><b>Items:</b><br/>${itemsHtml}</p>
    <p><b>Subtotal:</b> $${quote.subtotal.toFixed(2)}</p>
    ${quote.notes ? `<p><b>Notes:</b> ${escapeHtml(quote.notes)}</p>` : ""}
    <p><a class="button secondary" href="${quoteLink}" target="_blank" rel="noopener">Open Quote Link</a></p>
    <div class="quote-result-actions">
      <button class="button primary quote-print-btn" type="button">Download / Print Quote (PDF)</button>
      <button class="button secondary quote-new-btn" type="button">Start New Quote</button>
    </div>
  `;

  populatePrintDoc(quote);
}

function resetQuoteForm() {
  const result = $("#quote-result");
  if (result) {
    result.innerHTML = "";
    result.removeAttribute("data-rendered");
  }
  $("#quote-checkout-form")?.reset();
  const customerEmail = $("#q-customer-email");
  if (customerEmail) customerEmail.value = "";
}

function populatePrintDoc(quote) {
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText("qp-ref", quote.ref);
  setText("qp-date", new Date(quote.createdAtISO).toLocaleString());
  setText("qp-name", quote.name);
  setText("qp-email", quote.email);
  setText("qp-company", quote.company || "");
  setText("qp-notes", quote.notes || "-");
  setText("qp-subtotal", `$${quote.subtotal.toFixed(2)}`);

  const rows = document.getElementById("qp-items");
  if (rows) {
    rows.innerHTML = quote.items.length
      ? quote.items
          .map((i) => `
        <tr>
          <td>${escapeHtml(i.name)}</td>
          <td>${escapeHtml(i.size || "-")}</td>
          <td>${i.qty}</td>
          <td>$${i.price.toFixed(2)}</td>
          <td>$${i.lineTotal.toFixed(2)}</td>
        </tr>`)
          .join("")
      : `<tr><td colspan="5">No items</td></tr>`;
  }
}

function printQuote() {
  const cleanup = () => {
    document.body.classList.remove("quote-print-active");
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup, { once: true });
  document.body.classList.add("quote-print-active");
  window.print();
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

  const stop = () => timer && clearInterval(timer);
  const play = () => {
    stop();
    timer = setInterval(() => go(i + 1), 4000);
  };

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
  return String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

(function () {
  try {
    const quoteSection = document.querySelector("#quote-form");
    if (!quoteSection) return;

    const textarea = quoteSection.querySelector("textarea");
    if (!textarea) return;

    const summaryRaw = localStorage.getItem("shapedQuoteDesignSummary");
    const draftRaw = localStorage.getItem("shapedDesignerDraftAdvanced");
    if (!summaryRaw && !draftRaw) return;

    if (textarea.value.includes("Design Studio Submission")) return;

    let summary = null;
    let draft = null;
    try { summary = summaryRaw ? JSON.parse(summaryRaw) : null; } catch {}
    try { draft = draftRaw ? JSON.parse(draftRaw) : null; } catch {}

    let draftId = localStorage.getItem("shapedDesignerDraftId");
    if (!draftId) {
      const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
      draftId = `SHAPED-${Date.now().toString().slice(-6)}-${rand}`;
      localStorage.setItem("shapedDesignerDraftId", draftId);
    }

    const front = draft?.sides?.front || {};
    const back = draft?.sides?.back || {};
    const createdAt = new Date().toLocaleString();

    const lines = [
      "Design Studio Submission",
      "------------------------",
      `Draft ID: ${draftId}`,
      `Created At: ${createdAt}`,
      "",
      `Product Type: ${summary?.productType || draft?.productType || "-"}`,
      `Product Color: ${summary?.productColor || draft?.productColor || "-"}`,
      "",
      "Front Side:",
      `- Text: ${front.text || summary?.frontText || "-"}`,
      `- Text Color: ${front.textColor || "-"}`,
      `- Text Size: ${front.textSize || "-"}`,
      `- Bold: ${typeof front.bold === "boolean" ? (front.bold ? "Yes" : "No") : "-"}`,
      `- Italic: ${typeof front.italic === "boolean" ? (front.italic ? "Yes" : "No") : "-"}`,
      `- Uppercase: ${typeof front.upper === "boolean" ? (front.upper ? "Yes" : "No") : "-"}`,
      `- Align: ${front.align || "-"}`,
      `- Image Uploaded: ${summary?.hasFrontImage || front.imageSrc ? "Yes" : "No"}`,
      "",
      "Back Side:",
      `- Text: ${back.text || summary?.backText || "-"}`,
      `- Text Color: ${back.textColor || "-"}`,
      `- Text Size: ${back.textSize || "-"}`,
      `- Bold: ${typeof back.bold === "boolean" ? (back.bold ? "Yes" : "No") : "-"}`,
      `- Italic: ${typeof back.italic === "boolean" ? (back.italic ? "Yes" : "No") : "-"}`,
      `- Uppercase: ${typeof back.upper === "boolean" ? (back.upper ? "Yes" : "No") : "-"}`,
      `- Align: ${back.align || "-"}`,
      `- Image Uploaded: ${summary?.hasBackImage || back.imageSrc ? "Yes" : "No"}`,
      "",
      "Order Notes:",
      "- Please include quantity and size breakdown.",
      "- Mention required delivery date.",
      ""
    ];

    textarea.value = lines.join("\n") + (textarea.value ? `\n${textarea.value}` : "");

    localStorage.setItem("shapedQuoteSubmissionMeta", JSON.stringify({
      draftId,
      createdAtISO: new Date().toISOString(),
      productType: summary?.productType || draft?.productType || null,
      productColor: summary?.productColor || draft?.productColor || null
    }));
  } catch (err) {
    console.warn("Designer quote prefill skipped:", err);
  }
})();

function revealGridItemsNow() {
  const grid = $("#product-grid");
  if (!grid) return;
  $$(".product-card", grid).forEach((el) => el.classList.add("in"));
}
