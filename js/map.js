// ========== map.js ==========
// 地図・GPS・資源採掘

let map, myMarker, scanCircle;
const fieldMarkers = [];
const RK = Object.keys(RESOURCES);

function initMap() {
  map = L.map('map', {zoomControl:false, attributionControl:false})
    .setView([G.lat, G.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(map);

  myMarker = L.marker([G.lat, G.lng], {
    icon: L.divIcon({className:'', html:'<div class="my-dot"></div>', iconSize:[18,18], iconAnchor:[9,9]})
  }).addTo(map);

  scanCircle = L.circle([G.lat, G.lng], {
    radius:400, color:'#00c8ff', fillColor:'#00c8ff',
    fillOpacity:0.03, weight:1, dashArray:'5,4'
  }).addTo(map);

  // GPS取得
  if(navigator.geolocation) {
    navigator.geolocation.watchPosition(p => {
      G.lat = p.coords.latitude;
      G.lng = p.coords.longitude;
      myMarker.setLatLng([G.lat, G.lng]);
      scanCircle.setLatLng([G.lat, G.lng]);
    }, () => log('GPS未取得 - デモ位置使用中', 'warn'));
  }

  spawnNodes();

  // 長押し → 説明会
  let pt;
  map.getContainer().addEventListener('touchstart', e => {
    const t = e.touches[0];
    pt = setTimeout(() => {
      const ll = map.containerPointToLatLng([t.clientX, t.clientY - map.getContainer().getBoundingClientRect().top]);
      openSeminar(ll.lat, ll.lng);
    }, 700);
  });
  map.getContainer().addEventListener('touchend',  () => clearTimeout(pt));
  map.getContainer().addEventListener('touchmove', () => clearTimeout(pt));
  map.on('contextmenu', e => openSeminar(e.latlng.lat, e.latlng.lng));

  // 📍 現在位置ボタン
  const lb = document.createElement('button');
  lb.innerHTML = '📍';
  lb.style.cssText = 'position:fixed;bottom:72px;right:16px;z-index:1001;width:46px;height:46px;border-radius:50%;background:rgba(13,19,32,0.95);border:1px solid #1a2e4a;color:#00c8ff;font-size:1.3rem;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,0.6);';
  lb.onclick = () => { map.setView([G.lat, G.lng], 16); log('現在位置に移動しました', 'ok'); };
  document.getElementById('main-ui').appendChild(lb);

  // 🎙️ 説明会ボタン
  const sb = document.createElement('button');
  sb.innerHTML = '🎙️';
  sb.title = '説明会を開催（現在地）';
  sb.style.cssText = 'position:fixed;bottom:120px;right:16px;z-index:1001;width:46px;height:46px;border-radius:50%;background:rgba(13,19,32,0.95);border:1px solid rgba(0,232,122,0.5);color:#00e87a;font-size:1.2rem;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,0.6);';
  sb.onclick = () => openSeminar(G.lat, G.lng);
  document.getElementById('main-ui').appendChild(sb);
}

// Overpass APIでスポット取得 → 資源配置
function spawnNodes() {
  log('周辺のスポットを検索中...', '');
  const query = `[out:json][timeout:10];(
    node["railway"="station"](around:1500,${G.lat},${G.lng});
    node["leisure"="park"](around:1500,${G.lat},${G.lng});
    node["shop"="convenience"](around:1500,${G.lat},${G.lng});
    node["shop"="supermarket"](around:1500,${G.lat},${G.lng});
    node["amenity"="restaurant"](around:1500,${G.lat},${G.lng});
    node["amenity"="museum"](around:1500,${G.lat},${G.lng});
    node["landuse"="industrial"](around:1500,${G.lat},${G.lng});
  );out body;`;

  fetch('https://overpass-api.de/api/interpreter', {method:'POST', body:query})
    .then(r => r.json())
    .then(data => {
      const elements = data.elements || [];
      if(elements.length === 0) { spawnRandom(); return; }
      log(`${elements.length}件のスポットに資源を配置しました！`, 'ok');
      elements.forEach(el => {
        if(!el.lat || !el.lon) return;
        const tags = el.tags || {};
        let type = 'default';
        if(tags.railway === 'station')      type = 'railway';
        else if(tags.leisure === 'park')    type = 'park';
        else if(tags.shop === 'convenience')type = 'convenience';
        else if(tags.shop === 'supermarket')type = 'supermarket';
        else if(tags.amenity === 'restaurant')type = 'restaurant';
        else if(tags.amenity === 'museum')  type = 'museum';
        else if(tags.landuse === 'industrial')type = 'industrial';
        const resType  = SPOT_RESOURCE_MAP[type] || 'iron';
        const spotName = tags['name:ja'] || tags.name || type;
        addRM(el.lat, el.lon, resType, spotName);
      });
    })
    .catch(() => { log('スポット取得失敗。ランダム配置します', 'warn'); spawnRandom(); });
}

function spawnRandom() {
  for(let i=0;i<10;i++) addRM(G.lat+(Math.random()-0.5)*0.006, G.lng+(Math.random()-0.5)*0.009, RK[Math.floor(Math.random()*RK.length)], '資源地点');
  for(let i=0;i<20;i++) addRM(G.lat+(Math.random()-0.5)*0.018, G.lng+(Math.random()-0.5)*0.025, RK[Math.floor(Math.random()*RK.length)], '資源地点');
  for(let i=0;i<20;i++) addRM(G.lat+(Math.random()-0.5)*0.05,  G.lng+(Math.random()-0.5)*0.07,  RK[Math.floor(Math.random()*RK.length)], '資源地点');
}

function addRM(lat, lng, type, spotName) {
  const info = RESOURCES[type];
  const q = Math.floor(Math.random() * 70) + 25;
  const a = Math.floor(Math.random() * 6) + 2;
  const m = L.marker([lat, lng], {
    icon: L.divIcon({className:'', html:`<div class="res-marker ${type}">${info.icon}</div>`, iconSize:[34,34], iconAnchor:[17,17]})
  });
  m.nd = {type, q, a, lat, lng, spotName: spotName || '資源地点'};
  m.on('click', () => {
    const d = m.nd, dist = calcDist(G.lat, G.lng, d.lat, d.lng), ok = dist <= 400 || G.debugMode;
    L.popup({closeButton:false}).setLatLng([d.lat, d.lng]).setContent(`
      <div class="popup-wrap">
        <div class="popup-head">${info.icon} ${info.name}</div>
        <div style="font-size:0.65rem;color:var(--dim);margin-bottom:4px">📍 ${d.spotName}</div>
        <div class="popup-row"><span>品質</span><span style="color:${d.q>65?'var(--green)':'var(--gold)'}">${d.q}%</span></div>
        <div class="popup-row"><span>採掘量</span><span style="color:var(--accent)">×${d.a}</span></div>
        <div class="popup-row"><span>距離</span><span>${Math.round(dist)}m ${ok?'✅':'⚠️'}</span></div>
        <button class="popup-btn" onclick="mine(${fieldMarkers.indexOf(m)})" ${ok?'':'disabled'}>
          ${ok ? '⛏️ 採掘する' : '🚶 近づいてください（400m以内）'}
        </button>
      </div>`).openOn(map);
  });
  m.addTo(map);
  fieldMarkers.push(m);
}

function mine(idx) {
  const m = fieldMarkers[idx]; if(!m) return;
  const d = m.nd, dist = calcDist(G.lat, G.lng, d.lat, d.lng);
  if(dist > 400 && !G.debugMode) { log('範囲外です', 'err'); return; }

  const bonus = 1 + G.staff.filter(s => s.skills.includes('物流') || s.skills.includes('製造')).length * 0.15;
  const gained = G.debugMode ? 99 : Math.round(d.a * (d.q / 100) * bonus);
  G.inventory[d.type] = (G.inventory[d.type] || 0) + gained;

  map.closePopup();
  map.removeLayer(m);
  fieldMarkers.splice(idx, 1);
  log(`⛏️ ${RESOURCES[d.type].icon}${RESOURCES[d.type].name}×${gained} 採掘！ (${d.spotName})`, 'ok');
  updateHeader();

  // 再出現
  setTimeout(() => {
    const nl = G.lat + (Math.random()-0.5)*0.07;
    const ng = G.lng + (Math.random()-0.5)*0.10;
    const nt = Math.random() < 0.7 ? d.type : RK[Math.floor(Math.random()*RK.length)];
    addRM(nl, ng, nt, d.spotName);
  }, 30000 + Math.random() * 60000);
}
