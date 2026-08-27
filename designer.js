const $ = (id) => document.getElementById(id);

/* controls */
const form = $("designer-form");
const productType = $("product-type");
const viewSide = $("view-side");
const shirtColor = $("shirt-color");
const shirtColorCustom = $("shirt-color-custom");
const printText = $("print-text");
const printColor = $("print-color");
const printColorCustom = $("print-color-custom");
const textSize = $("text-size");
const designUpload = $("design-upload");
const designSize = $("design-size");

const textBold = $("text-bold");
const textItalic = $("text-italic");
const textUpper = $("text-uppercase");
const alignLeft = $("align-left");
const alignCenter = $("align-center");
const alignRight = $("align-right");

const modeMove = $("mode-move");
const modeDraw = $("mode-draw");
const modeErase = $("mode-erase");
const brushColor = $("brush-color");
const brushSize = $("brush-size");
const undoBtn = $("undo-draw");
const redoBtn = $("redo-draw");
const clearBtn = $("clear-drawing");

const saveDraftBtn = $("save-draft");
const loadDraftBtn = $("load-draft");
const downloadBtn = $("download-design");
const resetBtn = $("reset-all");

const previewLabel = $("preview-label");
const mock = $("mock-shirt");
const textLayer = $("shirt-text");
const imgLayer = $("shirt-design-image");
const canvas = $("draw-canvas");
const ctx = canvas.getContext("2d");

/* state per side */
const sides = {
  front: initSide(),
  back: initSide()
};
let side = "front";

function initSide() {
  return {
    text: "SHAPED",
    textColor: "#ffffff",
    textSize: 42,
    bold: true,
    italic: false,
    upper: false,
    align: "center",
    imageSrc: null,
    imageSize: 48,
    imageX: 50,
    imageY: 40,
    drawing: null
  };
}

const ui = {
  mode: "move", // move|draw|erase
  drawingActive: false,
  dragImage: false,
  tilt: { active:false, rx:0, ry:0 }
};

/* undo/redo per side (canvas snapshots) */
const history = {
  front: { undo: [], redo: [] },
  back: { undo: [], redo: [] }
};

function activeSide() { return sides[side]; }
function activeHistory() { return history[side]; }

function setActive(btns, active) {
  btns.forEach(b => b.classList.remove("active"));
  active.classList.add("active");
}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function posPercent(el, clientX, clientY){
  const r=el.getBoundingClientRect();
  return { xPct: ((clientX-r.left)/r.width)*100, yPct: ((clientY-r.top)/r.height)*100, x:clientX-r.left, y:clientY-r.top };
}

/* canvas sizing */
function fitCanvas() {
  const r = mock.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const old = document.createElement("canvas");
  old.width = canvas.width || 1;
  old.height = canvas.height || 1;
  old.getContext("2d").drawImage(canvas,0,0);

  canvas.width = Math.max(1, Math.floor(r.width * ratio));
  canvas.height = Math.max(1, Math.floor(r.height * ratio));
  canvas.style.width = r.width + "px";
  canvas.style.height = r.height + "px";
  ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.drawImage(old,0,0,r.width,r.height);
}

/* serialization of drawing */
function canvasToData() {
  try { return canvas.toDataURL("image/png"); } catch { return null; }
}
function dataToCanvas(data) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(!data) return;
  const img = new Image();
  img.onload = () => {
    const r = mock.getBoundingClientRect();
    ctx.drawImage(img,0,0,r.width,r.height);
  };
  img.src = data;
}
function pushUndo() {
  const h = activeHistory();
  h.undo.push(canvasToData());
  if (h.undo.length > 40) h.undo.shift();
  h.redo = [];
}
function undo() {
  const h = activeHistory();
  if (!h.undo.length) return;
  const current = canvasToData();
  h.redo.push(current);
  const prev = h.undo.pop();
  dataToCanvas(prev);
  activeSide().drawing = prev;
}
function redo() {
  const h = activeHistory();
  if (!h.redo.length) return;
  const current = canvasToData();
  h.undo.push(current);
  const next = h.redo.pop();
  dataToCanvas(next);
  activeSide().drawing = next;
}

/* apply state to preview */
function applyProductType() {
  mock.classList.remove("tshirt","hoodie","tote");
  mock.classList.add(productType.value);
}
function applyProductColor() {
  const c = shirtColorCustom.value || shirtColor.value;
  mock.style.background = c;
}
function applyText() {
  const s = activeSide();
  let t = s.text || "SHAPED";
  if (s.upper) t = t.toUpperCase();
  textLayer.textContent = t;
  textLayer.style.color = s.textColor;
  textLayer.style.fontSize = `${s.textSize}px`;
  textLayer.style.fontWeight = s.bold ? "700" : "500";
  textLayer.style.fontStyle = s.italic ? "italic" : "normal";

  if (s.align === "left") {
    textLayer.style.left = "16%";
    textLayer.style.transform = "translate(0,-50%)";
    textLayer.style.width = "68%";
    textLayer.style.textAlign = "left";
  } else if (s.align === "right") {
    textLayer.style.left = "16%";
    textLayer.style.transform = "translate(0,-50%)";
    textLayer.style.width = "68%";
    textLayer.style.textAlign = "right";
  } else {
    textLayer.style.left = "50%";
    textLayer.style.transform = "translate(-50%,-50%)";
    textLayer.style.width = "80%";
    textLayer.style.textAlign = "center";
  }
}
function applyImage() {
  const s = activeSide();
  if (s.imageSrc) {
    imgLayer.src = s.imageSrc;
    imgLayer.style.display = "block";
  } else {
    imgLayer.style.display = "none";
    imgLayer.removeAttribute("src");
  }
  imgLayer.style.maxWidth = `${s.imageSize}%`;
  imgLayer.style.left = `${s.imageX}%`;
  imgLayer.style.top = `${s.imageY}%`;
}
function applyAll() {
  previewLabel.textContent = `Preview • ${side[0].toUpperCase()+side.slice(1)}`;
  applyProductType();
  applyProductColor();
  applyText();
  applyImage();
  dataToCanvas(activeSide().drawing);
}
function loadSideToControls() {
  const s = activeSide();
  printText.value = s.text;
  printColorCustom.value = s.textColor;
  textSize.value = s.textSize;
  designSize.value = s.imageSize;

  textBold.classList.toggle("active", s.bold);
  textItalic.classList.toggle("active", s.italic);
  textUpper.classList.toggle("active", s.upper);

  [alignLeft,alignCenter,alignRight].forEach(b=>b.classList.remove("active"));
  (s.align==="left"?alignLeft:s.align==="right"?alignRight:alignCenter).classList.add("active");
}

/* side switching */
viewSide.addEventListener("change", () => {
  // persist current canvas into state
  activeSide().drawing = canvasToData();
  side = viewSide.value;
  fitCanvas();
  loadSideToControls();
  applyAll();
});

/* controls bindings */
productType.addEventListener("change", applyProductType);
shirtColor.addEventListener("change", ()=>{ shirtColorCustom.value = shirtColor.value; applyProductColor(); });
shirtColorCustom.addEventListener("input", applyProductColor);

printText.addEventListener("input", ()=>{ activeSide().text = printText.value; applyText(); });
printColor.addEventListener("change", ()=>{ printColorCustom.value = printColor.value; activeSide().textColor = printColor.value; applyText(); });
printColorCustom.addEventListener("input", ()=>{ activeSide().textColor = printColorCustom.value; applyText(); });
textSize.addEventListener("input", ()=>{ activeSide().textSize = Number(textSize.value); applyText(); });

textBold.addEventListener("click", ()=>{ activeSide().bold = !activeSide().bold; textBold.classList.toggle("active", activeSide().bold); applyText(); });
textItalic.addEventListener("click", ()=>{ activeSide().italic = !activeSide().italic; textItalic.classList.toggle("active", activeSide().italic); applyText(); });
textUpper.addEventListener("click", ()=>{ activeSide().upper = !activeSide().upper; textUpper.classList.toggle("active", activeSide().upper); applyText(); });
alignLeft.addEventListener("click", ()=>{ activeSide().align="left"; setActive([alignLeft,alignCenter,alignRight],alignLeft); applyText(); });
alignCenter.addEventListener("click", ()=>{ activeSide().align="center"; setActive([alignLeft,alignCenter,alignRight],alignCenter); applyText(); });
alignRight.addEventListener("click", ()=>{ activeSide().align="right"; setActive([alignLeft,alignCenter,alignRight],alignRight); applyText(); });

designUpload.addEventListener("change", (e)=>{
  const f = e.target.files?.[0];
  if(!f) return;
  if(f.type !== "image/png"){ alert("Please upload PNG only."); designUpload.value=""; return; }
  const fr = new FileReader();
  fr.onload = ev => {
    activeSide().imageSrc = ev.target.result;
    applyImage();
  };
  fr.readAsDataURL(f);
});
designSize.addEventListener("input", ()=>{ activeSide().imageSize = Number(designSize.value); applyImage(); });

/* mode */
modeMove.addEventListener("click", ()=>{ ui.mode="move"; setActive([modeMove,modeDraw,modeErase],modeMove); });
modeDraw.addEventListener("click", ()=>{ ui.mode="draw"; setActive([modeMove,modeDraw,modeErase],modeDraw); });
modeErase.addEventListener("click", ()=>{ ui.mode="erase"; setActive([modeMove,modeDraw,modeErase],modeErase); });

/* drag uploaded image */
imgLayer.addEventListener("mousedown", ()=>{ if(ui.mode==="move" && imgLayer.style.display!=="none") ui.dragImage=true; });
window.addEventListener("mouseup", ()=> ui.dragImage=false);
window.addEventListener("mousemove", (e)=>{
  if(!ui.dragImage || ui.mode!=="move") return;
  const p = posPercent(mock, e.clientX, e.clientY);
  activeSide().imageX = clamp(p.xPct,10,90);
  activeSide().imageY = clamp(p.yPct,10,90);
  applyImage();
});

/* draw */
function drawStart(x,y){
  if(ui.mode==="move") return;
  pushUndo();
  ui.drawingActive = true;
  ctx.beginPath();
  ctx.moveTo(x,y);
}
function drawMove(x,y){
  if(!ui.drawingActive) return;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Number(brushSize.value);
  if(ui.mode==="erase"){
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = brushColor.value;
  }
  ctx.lineTo(x,y);
  ctx.stroke();
}
function drawEnd(){
  if(!ui.drawingActive) return;
  ui.drawingActive = false;
  ctx.closePath();
  activeSide().drawing = canvasToData();
}

canvas.addEventListener("mousedown", (e)=>{
  if(ui.mode==="move") return;
  const p = posPercent(canvas, e.clientX, e.clientY);
  drawStart(p.x, p.y);
});
window.addEventListener("mousemove", (e)=>{
  if(!ui.drawingActive) return;
  const p = posPercent(canvas, e.clientX, e.clientY);
  drawMove(p.x, p.y);
});
window.addEventListener("mouseup", drawEnd);

canvas.addEventListener("touchstart", (e)=>{
  if(ui.mode==="move") return;
  const t=e.touches[0]; const p=posPercent(canvas,t.clientX,t.clientY); drawStart(p.x,p.y);
},{passive:true});
window.addEventListener("touchmove", (e)=>{
  if(!ui.drawingActive) return;
  const t=e.touches[0]; const p=posPercent(canvas,t.clientX,t.clientY); drawMove(p.x,p.y);
},{passive:true});
window.addEventListener("touchend", drawEnd,{passive:true});

/* undo/redo/clear */
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);
clearBtn.addEventListener("click", ()=>{
  pushUndo();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  activeSide().drawing = canvasToData();
});

/* 2.5D tilt */
mock.addEventListener("pointerdown", ()=>{ ui.tilt.active = true; });
window.addEventListener("pointerup", ()=>{ ui.tilt.active = false; mock.style.transform = `rotateX(0deg) rotateY(0deg)`; });
window.addEventListener("pointermove", (e)=>{
  if(!ui.tilt.active) return;
  const r = mock.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;
  const dx = (e.clientX - cx) / (r.width/2);
  const dy = (e.clientY - cy) / (r.height/2);
  const ry = clamp(dx*12,-12,12);
  const rx = clamp(-dy*12,-12,12);
  mock.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
});

/* save/load/reset */
function draftPayload(){
  // save current side canvas
  activeSide().drawing = canvasToData();
  return {
    version: 2,
    productType: productType.value,
    productColor: shirtColorCustom.value || shirtColor.value,
    sides
  };
}
saveDraftBtn.addEventListener("click", ()=>{
  localStorage.setItem("shapedDesignerDraftAdvanced", JSON.stringify(draftPayload()));
  alert("Draft saved.");
});
loadDraftBtn.addEventListener("click", ()=>{
  const raw = localStorage.getItem("shapedDesignerDraftAdvanced");
  if(!raw) return alert("No saved draft found.");
  try{
    const d = JSON.parse(raw);
    if(d.productType) productType.value = d.productType;
    if(d.productColor){ shirtColorCustom.value = d.productColor; shirtColor.value = d.productColor; }
    if(d.sides){
      sides.front = { ...initSide(), ...d.sides.front };
      sides.back  = { ...initSide(), ...d.sides.back };
    }
    side = viewSide.value || "front";
    fitCanvas();
    loadSideToControls();
    applyAll();
  }catch{
    alert("Draft load failed.");
  }
});
resetBtn.addEventListener("click", ()=>{
  sides.front = initSide();
  sides.back = initSide();
  history.front = { undo:[], redo:[] };
  history.back = { undo:[], redo:[] };

  productType.value = "tshirt";
  shirtColor.value = "#111111";
  shirtColorCustom.value = "#111111";
  printColor.value = "#ffffff";
  printColorCustom.value = "#ffffff";
  viewSide.value = "front";
  side = "front";
  fitCanvas();
  loadSideToControls();
  applyAll();
});

/* download png of current side */
downloadBtn.addEventListener("click", ()=>{
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1200;
  exportCanvas.height = 1300;
  const ex = exportCanvas.getContext("2d");

  const type = productType.value;
  const c = shirtColorCustom.value || shirtColor.value;

  // base product
  ex.fillStyle = c;
  if(type==="tote"){
    roundRect(ex,260,180,680,860,24,true,false);
    ex.strokeStyle = c; ex.lineWidth = 28; arcHandle(ex,430,180,110); arcHandle(ex,770,180,110);
  }else if(type==="hoodie"){
    roundRect(ex,240,170,720,900,44,true,false);
    roundRect(ex,130,320,130,230,30,true,false);
    roundRect(ex,940,320,130,230,30,true,false);
    roundRect(ex,350,95,500,190,90,true,false);
  }else{
    roundRect(ex,250,180,700,880,64,true,false);
    roundRect(ex,130,330,130,220,34,true,false);
    roundRect(ex,940,330,130,220,34,true,false);
  }

  // image + drawing + text
  const s = activeSide();
  const drawRest = ()=>{
    // drawing
    ex.drawImage(canvas,250,180,700,880);

    // text
    let txt = s.upper ? (s.text || "SHAPED").toUpperCase() : (s.text || "SHAPED");
    const style = `${s.italic ? "italic " : ""}${s.bold ? "700":"500"} ${Math.round(s.textSize*1.55)}px Arial`;
    ex.font = style;
    ex.fillStyle = s.textColor || "#fff";
    ex.textBaseline = "middle";
    let x=600, align="center";
    if(s.align==="left"){x=360;align="left";}
    if(s.align==="right"){x=840;align="right";}
    ex.textAlign = align;
    ex.fillText(txt, x, 760);

    const a = document.createElement("a");
    a.download = `shaped-${type}-${side}.png`;
    a.href = exportCanvas.toDataURL("image/png");
    a.click();
  };

  if(s.imageSrc){
    const img = new Image();
    img.onload = ()=>{
      const sizePct = (s.imageSize||48)/100;
      const bw=700, bh=880, bx=250, by=180;
      const w = bw * sizePct;
      const h = (img.height/img.width)*w;
      const px = bx + (s.imageX/100)*bw;
      const py = by + (s.imageY/100)*bh;
      ex.drawImage(img, px-w/2, py-h/2, w, h);
      drawRest();
    };
    img.src = s.imageSrc;
  } else {
    drawRest();
  }
});

/* continue to quote */
form.addEventListener("submit", (e)=>{
  e.preventDefault();
  localStorage.setItem("shapedDesignerDraftAdvanced", JSON.stringify(draftPayload()));
  // lightweight summary for quote form
  const summary = {
    productType: productType.value,
    productColor: shirtColorCustom.value || shirtColor.value,
    frontText: sides.front.text,
    backText: sides.back.text,
    hasFrontImage: !!sides.front.imageSrc,
    hasBackImage: !!sides.back.imageSrc
  };
  localStorage.setItem("shapedQuoteDesignSummary", JSON.stringify(summary));
  window.location.href = "index.html#quote-form";
});

/* utils */
function roundRect(ctx, x, y, width, height, radius, fill, stroke){
  let r=radius; if(typeof r==="number") r={tl:r,tr:r,br:r,bl:r}; else r={tl:0,tr:0,br:0,bl:0,...r};
  ctx.beginPath();
  ctx.moveTo(x+r.tl,y); ctx.lineTo(x+width-r.tr,y); ctx.quadraticCurveTo(x+width,y,x+width,y+r.tr);
  ctx.lineTo(x+width,y+height-r.br); ctx.quadraticCurveTo(x+width,y+height,x+width-r.br,y+height);
  ctx.lineTo(x+r.bl,y+height); ctx.quadraticCurveTo(x,y+height,x,y+height-r.bl);
  ctx.lineTo(x,y+r.tl); ctx.quadraticCurveTo(x,y,x+r.tl,y); ctx.closePath();
  if(fill) ctx.fill(); if(stroke) ctx.stroke();
}
function arcHandle(ctx,x,y,r){ ctx.beginPath(); ctx.arc(x,y,r,Math.PI,2*Math.PI); ctx.stroke(); }

/* init */
function init(){
  shirtColorCustom.value = shirtColor.value;
  printColorCustom.value = printColor.value;
  setActive([modeMove,modeDraw,modeErase], modeMove);
  setActive([alignLeft,alignCenter,alignRight], alignCenter);
  fitCanvas();
  applyAll();
  loadSideToControls();
}
window.addEventListener("resize", ()=>{ 
  const keep = canvasToData();
  fitCanvas();
  dataToCanvas(keep);
});
init();
