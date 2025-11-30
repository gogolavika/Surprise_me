const boxes = [
    { id: 'hp-1', theme: 'Harry Potter', title: 'HP Box — Classic', price: 450, img: 'images/gift1.jpg', description: 'Класичний набір: кружка, значки, листівки.' },
    { id: 'hp-2', theme: 'Harry Potter', title: 'HP Box — Premium', price: 680, img: 'images/gift1b.jpg', description: 'Преміум-набір з ексклюзивною упаковкою.' },

    { id: 'st-1', theme: 'Stranger Things', title: 'Stranger Box — Retro', price: 520, img: 'images/gift2.jpg', description: 'Футболка, наклейки, невеличка фігурка.' },
    { id: 'st-2', theme: 'Stranger Things', title: 'Stranger Box — Collector', price: 760, img: 'images/gift2b.jpg', description: 'Краще для колекціонерів.' },
    { id: 'st-3', theme: 'Stranger Things', title: 'Stranger Box — Sweet Pack', price: 490, img: 'images/gift2c.jpg', description: 'Солодощі + тематичні сувеніри.' },

    { id: 'fr-1', theme: 'Friends', title: 'Friends Box — Coffee', price: 610, img: 'images/gift3.jpg', description: 'Кружка, постери, брелоки.' },
    { id: 'fr-2', theme: 'Friends', title: 'Friends Box — Fan Pack', price: 720, img: 'images/gift3b.jpg', description: 'Розширений фан-набір.' },

    { id: 'mv-1', theme: 'Marvel', title: 'Marvel Box — Hero', price: 700, img: 'images/gift4.jpg', description: 'Наклейки, фігурка, плакат.' },
    { id: 'mv-2', theme: 'Marvel', title: 'Marvel Box — Legends', price: 950, img: 'images/gift4b.jpg', description: 'Ексклюзивні предмети для фанатів.' }
];

const CART_KEY = 'sm_cart_v1';
const SELECTED_KEY = 'selectedBoxId';

function q(sel){ return document.querySelector(sel); }
function qa(sel){ return Array.from(document.querySelectorAll(sel)); }

function loadCart(){
    try {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch(e){
        console.error('Load cart error', e);
        return [];
    }
}
function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

let toastEl = null;
let toastTimer = null;

function ensureToast(){
    if (toastEl) return toastEl;
    toastEl = document.createElement('div');
    toastEl.id = 'cart-toast';
    toastEl.className = 'cart-toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    toastEl.style.position = 'fixed';
    toastEl.style.top = '18px';
    toastEl.style.right = '18px';
    toastEl.style.zIndex = '99999';
    toastEl.style.padding = '12px 16px';
    toastEl.style.borderRadius = '10px';
    toastEl.style.background = 'linear-gradient(90deg,#6a4fb0,#4b2fae)';
    toastEl.style.color = 'white';
    toastEl.style.boxShadow = '0 12px 30px rgba(80,60,120,0.18)';
    toastEl.style.cursor = 'pointer';
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(-8px)';
    toastEl.style.transition = 'opacity .28s ease, transform .28s cubic-bezier(.2,.8,.2,1)';
    toastEl.style.display = 'flex';
    toastEl.style.gap = '10px';
    toastEl.style.alignItems = 'center';
    toastEl.style.maxWidth = '360px';
    toastEl.style.backdropFilter = 'saturate(120%) blur(6px)';

    toastEl.addEventListener('click', ()=>{
        window.location.href = 'cart.html';
    });

    toastEl.tabIndex = 0;
    toastEl.addEventListener('keydown', (e)=>{
        if (e.key === 'Enter' || e.key === ' ') window.location.href = 'cart.html';
    });

    document.body.appendChild(toastEl);
    return toastEl;
}

function showToast(message, ttl = 3500){
    const el = ensureToast();
    el.textContent = '';
    const icon = document.createElement('span');
    icon.innerHTML = '🛒';
    icon.style.fontSize = '18px';
    el.appendChild(icon);
    const text = document.createElement('div');
    text.textContent = message;
    text.style.fontSize = '14px';
    text.style.lineHeight = '1.2';
    el.appendChild(text);

    requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> {
        hideToast();
    }, ttl);
}

function hideToast(){
    if (!toastEl) return;
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(-8px)';
}

function getBoxById(id){
    return boxes.find(b => b.id === id);
}

function addToCart(boxId, qty = 1){
    const box = getBoxById(boxId);
    if (!box) {
        console.warn('Box not found', boxId);
        return;
    }
    const cart = loadCart();
    const existing = cart.find(i => i.id === boxId);
    if (existing){
        existing.qty = Number(existing.qty) + Number(qty);
    } else {
        cart.push({ id: box.id, title: box.title, price: box.price, qty: Number(qty), img: box.img, theme: box.theme });
    }
    saveCart(cart);
    showToast(`${box.title} додано в корзину (${qty} шт.)`);
    if (typeof renderCartPage === 'function') renderCartPage();
}

function removeFromCart(boxId){
    let cart = loadCart();
    cart = cart.filter(i => i.id !== boxId);
    saveCart(cart);
    if (typeof renderCartPage === 'function') renderCartPage();
}

function renderCatalog(theme = null){
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const filtered = theme ? boxes.filter(b => b.theme === theme) : boxes;
    filtered.forEach(box => {
        const el = document.createElement('div');
        el.className = 'product-card linkable';
        el.innerHTML = `
      <img src="${box.img}" alt="${escapeHtml(box.title)}" loading="lazy">
      <div style="padding:12px">
        <h3 class="card-title">${escapeHtml(box.title)}</h3>
        <p class="price">${box.price} грн</p>
        <p style="font-size:13px;color:#666; min-height:36px">${escapeHtml(box.description)}</p>
        <div class="card-actions">
          <button class="btn details-btn" data-id="${box.id}">Детальніше</button>
          <button class="btn add-btn" data-id="${box.id}">Додати до корзини</button>
        </div>
      </div>
    `;
        grid.appendChild(el);
    });

    grid.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            localStorage.setItem(SELECTED_KEY, id);
            window.location.href = 'product_detail.html';
        });
    });
    grid.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            addToCart(id, 1);
        });
    });
}

function renderProductDetail(){
    const img = q('#product-img');
    const title = q('#product-title');
    const desc = q('#product-description');
    const priceEl = q('#product-price');
    const qtyEl = q('#quantity');
    const inc = q('#increase');
    const dec = q('#decrease');
    const addBtn = q('#add-to-cart');

    if (!title) return;

    const selectedId = localStorage.getItem(SELECTED_KEY);
    const box = getBoxById(selectedId) || boxes[0];

    img.src = box.img;
    img.alt = box.title;
    title.textContent = box.title;
    desc.textContent = box.description;
    priceEl.textContent = box.price + ' грн';

    let qty = 1;
    qtyEl.textContent = qty;

    inc.addEventListener('click', ()=> {
        qty++;
        qtyEl.textContent = qty;
    });
    dec.addEventListener('click', ()=> {
        if (qty > 1) qty--;
        qtyEl.textContent = qty;
    });
    addBtn.addEventListener('click', ()=> {
        addToCart(box.id, qty);
    });
}

function renderCartPage(){
    const container = document.querySelector('.cart-items');
    const totalEl = q('#total-price');
    if (!container || !totalEl) return;
    const cart = loadCart();
    container.innerHTML = '';

    if (cart.length === 0){
        container.innerHTML = `<p>Ваша корзина порожня.</p>`;
        totalEl.textContent = '0';
        return;
    }

    let sum = 0;
    cart.forEach(item => {
        sum += item.price * item.qty;
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
      <img src="${item.img}" alt="${escapeHtml(item.title)}">
      <div style="flex:1">
        <h3 class="cart-item-title clickable" data-id="${item.id}" style="margin:0 0 6px 0;">${escapeHtml(item.title)}</h3>
        <p style="margin:0 0 8px 0">Ціна: ${item.price} грн</p>
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
        container.appendChild(row);
    });

    totalEl.textContent = String(sum);

    container.querySelectorAll('.cart-increase').forEach(b => b.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        modifyCartQty(id, +1);
    }));
    container.querySelectorAll('.cart-decrease').forEach(b => b.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        modifyCartQty(id, -1);
    }));
    container.querySelectorAll('.remove-btn').forEach(b => b.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        removeFromCart(id);
    }));
    container.querySelectorAll('.cart-item-title').forEach(h => {
        h.addEventListener('click', (e)=>{
            const id = e.currentTarget.dataset.id;
            localStorage.setItem(SELECTED_KEY, id);
            window.location.href = 'product_detail.html';
        });
    });
}

function modifyCartQty(id, delta){
    const cart = loadCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0){
        const idx = cart.indexOf(item);
        cart.splice(idx, 1);
    }
    saveCart(cart);
    renderCartPage();
}

function wireHeaderMenu(){
    const dropdowns = qa('.dropdown');
    dropdowns.forEach(dd => {
        let openTimer = null;
        let closeTimer = null;
        const menu = dd.querySelector('.dropdown-content');

        dd.addEventListener('mouseenter', ()=>{
            if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
            openTimer = setTimeout(()=> {
                if (menu) {
                    menu.classList.add('visible-by-js');
                    menu.style.display = 'block';
                    menu.style.opacity = '1';
                    menu.style.transform = 'translateY(0)';
                }
            }, 160);
        });
        dd.addEventListener('mouseleave', ()=>{
            if (openTimer) { clearTimeout(openTimer); openTimer = null; }
            closeTimer = setTimeout(()=> {
                if (menu) {
                    menu.classList.remove('visible-by-js');
                    menu.style.opacity = '0';
                    menu.style.transform = 'translateY(-6px)';
                    setTimeout(()=> menu.style.display = 'none', 220);
                }
            }, 160);
        });
        dd.addEventListener('focusin', ()=> {
            if (menu) { menu.style.display = 'block'; menu.style.opacity='1'; menu.style.transform='translateY(0)'; }
        });
        dd.addEventListener('focusout', ()=> {
            if (menu) { menu.style.opacity='0'; menu.style.transform='translateY(-6px)'; setTimeout(()=>menu.style.display='none',220); }
        });
    });

    const burger = q('.burger');
    const navUl = q('nav ul');
    if (burger && navUl){
        burger.addEventListener('click', ()=>{
            navUl.classList.toggle('active');
            burger.classList.toggle('open');
        });
    }

    const links = qa('nav a');
    const path = window.location.pathname.split('/').pop().toLowerCase();
    links.forEach(a => {
        const href = (a.getAttribute('href')||'').toLowerCase();
        if (path && href.includes(path) && path !== '') {
            a.classList.add('active-nav');
        }
        if ((path === '' || path === 'index.html') && href.includes('index.html')) a.classList.add('active-nav');
    });
}

function escapeHtml(s){
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, function(m){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
    });
}

document.addEventListener('DOMContentLoaded', ()=> {
    wireHeaderMenu();

    if (q('#catalog-grid')) {
        const params = new URLSearchParams(window.location.search);
        const themeParam = params.get('theme');
        const theme = themeParam ? themeParam.replace(/\+/g, ' ') : null;
        renderCatalog(theme);
    }

    if (q('#product-title')) {
        renderProductDetail();
    }

    if (q('#total-price')) {
        renderCartPage();
    }

    qa('[data-add-id]').forEach(el => {
        el.addEventListener('click', ()=>{
            const id = el.dataset.addId;
            const qty = Number(el.dataset.addQty || 1);
            addToCart(id, qty);
        });
    });

    const logo = q('.logo');
    if (logo){
        logo.addEventListener('click', (e)=>{
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    ensureToast();

    document.addEventListener('keydown', (e)=>{
        if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
            window.location.href = 'cart.html';
        }
    });
});

window.sm = {
    boxes,
    addToCart,
    loadCart,
    saveCart,
    renderCatalog,
    renderCartPage,
    renderProductDetail,
    showToast
};
