/* TMJ Foods — customer app */
const N = n => '₦' + Number(n || 0).toLocaleString('en-NG');
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const EXTRAS = [
  { id: 'dodo', name: 'Extra fried plantain', price: 1200 },
  { id: 'coleslaw', name: 'Extra coleslaw', price: 800 },
  { id: 'meat', name: 'Extra meat', price: 1500 },
];
const PAY_METHODS = [
  { id: 'card', name: 'Card', sub: 'Pay with debit / credit card' },
  { id: 'transfer', name: 'Bank transfer', sub: 'Transfer to TMJ Foods account' },
  { id: 'opay', name: 'OPay', sub: 'Pay with OPay' },
  { id: 'wallet', name: 'TMJ Wallet', sub: 'Pay from your TMJ balance' },
];
const STATUS_STEPS = [
  { id: 'PAID', t: 'Order paid', s: 'Payment confirmed. Kitchen has your order.' },
  { id: 'PREPARING', t: 'Preparing', s: 'The kitchen is cooking your food fresh.' },
  { id: 'READY_FOR_PICKUP', t: 'Ready for pickup', s: 'Your food is ready. Show your QR code at the outlet.' },
  { id: 'COLLECTED', t: 'Collected', s: 'Enjoy your meal!' },
];
const EMBEDDED_MENU = [
  { id: 'm1', name: 'Party Jollof Rice + Chicken', description: 'Smoky party jollof rice with crispy fried chicken, plantain and coleslaw.', category: 'Rice', price: 3500, image: 'https://vtappsupjgsuzhemypkq.supabase.co/storage/v1/object/public/tmj-foods/food/hero-jollof.jpg', tag: 'Bestseller' },
  { id: 'm2', name: 'Party Jollof Rice + Beef', description: 'Smoky party jollof rice with tender beef, plantain and coleslaw.', category: 'Rice', price: 3200, image: 'https://vtappsupjgsuzhemypkq.supabase.co/storage/v1/object/public/tmj-foods/food/jollof-chicken.jpg', tag: '' },
  { id: 'm3', name: 'Fried Rice + Chicken', description: 'Golden fried rice with mixed veggies and crispy fried chicken.', category: 'Rice', price: 3500, image: 'https://vtappsupjgsuzhemypkq.supabase.co/storage/v1/object/public/tmj-foods/food/fried-rice-chicken.jpg', tag: 'Bestseller' },
  { id: 'm4', name: 'Fried Rice + Beef', description: 'Golden fried rice with mixed veggies and tender beef.', category: 'Rice', price: 3200, image: 'https://vtappsupjgsuzhemypkq.supabase.co/storage/v1/object/public/tmj-foods/food/combo-jollof.jpg', tag: '' },
  { id: 'm5', name: 'Half & Half Combo + Chicken', description: 'Half jollof, half fried rice, with crispy chicken, plantain and coleslaw.', category: 'Combos', price: 4000, image: 'https://vtappsupjgsuzhemypkq.supabase.co/storage/v1/object/public/tmj-foods/food/combo-jollof.jpg', tag: 'Combo' },
  { id: 'm6', name: 'Beef Shawarma', description: 'Grilled beef, fresh veggies and creamy sauce in a toasted wrap, with fries.', category: 'Shawarma', price: 3500, image: 'https://vtappsupjgsuzhemypkq.supabase.co/storage/v1/object/public/tmj-foods/food/beef-shawarma.jpg', tag: 'Bestseller' },
  { id: 'm7', name: 'Chicken Shawarma', description: 'Grilled chicken, fresh veggies and creamy sauce in a toasted wrap.', category: 'Shawarma', price: 3300, image: 'https://vtappsupjgsuzhemypkq.supabase.co/storage/v1/object/public/tmj-foods/food/chicken-shawarma.jpg', tag: '' },
  { id: 'm8', name: 'Fried Plantain (Dodo)', description: 'Sweet caramelised fried plantain, golden and soft inside.', category: 'Sides', price: 1200, image: 'https://vtappsupjgsuzhemypkq.supabase.co/storage/v1/object/public/tmj-foods/food/dodo.jpg', tag: '' },
  { id: 'm9', name: 'Coleslaw', description: 'Fresh crunchy cabbage and carrot slaw in creamy dressing.', category: 'Sides', price: 800, image: 'https://vtappsupjgsuzhemypkq.supabase.co/storage/v1/object/public/tmj-foods/food/coleslaw.jpg', tag: '' },
];
const EMBEDDED_OUTLETS = [
  { id: 'o1', name: 'Tanke', city: 'Ilorin', address: 'Tanke Road, Ilorin' },
  { id: 'o2', name: 'Fate', city: 'Ilorin', address: 'Fate Road, Ilorin' },
  { id: 'o3', name: 'Allen Avenue', city: 'Lagos', address: '56 Allen Avenue, Ikeja, Lagos' },
  { id: 'o4', name: 'Festac', city: 'Lagos', address: 'Festac Town, Lagos' },
  { id: 'o5', name: 'UNILAG', city: 'Lagos', address: 'University of Lagos, Akoka' },
  { id: 'o6', name: 'Bodija', city: 'Ibadan', address: 'Bodija, Ibadan' },
  { id: 'o7', name: 'Akala Express', city: 'Ibadan', address: 'Akala Expressway, Ibadan' },
  { id: 'o8', name: 'Wuse 2', city: 'Abuja', address: 'Wuse 2, Abuja' },
];

let sb = null, MENU = EMBEDDED_MENU, OUTLETS = EMBEDDED_OUTLETS, CAT = 'All';
let cart = JSON.parse(localStorage.getItem('tmj_cart') || '[]');
let currentOrder = null, trackTimer = null, selectedSlot = '', selectedPay = 'card';

function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  $('#toastRoot').appendChild(t); setTimeout(() => t.remove(), 2600);
}
function saveCart() { localStorage.setItem('tmj_cart', JSON.stringify(cart)); updateCartBadge(); }
function cartCount() { return cart.reduce((a, c) => a + c.qty, 0); }
function cartTotal() { return cart.reduce((a, c) => a + c.line, 0); }
function updateCartBadge() {
  const n = cartCount(), el = $('#cartCount');
  el.textContent = n; el.classList.toggle('hidden', n === 0);
}
function initSupabase() {
  try {
    if (window.supabase && window.TMJ_SUPABASE) {
      sb = window.supabase.createClient(window.TMJ_SUPABASE.url, window.TMJ_SUPABASE.publishableKey);
    }
  } catch (e) { sb = null; }
}
async function loadData() {
  if (!sb) { renderMenu(); renderCheckoutStatic(); return; }
  try {
    const [m, o] = await Promise.all([
      sb.from('tmj_menu_items').select('*').eq('active', true).order('sort'),
      sb.from('tmj_outlets').select('*').eq('active', true).order('sort'),
    ]);
    if (m.data && m.data.length) MENU = m.data;
    if (o.data && o.data.length) OUTLETS = o.data;
  } catch (e) { /* stay on embedded data */ }
  renderMenu(); renderCheckoutStatic();
  $('#menuNote').textContent = sb ? '' : '';
}

/* ---------- views ---------- */
function showView(v) {
  ['home', 'cart', 'checkout', 'confirm', 'track', 'orders'].forEach(x =>
    $('#view-' + x).classList.toggle('hidden', x !== v));
  $$('.nav-in button').forEach(b => b.classList.toggle('on', b.dataset.v === v || (v === 'checkout' && b.dataset.v === 'cart') || (v === 'confirm' && b.dataset.v === 'orders')));
  if (v === 'cart') renderCart();
  if (v === 'checkout') renderCheckout();
  window.scrollTo({ top: 0 });
}

/* ---------- menu ---------- */
function renderMenu() {
  const cats = ['All', ...new Set(MENU.map(m => m.category))];
  $('#catChips').innerHTML = cats.map(c =>
    `<button class="chip ${c === CAT ? 'on' : ''}" onclick="setCat('${c}')">${c}</button>`).join('');
  const list = CAT === 'All' ? MENU : MENU.filter(m => m.category === CAT);
  $('#menuGrid').innerHTML = list.map(m => `
    <article class="card" onclick="openItem('${m.id}')">
      <img src="${m.image}" alt="${m.name}" loading="lazy" onerror="this.src='https://vtappsupjgsuzhemypkq.supabase.co/storage/v1/object/public/tmj-foods/food/hero-jollof.jpg'">
      <div class="card-b">
        ${m.tag ? `<span class="tag">${m.tag}</span>` : ''}
        <h3>${m.name}</h3><p>${m.description}</p>
        <div class="price-row"><span class="price">${N(m.price)}</span>
        <button class="add" onclick="event.stopPropagation();quickAdd('${m.id}')">+ Add</button></div>
      </div>
    </article>`).join('');
}
function setCat(c) { CAT = c; renderMenu(); }
function findItem(id) { return MENU.find(m => String(m.id) === String(id)); }

let sheetQty = 1, sheetExtras = new Set(), sheetItem = null;
function openItem(id) {
  sheetItem = findItem(id); if (!sheetItem) return;
  sheetQty = 1; sheetExtras = new Set();
  $('#sheetRoot').innerHTML = `
  <div class="sheet-bg" onclick="if(event.target===this)closeSheet()">
    <div class="sheet" style="position:relative">
      <button class="close-x" onclick="closeSheet()">✕</button>
      <img class="hero" src="${sheetItem.image}" alt="${sheetItem.name}">
      <div class="sheet-b">
        <h2>${sheetItem.name}</h2>
        <p class="desc">${sheetItem.description}</p>
        <div class="opt-t">Make it yours — extras</div>
        ${EXTRAS.map(e => `<div class="opt" id="ex-${e.id}" onclick="toggleExtra('${e.id}')">
          <span>${e.name}</span><span class="p">+ ${N(e.price)}</span></div>`).join('')}
        <div class="qty-row"><span style="font-weight:700">Quantity</span>
          <button onclick="sheetQty=Math.max(1,sheetQty-1);updSheet()">−</button><b id="sheetQtyN">1</b>
          <button onclick="sheetQty++;updSheet()">+</button>
          <span style="margin-left:auto;font-weight:800" id="sheetTotal">${N(sheetItem.price)}</span></div>
        <button class="cta" onclick="addSheetToCart()">Add to cart • <span id="sheetCtaTotal">${N(sheetItem.price)}</span></button>
      </div>
    </div>
  </div>`;
}
function toggleExtra(id) {
  sheetExtras.has(id) ? sheetExtras.delete(id) : sheetExtras.add(id);
  $('#ex-' + id).classList.toggle('sel', sheetExtras.has(id)); updSheet();
}
function updSheet() {
  $('#sheetQtyN').textContent = sheetQty;
  const t = sheetTotal(); $('#sheetTotal').textContent = N(t); $('#sheetCtaTotal').textContent = N(t);
}
function sheetTotal() {
  const ex = [...sheetExtras].reduce((a, id) => a + (EXTRAS.find(e => e.id === id)?.price || 0), 0);
  return (sheetItem.price + ex) * sheetQty;
}
function closeSheet() { $('#sheetRoot').innerHTML = ''; }
function addSheetToCart() {
  const extras = [...sheetExtras].map(id => EXTRAS.find(e => e.id === id));
  const unit = sheetItem.price + extras.reduce((a, e) => a + e.price, 0);
  cart.push({ id: sheetItem.id, name: sheetItem.name, image: sheetItem.image, price: sheetItem.price,
    extras: extras.map(e => e.name), unit, qty: sheetQty, line: unit * sheetQty });
  saveCart(); closeSheet(); toast(`${sheetItem.name} added to cart`);
}
function quickAdd(id) {
  const m = findItem(id); if (!m) return;
  cart.push({ id: m.id, name: m.name, image: m.image, price: m.price, extras: [], unit: m.price, qty: 1, line: m.price });
  saveCart(); toast(`${m.name} added to cart`);
}

/* ---------- cart ---------- */
function renderCart() {
  const box = $('#cartItems');
  if (!cart.length) {
    box.innerHTML = `<div class="empty"><div class="big">🍽️</div><p>Your cart is empty.<br>Add something tasty from the menu.</p></div>`;
    $('#cartTotals').classList.add('hidden'); $('#toCheckout').classList.add('hidden'); return;
  }
  $('#toCheckout').classList.remove('hidden');
  box.innerHTML = cart.map((c, i) => `
    <div class="cart-item">
      <img src="${c.image}" alt="${c.name}">
      <div class="ci-b"><h4>${c.name}</h4>
        ${c.extras.length ? `<div class="opts">${c.extras.join(' • ')}</div>` : ''}
        <div class="ci-row"><span class="pr">${N(c.line)}</span>
        <span class="stepper"><button onclick="chQty(${i},-1)">−</button><b>${c.qty}</b>
        <button onclick="chQty(${i},1)">+</button>
        <button onclick="rmItem(${i})" style="border:none;font-size:16px">🗑️</button></span></div>
      </div>
    </div>`).join('');
  const t = $('#cartTotals'); t.classList.remove('hidden');
  t.innerHTML = `<div class="r"><span>Subtotal</span><span>${N(cartTotal())}</span></div>
    <div class="r"><span>Pickup fee</span><span>Free</span></div>
    <div class="r big"><span>Total</span><span>${N(cartTotal())}</span></div>`;
}
function chQty(i, d) {
  cart[i].qty += d; if (cart[i].qty <= 0) cart.splice(i, 1);
  else cart[i].line = cart[i].unit * cart[i].qty;
  saveCart(); renderCart();
}
function rmItem(i) { cart.splice(i, 1); saveCart(); renderCart(); }

/* ---------- checkout ---------- */
function renderCheckoutStatic() {
  $('#coOutlet').innerHTML = OUTLETS.map(o => `<option value="${o.id}">${o.name} — ${o.city}</option>`).join('');
  const fmt = d => d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
  const today = new Date(), tom = new Date(Date.now() + 864e5);
  $('#coDate').innerHTML = `<option value="${iso(today)}">Today, ${fmt(today)}</option><option value="${iso(tom)}">Tomorrow, ${fmt(tom)}</option>`;
  $('#payMethods').innerHTML = PAY_METHODS.map(p => `
    <div class="pay ${p.id === selectedPay ? 'sel' : ''}" onclick="selPay('${p.id}')">
      <span class="dot"></span><span>${p.name}<small>${p.sub}</small></span></div>`).join('');
  renderSlots();
}
function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function selPay(id) { selectedPay = id; renderCheckoutStatic(); renderCheckout(); }
function renderSlots() {
  const dateVal = $('#coDate').value || iso(new Date());
  const isToday = dateVal === iso(new Date());
  const now = new Date(); const minMins = isToday ? now.getHours() * 60 + now.getMinutes() + 45 : 8 * 60;
  let html = '';
  for (let m = 8 * 60; m <= 22 * 60 + 30; m += 30) {
    if (m < minMins) continue;
    const h = String(Math.floor(m / 60)).padStart(2, '0'), mm = String(m % 60).padStart(2, '0');
    const t = `${h}:${mm}`;
    html += `<button class="slot ${selectedSlot === t ? 'on' : ''}" onclick="selSlot('${t}')">${t}</button>`;
  }
  $('#coSlots').innerHTML = html || '<p style="color:var(--muted);font-size:13px">No more slots today — pick tomorrow.</p>';
  if (!selectedSlot || !html.includes(selectedSlot)) {
    const first = $('#coSlots .slot'); selectedSlot = first ? first.textContent : '';
    if (first) first.classList.add('on');
  }
}
function selSlot(t) { selectedSlot = t; renderSlots(); }
function renderCheckout() {
  if (!cart.length) { showView('cart'); return; }
  renderCheckoutStatic();
  $('#coTotals').innerHTML = `<div class="r"><span>Subtotal</span><span>${N(cartTotal())}</span></div>
    <div class="r"><span>Pickup fee</span><span>Free</span></div>
    <div class="r big"><span>Total to pay</span><span>${N(cartTotal())}</span></div>`;
  $('#payBtn').textContent = `Confirm payment ${N(cartTotal())} & place order`;
}
$('#coDate')?.addEventListener?.('change', () => { selectedSlot = ''; renderSlots(); });

function genCode() {
  const c = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = '';
  for (let i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)];
  return 'TMJ-' + s;
}
async function placeOrder() {
  const name = $('#coName').value.trim(), phone = $('#coPhone').value.trim().replace(/\s+/g, '');
  if (name.length < 2) return toast('Please enter your name');
  if (phone.replace(/\D/g, '').length < 10) return toast('Please enter a valid phone number');
  if (!selectedSlot) return toast('Please pick a pickup time');
  if (!cart.length) return showView('cart');
  const btn = $('#payBtn'); btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span>Processing payment…';
  const outlet = OUTLETS.find(o => String(o.id) === String($('#coOutlet').value)) || OUTLETS[0];
  const code = genCode();
  const order = {
    code, customer_name: name, phone, outlet_id: outlet.id, outlet_name: outlet.name + ' — ' + outlet.city,
    pickup_date: $('#coDate').value, pickup_time: selectedSlot,
    payment_method: selectedPay, payment_ref: 'TMJ-PAY-' + code.slice(4),
    subtotal: cartTotal(), total: cartTotal(), status: 'PAID',
  };
  const items = cart.map(c => ({ menu_item_id: c.id && c.id.length > 20 ? c.id : null, name: c.name, unit_price: c.unit, qty: c.qty, options: c.extras, line_total: c.line }));
  let savedOnline = false;
  try {
    if (sb) {
      const { data, error } = await sb.from('tmj_orders').insert(order).select('id').single();
      if (error) throw error;
      const rows = items.map(it => ({ ...it, order_id: data.id }));
      const r2 = await sb.from('tmj_order_items').insert(rows);
      if (r2.error) throw r2.error;
      savedOnline = true;
    }
  } catch (e) { savedOnline = false; }
  if (!savedOnline) {
    const local = JSON.parse(localStorage.getItem('tmj_orders_local') || '[]');
    local.push({ ...order, items, created_at: new Date().toISOString(), local: true });
    localStorage.setItem('tmj_orders_local', JSON.stringify(local));
  }
  localStorage.setItem('tmj_last_phone', phone);
  cart = []; saveCart();
  currentOrder = { ...order, items, created_at: new Date().toISOString(), local: !savedOnline };
  btn.disabled = false; renderCheckout();
  showConfirm(currentOrder);
}
function qrUrl(code) {
  return 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=' + encodeURIComponent('TMJFOODS:' + code);
}
function statusTimeline(order) {
  const idx = STATUS_STEPS.findIndex(s => s.id === order.status);
  return `<div class="tl">${STATUS_STEPS.map((s, i) => `
    <div class="tl-step ${i < idx ? 'done' : i === idx ? 'now' : ''}">
      <span class="tl-dot">${i < idx ? '✓' : i + 1}</span>
      <div><b>${s.t}</b><span>${s.s}</span></div></div>`).join('')}</div>`;
}
function showConfirm(order) {
  showView('confirm');
  const pm = PAY_METHODS.find(p => p.id === order.payment_method)?.name || order.payment_method;
  $('#confirmCard').innerHTML = `
    <div class="tick">✓</div><h2>Order confirmed!</h2>
    <p style="color:var(--muted);font-size:14px">Show this QR code at the outlet to collect your food.</p>
    <div class="code">${order.code}</div>
    <div class="qr" id="qrBox"></div>
    <p class="qr-note">Order code: <b>${order.code}</b> • ${N(order.total)} paid via ${pm}</p>
    <div id="confirmTl">${statusTimeline(order)}</div>
    <div class="info-box">📍 <b>${order.outlet_name}</b><br>🕗 Pickup: <b>${order.pickup_date} at ${order.pickup_time}</b><br>👤 ${order.customer_name} • ${order.phone}<br>${order.items.map(i => `• ${i.qty} × ${i.name}`).join('<br>')}</div>
    ${order.local ? '<p class="note">Saved on this device (offline mode). It will sync when the connection is back.</p>' : ''}`;
  const qb = document.getElementById('qrBox');
  if (qb) {
    if (window.QRCode) {
      try { new QRCode(qb, { text: 'TMJFOODS:' + order.code, width: 200, height: 200, correctLevel: QRCode.CorrectLevel.M }); }
      catch (e) { qb.innerHTML = `<img src="${qrUrl(order.code)}" alt="Order QR code" style="width:200px;height:200px">`; }
    } else {
      qb.innerHTML = `<img src="${qrUrl(order.code)}" alt="Order QR code" style="width:200px;height:200px">`;
    }
  }
  startTracking(order.code);
}
function startTracking(code) {
  stopTracking();
  const poll = async () => {
    if (!sb) return;
    try {
      const { data } = await sb.from('tmj_orders').select('*').eq('code', code).single();
      if (data) {
        currentOrder = { ...currentOrder, ...data };
        const tl = $('#confirmTl'); if (tl) tl.innerHTML = statusTimeline(data);
        const tr = $('#trackResult .tl'); if (tr) tr.outerHTML = statusTimeline(data);
      }
    } catch (e) { /* keep polling */ }
  };
  poll(); trackTimer = setInterval(poll, 8000);
}
function stopTracking() { if (trackTimer) clearInterval(trackTimer); trackTimer = null; }

/* ---------- track & my orders ---------- */
function orderCard(o, withTl) {
  return `<div class="ord"><div class="top"><b>${o.code}</b><span class="badge b-${o.status}">${o.status.replace(/_/g, ' ')}</span></div>
    <div class="meta">${o.outlet_name} • Pickup ${o.pickup_date} at ${o.pickup_time} • ${N(o.total)}</div>
    ${o.items ? `<div class="items">${o.items.map(i => `${i.qty} × ${i.name}`).join('<br>')}</div>` : ''}
    ${withTl ? statusTimeline(o) : ''}</div>`;
}
async function trackOrder() {
  const code = $('#trackCode').value.trim().toUpperCase();
  if (!code) return toast('Enter your order code');
  const box = $('#trackResult');
  box.innerHTML = '<p class="note">Looking up your order…</p>';
  let found = null;
  try {
    if (sb) {
      const { data } = await sb.from('tmj_orders').select('*').eq('code', code).single();
      if (data) {
        const { data: items } = await sb.from('tmj_order_items').select('*').eq('order_id', data.id);
        found = { ...data, items: items || [] };
      }
    }
  } catch (e) { /* fall through to local */ }
  if (!found) {
    const local = JSON.parse(localStorage.getItem('tmj_orders_local') || '[]');
    found = local.find(o => o.code === code) || null;
  }
  if (!found) { box.innerHTML = `<div class="empty"><div class="big">🔍</div><p>No order found for <b>${code}</b>.<br>Check the code and try again.</p></div>`; return; }
  currentOrder = found;
  box.innerHTML = orderCard(found, true);
  startTracking(code);
}
async function loadMyOrders() {
  const phone = $('#myPhone').value.trim().replace(/\s+/g, '');
  if (phone.replace(/\D/g, '').length < 10) return toast('Enter the phone number you ordered with');
  const box = $('#myOrders');
  box.innerHTML = '<p class="note">Finding your orders…</p>';
  let list = [];
  try {
    if (sb) {
      const { data } = await sb.from('tmj_orders').select('*').eq('phone', phone).order('created_at', { ascending: false }).limit(20);
      if (data) list = data;
    }
  } catch (e) { /* fall through */ }
  const local = JSON.parse(localStorage.getItem('tmj_orders_local') || '[]');
  local.filter(o => o.phone === phone).forEach(o => { if (!list.find(x => x.code === o.code)) list.push(o); });
  if (!list.length) { box.innerHTML = `<div class="empty"><div class="big">🧾</div><p>No orders found for this number yet.</p></div>`; return; }
  box.innerHTML = list.map(o => orderCard(o, false)).join('');
}

initSupabase();
loadData();
updateCartBadge();
const lastPhone = localStorage.getItem('tmj_last_phone');
if (lastPhone) $('#myPhone').value = lastPhone;
