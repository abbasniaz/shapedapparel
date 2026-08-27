/* Add this at bottom of your existing script.js (do not remove your current code) */
(function prefillQuoteFromDesigner(){
  const formSection = document.querySelector("#quote-form");
  if(!formSection) return;

  const summaryRaw = localStorage.getItem("shapedQuoteDesignSummary");
  if(!summaryRaw) return;

  try{
    const s = JSON.parse(summaryRaw);
    const textarea = formSection.querySelector("textarea");
    if(!textarea) return;

    const lines = [
      "Design Studio Summary:",
      `- Product: ${s.productType || "-"}`,
      `- Product Color: ${s.productColor || "-"}`,
      `- Front Text: ${s.frontText || "-"}`,
      `- Back Text: ${s.backText || "-"}`,
      `- Front Image: ${s.hasFrontImage ? "Yes" : "No"}`,
      `- Back Image: ${s.hasBackImage ? "Yes" : "No"}`,
      ""
    ].join("\n");

    if(!textarea.value.includes("Design Studio Summary:")){
      textarea.value = lines + (textarea.value || "");
    }
  }catch(e){}
})();
/* ===== Designer -> Quote Prefill (full details + draft ID) ===== */
(function prefillQuoteFromAdvancedDesigner() {
  const quoteFormSection = document.querySelector("#quote-form");
  if (!quoteFormSection) return;

  const textarea = quoteFormSection.querySelector("textarea");
  if (!textarea) return;

  const summaryRaw = localStorage.getItem("shapedQuoteDesignSummary");
  const draftRaw = localStorage.getItem("shapedDesignerDraftAdvanced");
  if (!summaryRaw && !draftRaw) return;

  // avoid duplicate injection
  if (textarea.value.includes("Design Studio Submission")) return;

  let summary = null;
  let draft = null;
  try { summary = summaryRaw ? JSON.parse(summaryRaw) : null; } catch(e) {}
  try { draft = draftRaw ? JSON.parse(draftRaw) : null; } catch(e) {}

  // generate a reusable draft ID (stable for same saved draft payload)
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

  // optional: store a lightweight payload for backend/email usage later
  localStorage.setItem("shapedQuoteSubmissionMeta", JSON.stringify({
    draftId,
    submittedAtISO: now.toISOString(),
    productType: summary?.productType || draft?.productType || null,
    productColor: summary?.productColor || draft?.productColor || null
  }));
})();
