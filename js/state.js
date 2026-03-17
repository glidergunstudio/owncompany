// ========== state.js ==========
// ゲーム状態の管理

let G = {
  uid: null,
  companyName: '',
  ceoName: '',
  industry: null,
  fundMode: 'self',
  params: {},
  money: 500000,
  month: 1,
  inventory: {},
  staff: [],
  marketPrices: {},
  financeHistory: [],
  cpuCompanies: [],
  lat: 35.6457,
  lng: 139.7473,
  slots: {
    factory: [{eq:null}],
    storage: [{eq:null}],
  },
  prodQueue: [],
  debugMode: false,
};

function initMarketPrices() {
  [...Object.entries(RESOURCES), ...Object.entries(PRODUCTS)].forEach(([k,v]) => {
    G.marketPrices[k] = v.basePrice;
  });
}

function totalSalary() {
  return G.staff.filter(s => !s.isCEO).reduce((a,s) => a + s.salary, 0);
}

function calcElectric() {
  const factoryCount = G.slots.factory.filter(s => s.eq).length;
  const staffCount   = Math.max(0, G.staff.length - 1);
  return factoryCount * 50000 + staffCount * 5000;
}

function getEqState() {
  let factoryLv = 0, storage = 0;
  G.slots.factory.forEach(s => {
    if(s.eq) {
      const e = EQUIPMENT_DATA.factory.find(x => x.id === s.eq);
      if(e) factoryLv = Math.max(factoryLv, e.level);
    }
  });
  G.slots.storage.forEach(s => {
    if(s.eq) {
      const e = EQUIPMENT_DATA.storage.find(x => x.id === s.eq);
      if(e) storage += e.cap;
    }
  });
  return {factoryLv, storage};
}

function genCPU() {
  G.cpuCompanies = Array.from({length:10}, (_, i) => ({
    id: 'cpu_' + i,
    name: CPU_PRE[i] + CPU_SUF[Math.floor(Math.random() * CPU_SUF.length)] + (Math.random() < 0.5 ? '(株)' : ''),
    industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
    money: 300000 + Math.random() * 2000000,
    staffCount: Math.floor(Math.random() * 5) + 1,
    color: `hsl(${i * 36},60%,55%)`,
  }));
}

function tickCPU() {
  G.cpuCompanies.forEach(cpu => {
    const k = Object.keys(RESOURCES)[Math.floor(Math.random() * 6)];
    const p = G.marketPrices[k], base = RESOURCES[k].basePrice;
    if(Math.random() < 0.25) {
      G.marketPrices[k] = Math.max(Math.round(p * 0.97), Math.round(base * 0.4));
      cpu.money += p * (Math.floor(Math.random() * 3) + 1);
    }
    if(Math.random() < 0.12) {
      G.marketPrices[k] = Math.round(p * 1.04);
      cpu.money -= p;
    }
    cpu.money = Math.max(0, cpu.money + (Math.random() - 0.4) * 60000);
  });
}

// 認証
function loginGoogle() {
  if(!window.firebaseAuth) { loginDemo(); return; }
  log('Firebase未設定のためデモモードで起動', 'warn');
  loginDemo();
}
function loginDemo() {
  G.uid = 'demo_' + Math.random().toString(36).substr(2, 8);
  showSetup();
}

// Firebase保存（設定済みの場合のみ）
async function saveToFirebase() {
  if(!window.firebaseDb || !G.uid) return;
  try {
    const {doc, setDoc} = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js");
    await setDoc(doc(window.firebaseDb, 'users', G.uid), {
      companyName: G.companyName,
      industryId: G.industry?.id,
      money: G.money,
      month: G.month,
      inventory: G.inventory,
      staffCount: G.staff.length,
      updatedAt: new Date(),
    });
  } catch(e) {}
}

// ユーティリティ
function calcDist(lat1, lng1, lat2, lng2) {
  const R = 6371000, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function log(msg, type='') {
  const el = document.getElementById('log');
  if(!el) return;
  const d = document.createElement('div');
  d.className = 'log-entry ' + type;
  d.textContent = msg;
  el.appendChild(d);
  while(el.children.length > 4) el.removeChild(el.firstChild);
  setTimeout(() => d.remove(), 5000);
}
