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
