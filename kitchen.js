/* TMJ Foods — kitchen dashboard */
const N = n => '₦' + Number(n || 0).toLocaleString('en-NG');
const $ = s => document.querySelector(s);
const KITCHEN_PIN = '1234';
let sb = null, OUTLETS = [], knownIds = new Set(), audioOn = false, timer = null;

function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  $('#toastRoot').appendChild(t); setTimeout(() => t.remove(), 2600);
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18].forEach((d, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = i ? 1046 : 880; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, ctx.currentTime + d);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d + 0.16);
      o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.18);
    });
  } catch (e) { /* audio unavailable */ }
}
function unlockKitchen() {
  if ($('#pinInput').value.trim() === KITCHEN_PIN) {
    sessionStorage.setItem('tmj_kitchen', '1');
    $('#pinView').classList.add('hidden');
    $('#dashView').classList.remove('hidden');
    audioOn = true; beep();
    initKitchen();
  } else {
    toast('Wrong PIN — try again');
    $('#pinInput').value = '';
  }
}
function initSupabase() {
  try {
    if (window.supabase && window.TMJ_SUPABASE)
      sb = window.supabase.createClient(window.TMJ_SUPABASE.url, window.TMJ_SUPABASE.publishableKey);
  } catch (e) { sb = null; }
}
async function initKitchen() {
  initSupabase();
  if (sb) {
    try {
      const { data } = await sb.from('tmj_outlets').select('*').eq('active', true).order('sort');
      if (data) OUTLETS = data;
    } catch (e) { /* embedded fallback below */ }
  }
  if (!OUTLETS.length) OUTLETS = [
    { id: 'o1', name: 'Tanke', city: 'Ilorin' }, { id: 'o2', name: 'Fate', city: 'Ilorin' },
    { id: 'o3', name: 'Allen Avenue', city: 'Lagos' }, { id: 'o4', name: 'Festac', city: 'Lagos' },
    { id: 'o5', name: 'UNILAG', city: 'Lagos' }, { id: 'o6', name: 'Bodija', city: 'Ibadan' },
    { id: 'o7', name: 'Akala Express', city: 'Ibadan' }, { id: 'o8', name: 'Wuse 2', city: 'Abuja' },
  ];
  $('#kOutlet').innerHTML = '<option value="all">All outlets</option>' +
    OUTLETS.map(o => `<option value="${o.id}">${o.name} — ${o.city}</option>`).join('');
  await fetchOrders();
  if (timer) clearInterval(timer);
  timer = setInterval(fetchOrders, 8000);
}
function badge(st) {
  return `<span class="badge b-${st}">${st.replace(/_/g, ' ')}</span>`;
}
async function fetchOrders() {
  const list = $('#ordersList');
  let orders = [];
  try {
    if (sb) {
      let q = sb.from('tmj_orders').select('*, tmj_order_items(*)')
        .in('status', ['PAID', 'PREPARING', 'READY_FOR_PICKUP'])
        .order('created_at', { ascending: true });
      const outlet = $('#kOutlet')?.value;
      if (outlet && outlet !== 'all') q = q.eq('outlet_id', outlet);
      const { data, error } = await q;
      if (error) throw error;
      orders = data || [];
    }
  } catch (e) { orders = []; }
  // new-order alert
  const fresh = orders.filter(o => !knownIds.has(o.id));
  if (knownIds.size && fresh.length && audioOn) { beep(); toast(`🔔 ${fresh.length} new order${fresh.length > 1 ? 's' : ''}!`); }
  orders.forEach(o => knownIds.add(o.id));
  // stats (today, all outlets)
  let today = orders;
  try {
    if (sb) {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const { data } = await sb.from('tmj_orders').select('status,total')
        .gte('created_at', start.toISOString()).neq('status', 'CANCELLED');
      if (data) today = data;
    }
  } catch (e) { /* keep queue numbers */ }
  $('#stToday').textContent = today.length;
  $('#stReady').textContent = today.filter(o => o.status === 'READY_FOR_PICKUP').length;
  $('#stRev').textContent = N(today.reduce((a, o) => a + (o.total || 0), 0));
  if (!orders.length) {
    list.innerHTML = `<div class="empty"><div class="big">🍳</div><p>No live orders right now.<br>New orders will appear here automatically.</p></div>`;
    return;
  }
  list.innerHTML = orders.map(o => {
    const items = (o.tmj_order_items || []).map(i => `${i.qty} × ${i.name}`).join('<br>');
    const when = new Date(o.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    let action = '';
    if (o.status === 'PAID') action = `<button class="btn-prep" onclick="setStatus('${o.id}','PREPARING','${o.code}')">👨‍🍳 Start preparing</button>`;
    else if (o.status === 'PREPARING') action = `<button class="btn-ready" onclick="setStatus('${o.id}','READY_FOR_PICKUP','${o.code}')">✅ Mark ready</button>`;
    else if (o.status === 'READY_FOR_PICKUP') action = `<button class="btn-collect" onclick="setStatus('${o.id}','COLLECTED','${o.code}')">📦 Mark collected</button>`;
    const isNew = fresh.find(f => f.id === o.id);
    return `<div class="k-order ${isNew ? 'new' : ''}">
      <div class="top"><b>${o.code}</b>${badge(o.status)}</div>
      <div class="meta">👤 ${o.customer_name} • ${o.phone} • ${when}<br>📍 ${o.outlet_name} • Pickup ${o.pickup_date} at ${o.pickup_time} • ${o.payment_method}</div>
      <div class="items">${items}</div>
      <div style="font-weight:800;margin-top:8px">${N(o.total)}</div>
      <div class="k-actions">${action}
        <button style="flex:0 0 auto;background:#fdecea;color:var(--red);border:1.5px solid #f5c6c0" onclick="setStatus('${o.id}','CANCELLED','${o.code}')">Cancel</button>
      </div>
    </div>`;
  }).join('');
}
async function setStatus(id, status, code) {
  try {
    if (!sb) throw new Error('offline');
    const { error } = await sb.from('tmj_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    toast(`${code} → ${status.replace(/_/g, ' ')}`);
  } catch (e) { toast('Could not update — check connection'); }
  fetchOrders();
}
async function validateCode() {
  const code = $('#valCode').value.trim().toUpperCase();
  const box = $('#valResult');
  if (!code) return toast('Enter an order code');
  box.innerHTML = '<p class="note">Checking…</p>';
  let o = null;
  try {
    if (sb) {
      const { data } = await sb.from('tmj_orders').select('*, tmj_order_items(*)').eq('code', code).single();
      if (data) o = data;
    }
  } catch (e) { /* not found */ }
  if (!o) { box.innerHTML = `<p style="color:var(--red);font-weight:700">❌ No order found for ${code}.</p>`; return; }
  const items = (o.tmj_order_items || []).map(i => `${i.qty} × ${i.name}`).join('<br>');
  if (o.status === 'READY_FOR_PICKUP') {
    box.innerHTML = `<div style="background:#e7f7ee;border-radius:12px;padding:12px">
      <b style="color:var(--green)">✅ Ready for pickup</b><br>${o.code} • ${o.customer_name}<br>${items}<br><b>${N(o.total)}</b>
      <button class="btn-collect" style="width:100%;padding:12px;border-radius:10px;font-weight:700;margin-top:10px" onclick="setStatus('${o.id}','COLLECTED','${o.code}');document.getElementById('valResult').innerHTML=''">📦 Mark collected</button></div>`;
  } else if (o.status === 'COLLECTED') {
    box.innerHTML = `<p style="color:var(--muted);font-weight:700">📦 ${o.code} was already collected.</p>`;
  } else if (o.status === 'CANCELLED') {
    box.innerHTML = `<p style="color:var(--red);font-weight:700">❌ ${o.code} was cancelled.</p>`;
  } else {
    box.innerHTML = `<p style="font-weight:700">⏳ ${o.code} is ${o.status.replace(/_/g, ' ').toLowerCase()} — not ready yet.<br><span style="color:var(--muted);font-weight:400">${o.customer_name} • ${items}</span></p>`;
  }
}
$('#pinInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') unlockKitchen(); });
if (sessionStorage.getItem('tmj_kitchen') === '1') {
  $('#pinView').classList.add('hidden');
  $('#dashView').classList.remove('hidden');
  audioOn = true; initKitchen();
}
