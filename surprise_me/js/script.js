const boxes = [
    { id: 'hp-1', theme: 'Harry Potter', title: 'HP Box — Classic', price: 450, img: 'images/gift1.jpg', description: 'Кружка, значки, листівки. Класичний набір.'},
    { id: 'hp-2', theme: 'Harry Potter', title: 'HP Box — Premium', price: 680, img: 'images/gift1b.jpg', description: 'Преміум-версія: додаткові сувеніри та упаковка.'},

    { id: 'st-1', theme: 'Stranger Things', title: 'Stranger Box — Retro', price: 520, img: 'images/gift2.jpg', description: 'Футболка, наклейки, фігурка.'},
    { id: 'st-2', theme: 'Stranger Things', title: 'Stranger Box — Collector', price: 760, img: 'images/gift2b.jpg', description: 'Колекційна коробка з ексклюзивними предметами.'},
    { id: 'st-3', theme: 'Stranger Things', title: 'Stranger Box — Sweet Pack', price: 490, img: 'images/gift2c.jpg', description: 'Солодкий набір в стилі серіалу.'},

    { id: 'fr-1', theme: 'Friends', title: 'Friends Box — Coffee', price: 610, img: 'images/gift3.jpg', description: 'Кружка, постери, брелоки.'},
    { id: 'fr-2', theme: 'Friends', title: 'Friends Box — Fan Pack', price: 720, img: 'images/gift3b.jpg', description: 'Розширений фан-набір.'},

    { id: 'mv-1', theme: 'Marvel', title: 'Marvel Box — Hero', price: 700, img: 'images/gift4.jpg', description: 'Наклейки, фігурка, плакат.'},
    { id: 'mv-2', theme: 'Marvel', title: 'Marvel Box — Legends', price: 950, img: 'images/gift4b.jpg', description: 'Ексклюзивні предмети для фанатів.'}
];
function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

function saveCart(cart){
    localStorage.setItem('sm_cart', JSON.stringify(cart));
}
function loadCart(){
    try {
        const raw = localStorage.getItem('sm_cart');
        return raw ? JSON.parse(raw) : [];
    } catch(e){ return []; }
}

function addToCart(itemId, qty = 1){
    const cart = loadCart();
    const box = boxes.find(b => b.id === itemId);
    if (!box) return;
    const existing = cart.find(c => c.id === itemId);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ id: box.id, title: box.title, price: box.price, qty: qty, img: box.img, theme: box.theme });
    }
    saveCart(cart);
    showCartMessage(`${box.title} додано до корзини (${qty} шт.)`);
    if (typeof renderCartPage === 'function') renderCartPage();
}

let cartMsgTimer = null;
function showCartMessage(text){
    const el = document.getElementById('cart-message') || createGlobalCartMessage();
    el.textContent = text;
    el.classList.add('show');
    if (cartMsgTimer) clearTimeout(cartMsgTimer);
    cartMsgTimer = setTimeout(()=> el.classList.remove('show'), 3000);
}
function createGlobalCartMessage(){
    const el = document.createElement('div');
    el.id = 'cart-message';
    el.className = 'cart-message';
    document.body.appendChild(el);
    return el;
}

function renderCatalog(theme = null){
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = theme ? boxes.filter(b => b.theme === theme) : boxes;

    filtered.forEach(box => {
        const card = document.createElement('div');
        card.className = 'product-card linkable';
        card.innerHTML = `
            <img src="${box.img}" alt="${box.title}" loading="lazy">
            <div style="padding:12px">
                <h3>${box.title}</h3>
                <p class="price">${box.price} грн</p>
                <p style="font-size:13px; color:#666; min-height:36px">${box.description}</p>
                <div class="card-actions">
                    <button class="btn details-btn" data-id="${box.id}">Детальніше</button>
                    <button class="btn add-btn" data-id="${box.id}">Додати до корзини</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    $all('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e)=>{
            const id = e.currentTarget.dataset.id;
            localStorage.setItem('selectedBoxId', id);
            window.location.href = 'product_detail.html';
        });
    });
    $all('.add-btn').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
            const id = e.currentTarget.dataset.id;
            addToCart(id, 1);
        });
    });
}

function renderProductDetail(){
    const productImg = $('#product-img');
    const productTitle = $('#product-title');
    const productDescription = $('#product-description');
    const productPrice = $('#product-price');
    const quantityDisplay = $('#quantity');
    const increaseBtn = $('#increase');
    const decreaseBtn = $('#decrease');
    const addToCartBtn = $('#add-to-cart');

    if (!productTitle) return;
    const selectedId = localStorage.getItem('selectedBoxId');
    const box = boxes.find(b => b.id === selectedId) || boxes[0];

    productImg.src = box.img;
    productImg.alt = box.title;
    productTitle.textContent = box.title;
    productDescription.textContent = box.description;
    productPrice.textContent = box.price + ' грн';

    let qty = 1;
    quantityDisplay.textContent = qty;

    increaseBtn.addEventListener('click', ()=>{
        qty++;
        quantityDisplay.textContent = qty;
    });
    decreaseBtn.addEventListener('click', ()=>{
        if (qty > 1) qty--;
        quantityDisplay.textContent = qty;
    });
    addToCartBtn.addEventListener('click', ()=>{
        addToCart(box.id, qty);
    });
}

function renderCartPage(){
    const container = document.querySelector('.cart-items');
    const totalElem = document.getElementById('total-price');
    if (!container || !totalElem) return;

    const cart = loadCart();
    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = `<p>Ваша корзина порожня.</p>`;
        totalElem.textContent = '0';
        return;
    }

    let sum = 0;
    cart.forEach(item => {
        sum += item.price * item.qty;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.title}">
            <div style="flex:1">
                <h3>${item.title}</h3>
                <p>Ціна: ${item.price} грн</p>
                <div class="quantity-control">
                    <button class="cart-decrease" data-id="${item.id}">-</button>
                    <span class="quantity-display">${item.qty}</span>
                    <button class="cart-increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
                <button class="remove-btn" data-id="${item.id}">Видалити</button>
                <div><strong>${item.price * item.qty} грн</strong></div>
            </div>
        `;
        container.appendChild(div);
    });

    totalElem.textContent = String(sum);

    $all('.cart-increase').forEach(b=> b.addEventListener('click', (e)=>{
        const id = e.currentTarget.dataset.id;
        modifyCartQty(id, +1);
    }));
    $all('.cart-decrease').forEach(b=> b.addEventListener('click', (e)=>{
        const id = e.currentTarget.dataset.id;
        modifyCartQty(id, -1);
    }));
    $all('.remove-btn').forEach(b=> b.addEventListener('click', (e)=>{
        const id = e.currentTarget.dataset.id;
        removeFromCart(id);
    }));
}

function modifyCartQty(id, delta){
    const cart = loadCart();
    const item = cart.find(i=> i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        const idx = cart.indexOf(item);
        cart.splice(idx,1);
    }
    saveCart(cart);
    renderCartPage();
}

function removeFromCart(id){
    let cart = loadCart();
    cart = cart.filter(i=> i.id !== id);
    saveCart(cart);
    renderCartPage();
}

function wireNav(){
    const burger = document.querySelector('.burger');
    const navUl = document.querySelector('nav ul');
    if (burger && navUl){
        burger.addEventListener('click', ()=>{
            navUl.classList.toggle('active');
        });
    }
    const catalogLinks = Array.from(document.querySelectorAll('a[href*="catalog.html"], a[href="#"]')).filter(a => a.textContent.includes('Каталог'));
    catalogLinks.forEach(a=>{
        a.addEventListener('click', (e)=>{
            if (a.getAttribute('href') === '#' || a.getAttribute('href').includes('catalog.html') === false){
                e.preventDefault();
                window.location.href = 'catalog.html';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', ()=>{
    wireNav();
    if (document.getElementById('catalog-grid')){
        const params = new URLSearchParams(window.location.search);
        const themeParam = params.get('theme');
        const mapName = themeParam ? themeParam.replace(/\+/g,' ') : null;
        renderCatalog(mapName);
    }
    if (document.getElementById('product-title')){
        renderProductDetail();
    }
    if (document.getElementById('total-price')){
        renderCartPage();
    }

    $all('.details-btn').forEach(b => b.addEventListener('click', (e)=> {
        // handled in renderCatalog, but in case index has similar buttons
        const id = e.currentTarget.dataset.id;
        if (id) {
            localStorage.setItem('selectedBoxId', id);
            window.location.href = 'product_detail.html';
        }
    }));

    $all('[data-add-id]').forEach(el=>{
        el.addEventListener('click', ()=> {
            addToCart(el.dataset.addId, Number(el.dataset.addQty || 1));
        });
    });
});
