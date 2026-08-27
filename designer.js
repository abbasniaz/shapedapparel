const $ = (id) => document.getElementById(id);

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
const saveBtn = $("save-draft");
const loadBtn = $("load-draft");
const downloadBtn = $("download-design");
const resetBtn = $("reset-all");

const previewLabel = $("preview-label");
const mock = $("mock-shirt");
const textLayer = $("shirt-text");
const imgLayer = $("shirt-design-image");
const canvas = $("draw-canvas");
const ctx = canvas.getContext("2d");

const makeSide = () => ({
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
});

let sides = { front: makeSide(), back: makeSide() };
let side = "front";

const state = {
  mode: "move",
  drawing: false,
  dragImage: false,
  tiltDown: false
};

const history = {
  front: { undo: [], redo: [] },
  back: { undo: [], redo: [] }
};

function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
function activeSide(){ return sides[side]; }
function activeHistory(){ return history[side]; }

function setActive(group, active){
  group.forEach(x => x.classList.remove("active"));
  active.classList.add("active");
}

function syncCanvasSize() {
  const r = mock.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const backup = document.createElement("canvas");
  backup.width = canvas.width || 1;
  backup.height = canvas.height || 1;
  backup.getContext("2d").drawImage(canvas, 0, 0);

  canvas.width = Math.max(1, Math.floor(r.width * ratio));
  canvas.height = Math.max(1, Math.floor(r.height * ratio));
  canvas.style.width = r.width + "px";
  canvas.style.height = r.height + "px";
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  ctx.drawImage(backup, 0, 0, r.width, r.height);
}

function canvasToData(){ try { return canvas.toDataURL("image/png"); } catch { return null; } }
function dataToCanvas(data){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(!data) return;
  const img = new Image();
  img.onload = () => {
    const r = mock.getBoundingClientRect();
    ctx.drawImage(img,0,0,r.width,r.height);
  };
  img.src = data;
}

function pushUndo(){
  const h = activeHistory();
  h.undo.push(canvasToData());
  if(h.undo.length > 50) h.undo.shift();
  h.redo = [];
}
function undo(){
  const h = activeHistory();
  if(!h.undo.length) return;
  const current = canvasToData();
  h.redo.push(current);
  const prev = h.undo.pop();
  dataToCanvas(prev);
  activeSide().drawing = prev;
}
function redo(){
  const h = activeHistory();
  if(!h.redo.length) return;
  const current = canvasToData();
  h.undo.push(current);
  const next = h.redo.pop();
  dataToCanvas(next);
  activeSide().drawing = next;
}

/* apply */
function applyType(){
  mock.classList.remove("tshirt","hoodie","tote");
  mock.classList.add(productType.value);
}
function applyProductColor(){
  mock.style.background = shirtColorCustom.value || shirtColor.value;
}
function applyText(){
  const s = activeSide();
  let t = s.text || "SHAPED";
  if(s.upper) t = t.toUpperCase();
  textLayer.textContent = t;
  textLayer.style.color = s.textColor;
  textLayer.style.fontSize = `${s.textSize}px`;
  textLayer.style.fontWeight = s.bold ? "700" : "500";
  textLayer.style.fontStyle = s.italic ? "italic" : "normal";

  if(s.align === "left"){
    textLayer.style.left = "16%";
    textLayer.style.transform = "translate(0,-50%)";
    textLayer.style.width = "68%";
    textLayer.style.textAlign = "left";
  } else if(s.align === "right"){
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
function applyImage(){
  const s = activeSide();
  if(s.imageSrc){
    imgLayer.src = s.imageSrc;
    imgLayer.style.display = "block";
  }else{
    imgLayer.style.display = "none";
    imgLayer.removeAttribute("src");
  }
  imgLayer.style.maxWidth = `${s.imageSize}%`;
  imgLayer.style.left = `${s.imageX}%`;
  imgLayer.style.top = `${s.imageY}%`;
}
function applyAll(){
  previewLabel.textContent = `Preview • ${side[0].toUpperCase()+side.slice(1)}`;
  applyType();
  applyProductColor();
  applyText();
  applyImage();
  dataToCanvas(activeSide().drawing);
}

function loadSideToControls(){
  const s = activeSide();
  printText.value = s.text;
  printColorCustom.value = s.textColor;
  textSize.value = s.textSize;
  designSize.value = s.imageSize;

  textBold.classList.toggle("active", s.bold);
  textItalic.classList.toggle("active", s.italic);
  textUpper.classList.toggle("active", s.upper);
  [alignLeft,alignCenter,alignRight].forEach(b => b.classList.remove("active"));
  (s.align === "left" ? alignLeft : s.align === "right" ? alignRight : alignCenter).classList.add("active");
}

/* side switch */
viewSide.addEventListener("change", ()=>{
  activeSide().drawing = canvasToData();
  side = viewSide.value;
  syncCanvasSize();
  loadSideToControls();
  applyAll();
});

/* controls */
productType.addEventListener("change", applyType);
shirtColor.addEventListener("change", ()=>{ shirtColorCustom.value = shirtColor.value; applyProductColor(); });
shirtColorCustom.addEventListener("input", applyProductColor);

printText.addEventListener("input", ()=>{ activeSide().text = printText.value; applyText(); });
printColor.addEventListener("change", ()=>{ printColorCustom.value = printColor.value; activeSide().textColor = printColor.value; applyText(); });
printColorCustom.addEventListener("input", ()=>{ activeSide().textColor = printColorCustom.value; applyText(); });

textSize.addEventListener("input", ()=>{ activeSide().textSize = Number(textSize.value); applyText(); });
designSize.addEventListener("input", ()=>{ activeSide().imageSize = Number(designSize.value); applyImage(); });

textBold.addEventListener("click", ()=>{ activeSide().bold = !activeSide().bold; textBold.classList.toggle("active", activeSide().bold); applyText(); });
textItalic.addEventListener("click", ()=>{ activeSide().italic = !activeSide().italic; textItalic.classList.toggle("active", activeSide().italic); applyText(); });
textUpper.addEventListener("click", ()=>{ activeSide().upper = !activeSide().upper; textUpper.classList.toggle("active", activeSide().upper); applyText(); });

alignLeft.addEventListener("click", ()=>{ activeSide().align = "left"; setActive([alignLeft,alignCenter,alignRight],alignLeft); applyText(); });
alignCenter.addEventListener("click", ()=>{ activeSide().align = "center"; setActive([alignLeft,alignCenter,alignRight],alignCenter); applyText(); });
alignRight.addEventListener("click", ()=>{ activeSide().align = "right"; setActive([alignLeft,alignCenter,alignRight],alignRight); applyText(); });

/* modes */
modeMove.addEventListener("click", ()=>{ state.mode = "move"; setActive([modeMove,modeDraw,modeErase],modeMove); });
modeDraw.addEventListener("click", ()=>{ state.mode = "draw"; setActive([modeMove,modeDraw,modeErase],modeDraw); });
modeErase.addEventListener("click", ()=>{ state.mode = "erase"; setActive([modeMove,modeDraw,modeErase],modeErase); });

/* upload */
designUpload.addEventListener("change", (e)=>{
  const f = e.target.files?.[0];
  if(!f) return;
  if(f.type !== "image/png"){ alert("Please upload PNG only."); designUpload.value = ""; return; }
  const fr = new FileReader();
  fr.onload = ev => {
    activeSide().imageSrc = ev.target.result;
    applyImage();
  };
  fr.readAsDataURL(f);
});

/* image drag */
function posPct(el, clientX, clientY){
  const r = el.getBoundingClientRect();
  return { x: ((clientX-r.left)/r.width)*100, y: ((clientY-r.top)/r.height)*100 };
}
imgLayer.addEventListener("mousedown", ()=>{ if(state.mode==="move" && imgLayer.style.display!=="none") state.dragImage = true; });
window.addEventListener("mouseup", ()=> state.dragImage = false);
window.addEventListener("mousemove", (e)=>{
  if(!state.dragImage || state.mode!=="move") return;
  const p = posPct(mock, e.clientX, e.clientY);
  activeSide().imageX = clamp(p.x,10,90);
  activeSide().imageY = clamp(p.y,10,90);
  applyImage();
});

/* draw */
function startDraw(x,y){
  if(state.mode==="move") return;
  pushUndo();
  state.drawing = true;
  ctx.beginPath();
  ctx.moveTo(x,y);
}
function moveDraw(x,y){
  if(!state.drawing) return;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Number(brushSize.value);
  if(state.mode==="erase"){
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  }else{
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = brushColor.value;
  }
  ctx.lineTo(x,y);
  ctx.stroke();
}
function endDraw(){
  if(!state.drawing) return;
  state.drawing = false;
  ctx.closePath();
  activeSide().drawing = canvasToData();
}
function canvasPoint(e){
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX-r.left, y: e.clientY-r.top };
}
canvas.addEventListener("mousedown", (e)=>{
  if(state.mode==="move") return;
  const p = canvasPoint(e);
  startDraw(p.x,p.y);
});
window.addEventListener("mousemove", (e)=>{
  if(!state.drawing) return;
  const p = canvasPoint(e);
  moveDraw(p.x,p.y);
});
window.addEventListener("mouseup", endDraw);

/* undo actions */
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);
clearBtn.addEventListener("click", ()=>{
  pushUndo();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  activeSide().drawing = canvasToData();
});

/* 3D tilt */
mock.addEventListener("pointerdown", ()=> state.tiltDown = true);
window.addEventListener("pointerup", ()=>{
  state.tiltDown = false;
  mock.style.transform = "rotateX(0deg) rotateY(0deg)";
});
window.addEventListener("pointermove", (e)=>{
  if(!state.tiltDown) return;
  const r = mock.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;
  const dx = (e.clientX-cx)/(r.width/2);
  const dy = (e.clientY-cy)/(r.height/2);
  const ry = clamp(dx*12,-12,12);
  const rx = clamp(-dy*12,-12,12);
  mock.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
});

/* save/load/reset/download */
function getDraft(){
  activeSide().drawing = canvasToData();
  return {
    version:3,
    productType: productType.value,
    productColor: shirtColorCustom.value || shirtColor.value,
    sides
  };
}
saveBtn.addEventListener("click", ()=>{
  localStorage.setItem("shapedDesignerDraftAdvanced", JSON.stringify(getDraft()));
  alert("Draft saved.");
});
loadBtn.addEventListener("click", ()=>{
  const raw = localStorage.getItem("shapedDesignerDraftAdvanced");
  if(!raw){ alert("No saved draft found."); return; }
  try{
    const d = JSON.parse(raw);
    productType.value = d.productType || "tshirt";
    if(d.productColor){ shirtColor.value = d.productColor; shirtColorCustom.value = d.productColor; }
    sides = {
      front: { ...makeSide(), ...(d.sides?.front || {}) },
      back: { ...makeSide(), ...(d.sides?.back || {}) }
    };
    side = viewSide.value || "front";
    syncCanvasSize();
    loadSideToControls();
    applyAll();
  }catch{
    alert("Draft could not be loaded.");
  }
});
resetBtn.addEventListener("click", ()=>{
  sides = { front: makeSide(), back: makeSide() };
  history.front = { undo:[], redo:[] };
  history.back = { undo:[], redo:[] };

  productType.value = "tshirt";
  viewSide.value = "front";
  side = "front";
  shirtColor.value = "#111111";
  shirtColorCustom.value = "#111111";
  printColor.value = "#ffffff";
  printColorCustom.value = "#ffffff";
  designUpload.value = "";

  syncCanvasSize();
  loadSideToControls();
  applyAll();
});

downloadBtn.addEventListener("click", ()=>{
  const out = document.createElement("canvas");
  out.width = 1200; out.height = 1300;
  const ex = out.getContext("2d");

  const type = productType.value;
  const base = shirtColorCustom.value || shirtColor.value;
  ex.fillStyle = base;

  if(type==="tote"){
    roundRect(ex,260,180,680,860,24,true,false);
    ex.strokeStyle = base; ex.lineWidth = 28;
    arc(ex,430,180,110); arc(ex,770,180,110);
  }else if(type==="hoodie"){
    roundRect(ex,240,170,720,900,44,true,false);
    roundRect(ex,130,320,130,230,30,true,false);
    roundRect(ex,940,320,130,230,30,true,false);
  }else{
    roundRect(ex,250,180,700,880,64,true,false);
    roundRect(ex,130,330,130,220,34,true,false);
    roundRect(ex,940,330,130,220,34,true,false);
  }

  const s = activeSide();
  const drawRest = ()=>{
    ex.drawImage(canvas,250,180,700,880);
    let txt = s.upper ? (s.text || "SHAPED").toUpperCase() : (s.text || "SHAPED");
    ex.fillStyle = s.textColor;
    ex.font = `${s.italic ? "italic " : ""}${s.bold ? "700":"500"} ${Math.round(s.textSize*1.55)}px Arial`;
    ex.textBaseline = "middle";
    if(s.align==="left"){ ex.textAlign="left"; ex.fillText(txt,360,760); }
    else if(s.align==="right"){ ex.textAlign="right"; ex.fillText(txt,840,760); }
    else { ex.textAlign="center"; ex.fillText(txt,600,760); }

    const a = document.createElement("a");
    a.download = `shaped-${type}-${side}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  };

  if(s.imageSrc){
    const im = new Image();
    im.onload = ()=>{
      const bw=700,bh=880,bx=250,by=180;
      const w = bw * (s.imageSize/100);
      const h = (im.height/im.width)*w;
      const px = bx + (s.imageX/100)*bw;
      const py = by + (s.imageY/100)*bh;
      ex.drawImage(im,px-w/2,py-h/2,w,h);
      drawRest();
    };
    im.src = s.imageSrc;
  }else{
    drawRest();
  }
});

/* submit to quote */
form.addEventListener("submit", (e)=>{
  e.preventDefault();
  localStorage.setItem("shapedDesignerDraftAdvanced", JSON.stringify(getDraft()));
  localStorage.setItem("shapedQuoteDesignSummary", JSON.stringify({
    productType: productType.value,
    productColor: shirtColorCustom.value || shirtColor.value,
    frontText: sides.front.text,
    backText: sides.back.text,
    hasFrontImage: !!sides.front.imageSrc,
    hasBackImage: !!sides.back.imageSrc
  }));
  window.location.href = "index.html#quote-form";
});

/* helpers */
function roundRect(ctx, x, y, w, h, r, fill, stroke){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
  if(fill) ctx.fill(); if(stroke) ctx.stroke();
}
function arc(ctx,x,y,r){ ctx.beginPath(); ctx.arc(x,y,r,Math.PI,2*Math.PI); ctx.stroke(); }

/* init */
function init(){
  shirtColorCustom.value = shirtColor.value;
  printColorCustom.value = printColor.value;
  setActive([modeMove,modeDraw,modeErase], modeMove);
  setActive([alignLeft,alignCenter,alignRight], alignCenter);
  syncCanvasSize();
  loadSideToControls();
  applyAll();
}
window.addEventListener("resize", ()=>{
  const backup = canvasToData();
  syncCanvasSize();
  dataToCanvas(backup);
});
init();
