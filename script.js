/* =========================================================
   SHAPED main script.js (safe consolidated)
   - Product rendering + filters
   - Cart + totals
   - Cart drawer + overlay
   - Quote modal + estimate
   - Hero slideshow
   - Reveal animations
   - Designer -> Quote prefill (full details + draft ID)
========================================================= */

(() => {
  "use strict";

  /* ------------------ data ------------------ */
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

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("shapedCart") || "[]"); } catch { cart = []; }

  /* ------------------ helpers ------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function toast(msg) {
    const el = $(".toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1800);
  }

  function cartTotals() {
    const items = cart.reduce((sum, i) => sum + (i.qty || 0), 0);
    const subtotal = cart.reduce((sum, i) => sum + (i.qty || 0) * (i.price || 0), 0);
    return { items, subtotal };
  }

  function saveCart() {
    localStorage.setItem("shapedCart", JSON.stringify(cart));
    renderCart();
  }

  /* ------------------ products ------------------ */
  function renderProducts(filter = "all") {
    const grid = $("#product-grid");
    if (!grid) return;

    const list = products
      .filter((p) => filter === "all" || p.category === filter)
      .slice(0, 8);

    grid.innerHTML = list.map((p) => `
      <article class="product-card float-card reveal">
        <div class="product-visual">
          <div class="mock-shirt" style="background:${p.color};color:${p.print}">SH</div>
        </div>
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

  /* ------------------ cart ------------------ */
  function renderCart() {
    const wrap = $("#cart-items");
    const count = $("#cart-count");
    const sumItems = $("#summary-items");
    const sumSubtotal = $("#summary-subtotal");

    const { items, subtotal } = cartTotals();

    if (count) count.textContent = String(items);
    if (sumItems) sumItems.textContent = String(items);
    if (sumSubtotal) sumSubtotal.textContent = `$${subtotal.toFixed(2)}`;

    if (!wrap) return;
    wrap.innerHTML = cart.length ? cart.map((i) => `
      <div class="cart-item">
        <div><b>${i.name}</b><div>$${i.price}</div></div>
        <div class="qty">
          <button data-minus="${i.id}">−</button>
          <span>${i.qty}</span>
          <button data-plus="${i.id}">+</button>
        </div>
      </div>
    `).join("") : `<p>Your bag is empty.</p>`;
  }

  function toggleCart(open) {
    const cartEl = $(".cart");
    const overlay = $(".overlay");
    if (!cartEl || !overlay) return;
    cartEl.classList.toggle("open", !!open);
    overlay.classList.toggle("show", !!open);
    cartEl.setAttribute("aria-hidden", String(!open));
  }

  /* ------------------ quote modal ------------------ */
  function toggleQuoteModal(open) {
    const modal = $("#quote-modal");
    if (!modal) return;
    modal.classList.toggle("show", !!open);
    modal.setAttribute("aria-hidden", String(!open));
  }

  function bindQuoteModal() {
    $("#checkout")?.addEventListener("click", () => {
      if (!cart.length) return toast("Your bag is empty");
      toggleQuoteModal(true);
    });

    $("#quote-close")?.addEventListener("click", () => toggleQuoteModal(false));

    $("#quote-checkout-form")?.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = $("#q-name")?.value.trim();
      const email = $("#q-email")?.value.trim();
      const company = $("#q-company")?.value.trim();

      if (!name || !email) return toast("Please add name and email");

      const { items, subtotal } = cartTotals();
      const bulkDiscount = items >= 10 ? 0.10 : 0;
      const discounted = subtotal * (1 - bulkDiscount);
      const tax = discounted * 0.08;
      const total = discounted + tax;

      const result = $("#quote-result");
      if (!result) return;

      result.innerHTML = `
        <p><strong>Quotation for:</strong> ${name}${company ? ` (${company})` : ""}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr style="border-color:rgba(95,109,130,.24)">
        <p>Items: <strong>${items}</strong></p>
        <p>Subtotal: <strong>$${subtotal.toFixed(2)}</strong></p>
        <p>Bulk Discount (${items >= 10 ? "10%" : "0%"}): <strong>-$${(subtotal * bulkDiscount).toFixed(2)}</strong></p>
        <p>Estimated Tax (8%): <strong>$${tax.toFixed(2)}</strong></p>
        <p style="font-size:18px">Estimated Total: <strong>$${total.toFixed(2)}</strong></p>
      `;
      result.classList.add("show");
    });
  }

  /* ------------------ hero slideshow ------------------ */
  function initHeroSlideshow() {
    const hero = $(".hero-slideshow");
    if (!hero) return;

    const slides = $$(".hero-slide", hero);
    const dots = $$(".hero-dot", hero);
    const prev = $(".hero-prev", hero);
    const next = $(".hero-next", hero);
    if (!slides.length) return;

    let idx = 0;
    let timer = null;
    let sx = 0, ex = 0;
    const INTERVAL = 4000;
    const SWIPE = 40;

    const go = (i) => {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle("is-active", n === idx));
      dots.forEach((d, n) => {
        const active = n === idx;
        d.classList.toggle("is-active", active);
        d.setAttribute("aria-selected", String(active));
      });
    };

    const toNext = () => go(idx + 1);
    const toPrev = () => go(idx - 1);
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => { stop(); timer = setInterval(toNext, INTERVAL); };

    next?.addEventListener("click", () => { toNext(); start(); });
    prev?.addEventListener("click", () => { toPrev(); start(); });

    dots.forEach((d, i) => d.addEventListener("click", () => { go(i); start(); }));

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    hero.addEventListener("touchstart", (e) => {
      stop();
      sx = e.changedTouches[0].clientX;
      ex = sx;
    }, { passive: true });

    hero.addEventListener("touchmove", (e) => {
      ex = e.changedTouches[0].clientX;
    }, { passive: true });

    hero.addEventListener("touchend", (e) => {
      ex = e.changedTouches[0].clientX;
      const dx = ex - sx;
      if (Math.abs(dx) >= SWIPE) dx < 0 ? toNext() : toPrev();
      start();
    }, { passive: true });

    go(0);
    start();
  }

  /* ------------------ reveals ------------------ */
  let observer;
  function observeReveals() {
    if (observer) observer.disconnect();

    const items = $$(".reveal,.stagger");
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

  /* ------------------ events ------------------ */
  function bindGlobalClicks() {
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
        $$(".filters button").forEach((b) => b.classList.remove("active"));
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

    $(".cart-button")?.addEventListener("click", () => toggleCart(true));
    $(".cart-close")?.addEventListener("click", () => toggleCart(false));
    $(".overlay")?.addEventListener("click", () => toggleCart(false));

    $(".menu-toggle")?.addEventListener("click", () => {
      const nav = $(".nav");
      if (!nav) return;
      nav.classList.toggle("open");
      $(".menu-toggle")?.setAttribute("aria-expanded", String(nav.classList.contains("open")));
    });
  }

  /* ------------------ designer prefill ------------------ */
  function prefillQuoteFromAdvancedDesigner() {
    const quoteFormSection = $("#quote-form");
    if (!quoteFormSection) return;

    const textarea = $("textarea", quoteFormSection);
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

    const now = new Date();
    const submittedAt = now.toLocaleString();

    const front = draft?.sides?.front || {};
    const back = draft?.sides?.back || {};

    const lines = [
      "Design Studio Submission",
      "------------------------",
      `Draft ID: ${draftId}`,
      `Submitted At: ${submittedAt}`,
      "",
      `Product Type: ${summary?.productType || draft?.productType || "-"}`,
      `Product Color: ${summary?.productColor || draft?.productColor || "-"}`,
      "",
      "Front Design:",
      `- Text: ${front.text || summary?.frontText || "-"}`,
      `- Text Color: ${front.textColor || "-"}`,
      `- Text Size: ${front.textSize || "-"}`,
      `- Bold: ${typeof front.bold === "boolean" ? (front.bold ? "Yes" : "No") : "-"}`,
      `- Italic: ${typeof front.italic === "boolean" ? (front.italic ? "Yes" : "No") : "-"}`,
      `- Uppercase: ${typeof front.upper === "boolean" ? (front.upper ? "Yes" : "No") : "-"}`,
      `- Align: ${front.align || "-"}`,
      `- Image Uploaded: ${summary?.hasFrontImage || front.imageSrc ? "Yes" : "No"}`,
      `- Image Size: ${front.imageSize || "-"}`,
      `- Image Position: X ${front.imageX ?? "-"} / Y ${front.imageY ?? "-"}`,
      "",
      "Back Design:",
      `- Text: ${back.text || summary?.backText || "-"}`,
      `- Text Color: ${back.textColor || "-"}`,
      `- Text Size: ${back.textSize || "-"}`,
      `- Bold: ${typeof back.bold === "boolean" ? (back.bold ? "Yes" : "No") : "-"}`,
      `- Italic: ${typeof back.italic === "boolean" ? (back.italic ? "Yes" : "No") : "-"}`,
      `- Uppercase: ${typeof back.upper === "boolean" ? (back.upper ? "Yes" : "No") : "-"}`,
      `- Align: ${back.align || "-"}`,
      `- Image Uploaded: ${summary?.hasBackImage || back.imageSrc ? "Yes" : "No"}`,
      `- Image Size: ${back.imageSize || "-"}`,
      `- Image Position: X ${back.imageX ?? "-"} / Y ${back.imageY ?? "-"}`,
      "",
      "Notes:",
      "- Customer created this from SHAPED Design Studio",
      "- Ask for quantity, size breakdown, and delivery date",
      ""
    ];

    textarea.value = lines.join("\n") + (textarea.value ? `\n${textarea.value}` : "");

    localStorage.setItem("shapedQuoteSubmissionMeta", JSON.stringify({
      draftId,
      submittedAtISO: now.toISOString(),
      productType: summary?.productType || draft?.productType || null,
      productColor: summary?.productColor || draft?.productColor || null
    }));
  }

  /* ------------------ init ------------------ */
  function init() {
    renderProducts();
    renderCart();
    bindGlobalClicks();
    bindQuoteModal();
    initHeroSlideshow();
    observeReveals();
    prefillQuoteFromAdvancedDesigner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* ===== SHAPED: Designer -> Quote textarea autofill (safe) ===== */
(function () {
  try {
    const quoteSection = document.querySelector("#quote-form");
    if (!quoteSection) return;

    const textarea = quoteSection.querySelector("textarea");
    if (!textarea) return;

    const summaryRaw = localStorage.getItem("shapedQuoteDesignSummary");
    const draftRaw = localStorage.getItem("shapedDesignerDraftAdvanced");
    if (!summaryRaw && !draftRaw) return;

    // prevent duplicate insertion
    if (textarea.value.includes("Design Studio Submission")) return;

    let summary = null;
    let draft = null;
    try { summary = summaryRaw ? JSON.parse(summaryRaw) : null; } catch (e) {}
    try { draft = draftRaw ? JSON.parse(draftRaw) : null; } catch (e) {}

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

    // optional meta for future use
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
