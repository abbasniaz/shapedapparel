const products=[
{ id:1, name: 'Intent Essential Tee', category: 'tees', price: 28, color: '#111111', print: '#ffffff', desc: 'Premium everyday cotton tee' },
{ id:2, name: 'Statement Tee', category: 'tees', price: 32, color: '#eee9df', print: '#111111', desc: 'Clean oversized streetwear fit' },
{ id:3, name: 'Intent Pullover Hoodie', category: 'hoodies', price: 58, color: '#292929', print: '#c5a572', desc: 'Midweight fleece hoodie' },
{ id:4, name: 'Built Crewneck', category: 'hoodies', price: 52, color: '#866b54', print: '#ffffff', desc: 'Soft premium crewneck' },
{ id:5, name: 'Business Polo', category: 'workwear', price: 42, color: '#17232b', print: '#ffffff', desc: 'Professional branded polo' },
{ id:6, name: 'Team Performance Tee', category: 'workwear', price: 36, color: '#f1f1ed', print: '#111111', desc: 'Lightweight team apparel' },
{ id:7, name: 'Core Logo Tee', category: 'tees', price: 30, color: '#30483e', print: '#ffffff', desc: 'Signature SHAPED logo tee' },
{ id:8, name: 'Custom Order Deposit', category: 'workwear', price: 50, color: '#b89a6a', print: '#111111', desc: 'Start a custom apparel project' },
{ id:9, name: 'Bright Colour Graphics Shirt', category: 'tees', price: 29.99, color: '#ff6b6b', print: '#ffffff', desc: 'Eye-catching bright graphic tee — soft, breathable, and available in S–XL', img: 'assets/bright-graphic-shirt.svg' }
];

let cart = JSON.parse(localStorage.getItem('shapedCart') || '[]');
const grid = document.querySelector('#product-grid');
function renderProducts(filter = 'all') { grid.innerHTML = products.filter(p => filter === 'all' || p.category === filter).map(p => `<article class="product-card"><div class="product-visual" style="--product-color:${p.color};"><img src="${p.img||'assets/Designer (18).png'}" alt="${p.name}"></div><div class="product-body"><h3>${p.name}</h3><p class="product-desc">${p.desc}</p><div class="product-meta"><span class="price">$${p.price}</span><button class="button primary add" data-id="${p.id}" type="button">Add to bag</button></div></div></article>`).join(''); }
function save() { localStorage.setItem('shapedCart', JSON.stringify(cart)); renderCart(); }
function renderCart() { const wrap = document.querySelector('#cart-items'); document.querySelector('#cart-count').textContent = cart.reduce((s, i) => s + i.qty, 0); wrap.innerHTML = cart.length ? cart.map(i => `<div class="cart-row"><div>${i.name} × ${i.qty}</div><div>$${(i.price*i.qty).toFixed(2)}</div></div>`).join('') : '<p>Your bag is empty</p>'; }
function toast(t) { const el = document.querySelector('.toast'); el.textContent = t; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1800); }
function toggleCart(open) { document.querySelector('.cart').classList.toggle('open', open); document.querySelector('.overlay').classList.toggle('show', open); document.querySelector('.cart').setAttribute('aria-hidden', !open); }
document.addEventListener('click', e => { if (e.target.matches('.add')) { const p = products.find(x => x.id == e.target.dataset.id), found = cart.find(x => x.id === p.id); found ? found.qty++ : cart.push({ ...p, qty: 1 }); save(); toast('Added to bag'); } if (e.target.matches('.button.secondary')) { document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' }); } });

document.querySelector('.cart-button').onclick = () => toggleCart(true); document.querySelector('.cart-close').onclick = () => toggleCart(false); document.querySelector('.overlay').onclick = () => toggleCart(false);

// Initial render
renderProducts();
