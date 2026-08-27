const shirtColorEl = document.getElementById("shirt-color");
const printTextEl = document.getElementById("print-text");
const printColorEl = document.getElementById("print-color");
const uploadInput = document.getElementById("design-upload");

const mockShirt = document.getElementById("mock-shirt");
const shirtText = document.getElementById("shirt-text");
const shirtDesignImage = document.getElementById("shirt-design-image");
const form = document.getElementById("designer-form");

function applyPreview() {
  if (mockShirt && shirtColorEl) mockShirt.style.background = shirtColorEl.value;
  if (shirtText && printTextEl) shirtText.textContent = printTextEl.value.trim() || "SHAPED";
  if (shirtText && printColorEl) shirtText.style.color = printColorEl.value;
}

shirtColorEl?.addEventListener("change", applyPreview);
printTextEl?.addEventListener("input", applyPreview);
printColorEl?.addEventListener("change", applyPreview);

uploadInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.type !== "image/png") {
    alert("Please upload a PNG file only.");
    uploadInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    shirtDesignImage.src = ev.target.result;
    shirtDesignImage.style.display = "block";
  };
  reader.readAsDataURL(file);
});

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    shirtColor: shirtColorEl?.value || "#111111",
    printText: (printTextEl?.value || "SHAPED").trim(),
    printColor: printColorEl?.value || "#ffffff",
    uploadedDesign: shirtDesignImage?.src || null
  };

  localStorage.setItem("shapedDesignerDraft", JSON.stringify(payload));
  window.location.href = "index.html#quote-form";
});

applyPreview();
