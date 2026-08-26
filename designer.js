const teeGarments=[{name:'Black',hex:'#111111'},{name:'White',hex:'#f1f1ed'},{name:'Charcoal',hex:'#3a3a3a'},{name:'Navy',hex:'#1f2b3a'},{name:'Olive',hex:'#5c5a45'},{name:'Gold',hex:'#b89a6a'},{name:'Brick',hex:'#6e3b34'}];
const teeFonts=[{name:'Grotesk',family:"'Space Grotesk',sans-serif"},{name:'Sans',family:"'DM Sans',sans-serif"},{name:'Poster',family:"'Anton',sans-serif"},{name:'Marker',family:"'Permanent Marker',cursive"}];
const teeInks=['#111111','#ffffff','#b89a6a','#2f4a3f','#7a2e2e'];
let teeGarment=teeGarments[0];
let teeLayers=[{id:0,type:'text',text:'YOUR TEXT',font:teeFonts[0].family,size:22,color:teeInks[0],x:50,y:35,rotation:0}];
let teeSelectedId=0;
let teeUid=1;
function teeNextY(){return Math.min(80,30+teeLayers.length*18)}
const teePrint=document.querySelector('#teePrint');
const teeShape=document.querySelector('#teeShape');
const teeColorsEl=document.querySelector('#teeColors');
const layerListEl=document.querySelector('#layerList');
const layerSettingsEl=document.querySelector('#layerSettings');
let teeDrag=null;

function teeUpdateLayer(id,patch){teeLayers=teeLayers.map(l=>l.id===id?{...l,...patch}:l);renderTee()}
function teeAddText(){const id=teeUid++;teeLayers=[...teeLayers,{id,type:'text',text:'NEW LINE',font:teeFonts[0].family,size:20,color:teeInks[0],x:50,y:teeNextY(),rotation:0}];teeSelectedId=id;renderTee()}
function teeAddImage(file){const reader=new FileReader();reader.onload=()=>{const id=teeUid++;teeLayers=[...teeLayers,{id,type:'image',src:reader.result,w:60,rotation:0,x:50,y:teeNextY()}];teeSelectedId=id;renderTee()};reader.readAsDataURL(file)}
function teeRemoveLayer(id){teeLayers=teeLayers.filter(l=>l.id!==id);if(teeSelectedId===id)teeSelectedId=null;renderTee()}

function teePointerDown(e,layer){e.stopPropagation();teeSelectedId=layer.id;renderTee();const rect=teePrint.getBoundingClientRect();teeDrag={id:layer.id,startX:e.clientX,startY:e.clientY,origX:layer.x,origY:layer.y,rectW:rect.width,rectH:rect.height};window.addEventListener('pointermove',teePointerMove);window.addEventListener('pointerup',teePointerUp)}
function teePointerMove(e){if(!teeDrag)return;const dx=((e.clientX-teeDrag.startX)/teeDrag.rectW)*100;const dy=((e.clientY-teeDrag.startY)/teeDrag.rectH)*100;let nx=Math.max(0,Math.min(100,teeDrag.origX+dx));let ny=Math.max(0,Math.min(100,teeDrag.origY+dy));teeUpdateLayer(teeDrag.id,{x:nx,y:ny})}
function teePointerUp(){teeDrag=null;window.removeEventListener('pointermove',teePointerMove);window.removeEventListener('pointerup',teePointerUp)}

function renderTee(){
  teeShape.style.setProperty('--tee-color',teeGarment.hex);
  teePrint.innerHTML='';
  teeLayers.forEach(l=>{
    const el=document.createElement('div');
    el.className='tee-layer'+(teeSelectedId===l.id?' selected':'');
    el.style.left=l.x+'%';
    el.style.top=l.y+'%';
    el.style.transform=`translate(-50%,-50%) rotate(${l.rotation}deg)`;
    if(l.type==='text'){
      el.style.font=`700 ${l.size}px ${l.font}`;
      el.style.color=l.color;
      el.textContent=l.text;
    }else{
      const img=document.createElement('img');
      img.src=l.src;
      img.style.width=l.w+'px';
      img.style.height='auto';
      el.appendChild(img);
    }
    el.addEventListener('pointerdown',e=>teePointerDown(e,l));
    teePrint.appendChild(el);
  });

  teeColorsEl.innerHTML='';
  teeGarments.forEach(g=>{
    const b=document.createElement('button');
    b.title=g.name;
    b.style.background=g.hex;
    b.className=teeGarment.name===g.name?'active':'';
    b.onclick=()=>{teeGarment=g;renderTee()};
    teeColorsEl.appendChild(b);
  });

  layerListEl.innerHTML='';
  if(teeLayers.length===0){layerListEl.innerHTML='<div class="empty">Nothing on the shirt yet.</div>'}
  teeLayers.forEach(l=>{
    const row=document.createElement('div');
    row.className='layer-row'+(teeSelectedId===l.id?' selected':'');
    const label=document.createElement('span');
    label.textContent=l.type==='text'?(l.text.slice(0,20)||'(empty)'):'Image';
    row.appendChild(label);
    const del=document.createElement('button');
    del.textContent='×';
    del.onclick=(e)=>{e.stopPropagation();teeRemoveLayer(l.id)};
    row.appendChild(del);
    row.onclick=()=>{teeSelectedId=l.id;renderTee()};
    layerListEl.appendChild(row);
  });

  renderTeeSettings();
}

function renderTeeSettings(){
  const selected=teeLayers.find(l=>l.id===teeSelectedId);
  layerSettingsEl.innerHTML='';
  if(!selected)return;

  if(selected.type==='text'){
    const label=document.createElement('div');
    label.className='designer-label';
    label.textContent='TEXT';
    layerSettingsEl.appendChild(label);

    const textarea=document.createElement('textarea');
    textarea.value=selected.text;
    textarea.oninput=e=>teeUpdateLayer(selected.id,{text:e.target.value});
    layerSettingsEl.appendChild(textarea);

    const fontLabel=document.createElement('div');
    fontLabel.className='designer-label';
    fontLabel.textContent='FONT';
    layerSettingsEl.appendChild(fontLabel);
    const fontRow=document.createElement('div');
    fontRow.className='font-row';
    teeFonts.forEach(f=>{
      const b=document.createElement('button');
      b.textContent=f.name;
      b.style.fontFamily=f.family;
      b.className=selected.font===f.family?'active':'';
      b.onclick=()=>teeUpdateLayer(selected.id,{font:f.family});
      fontRow.appendChild(b);
    });
    layerSettingsEl.appendChild(fontRow);

    const sizeLabel=document.createElement('div');
    sizeLabel.className='designer-label';
    sizeLabel.textContent='SIZE '+selected.size+'px';
    layerSettingsEl.appendChild(sizeLabel);
    const sizeInput=document.createElement('input');
    sizeInput.type='range';sizeInput.min=12;sizeInput.max=48;sizeInput.value=selected.size;sizeInput.style.width='100%';
    sizeInput.oninput=e=>teeUpdateLayer(selected.id,{size:+e.target.value});
    layerSettingsEl.appendChild(sizeInput);

    const inkLabel=document.createElement('div');
    inkLabel.className='designer-label';
    inkLabel.textContent='COLOR';
    layerSettingsEl.appendChild(inkLabel);
    const inkRow=document.createElement('div');
    inkRow.className='ink-row';
    teeInks.forEach(c=>{
      const b=document.createElement('button');
      b.style.background=c;
      b.className=selected.color===c?'active':'';
      b.onclick=()=>teeUpdateLayer(selected.id,{color:c});
      inkRow.appendChild(b);
    });
    layerSettingsEl.appendChild(inkRow);
  }else{
    const sizeLabel=document.createElement('div');
    sizeLabel.className='designer-label';
    sizeLabel.textContent='SIZE';
    layerSettingsEl.appendChild(sizeLabel);
    const sizeInput=document.createElement('input');
    sizeInput.type='range';sizeInput.min=30;sizeInput.max=140;sizeInput.value=selected.w;sizeInput.style.width='100%';
    sizeInput.oninput=e=>teeUpdateLayer(selected.id,{w:+e.target.value});
    layerSettingsEl.appendChild(sizeInput);
  }

  const rotLabel=document.createElement('div');
  rotLabel.className='designer-label';
  rotLabel.textContent='ROTATION '+selected.rotation+'°';
  layerSettingsEl.appendChild(rotLabel);
  const rotInput=document.createElement('input');
  rotInput.type='range';rotInput.min=-45;rotInput.max=45;rotInput.value=selected.rotation;rotInput.style.width='100%';
  rotInput.oninput=e=>teeUpdateLayer(selected.id,{rotation:+e.target.value});
  layerSettingsEl.appendChild(rotInput);

  const removeBtn=document.createElement('button');
  removeBtn.className='remove-layer';
  removeBtn.textContent='Remove layer';
  removeBtn.onclick=()=>teeRemoveLayer(selected.id);
  layerSettingsEl.appendChild(removeBtn);
}

function teeDesignSummary(){
  const texts=teeLayers.filter(l=>l.type==='text').map(l=>`"${l.text}"`);
  const images=teeLayers.filter(l=>l.type==='image').length;
  const parts=[];
  parts.push(`Garment color: ${teeGarment.name}.`);
  if(texts.length)parts.push(`Text: ${texts.join(', ')}.`);
  if(images)parts.push(`${images} custom image${images>1?'s':''} placed on the design.`);
  return 'Custom Design Studio selection — '+parts.join(' ');
}

document.querySelector('#addTextBtn').onclick=teeAddText;
document.querySelector('#addImageBtn').onclick=()=>document.querySelector('#imageInput').click();
document.querySelector('#imageInput').onchange=e=>{e.target.files[0]&&teeAddImage(e.target.files[0]);e.target.value=''};
document.querySelector('#teeCanvas').addEventListener('pointerdown',()=>{teeSelectedId=null;renderTee()});
document.querySelector('#useDesignBtn').onclick=()=>{
  const details=document.querySelector('.quote-form textarea[name="details"]');
  const summary=teeDesignSummary();
  details.value=details.value?summary+'\n\n'+details.value:summary;
  location.hash='custom';
  toast('Design added to your quote request');
};

renderTee();
