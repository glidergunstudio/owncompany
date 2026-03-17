// ========== equipment.js ==========
// 設備スロット・生産キュー

function renderEquipment() {
  function makeSlots(type, list, elId) {
    document.getElementById(elId).innerHTML = G.slots[type].map((slot, i) => {
      if(slot.eq) {
        const eq = list.find(e => e.id === slot.eq);
        return `<div style="background:var(--surface2);border:1px solid var(--green);border-radius:9px;padding:10px;margin-bottom:6px;display:flex;gap:8px;align-items:center">
          <span style="font-size:1.5rem">${eq.icon}</span>
          <div style="flex:1">
            <b style="font-size:0.8rem">${eq.name}</b>
            <div style="font-size:0.62rem;color:var(--dim)">${eq.desc}</div>
          </div>
          <span style="font-size:0.62rem;color:var(--green);border:1px solid rgba(0,232,122,0.3);padding:2px 5px;border-radius:4px">稼働中</span>
          <button onclick="removeEq('${type}',${i})"
            style="font-size:0.6rem;background:transparent;border:1px solid var(--border);color:var(--dim);border-radius:4px;padding:2px 5px;cursor:pointer">撤去</button>
        </div>`;
      }
      return `<div style="background:var(--surface2);border:1px dashed var(--border);border-radius:9px;padding:10px;margin-bottom:6px;display:flex;gap:8px;align-items:center">
        <span style="font-size:1.5rem;opacity:0.3">➕</span>
        <div style="flex:1;font-size:0.75rem;color:var(--dim)">空きスロット ${i+1}</div>
        <button onclick="openInstall('${type}',${i})"
          style="font-size:0.7rem;background:rgba(0,200,255,0.1);border:1px solid var(--accent);color:var(--accent);border-radius:5px;padding:4px 8px;cursor:pointer">設置する</button>
      </div>`;
    }).join('');
  }
  makeSlots('factory', EQUIPMENT_DATA.factory, 'slot-factory');
  makeSlots('storage', EQUIPMENT_DATA.storage, 'slot-storage');

  // 電気代表示
  const elec = calcElectric();
  const el   = document.getElementById('electric-info');
  if(el) {
    const fc = G.slots.factory.filter(s => s.eq).length;
    const sc = Math.max(0, G.staff.length - 1);
    el.innerHTML = `工場 ${fc}台: <span style="color:var(--red)">-¥${(fc*50000).toLocaleString()}</span>　`
      + `社員 ${sc}名: <span style="color:var(--red)">-¥${(sc*5000).toLocaleString()}</span><br>`
      + `<b style="color:var(--red)">月次電気代合計: -¥${elec.toLocaleString()}</b>`;
  }
}

function openInstall(type, idx) {
  const list = EQUIPMENT_DATA[type];
  const opts = list.map(eq => {
    const ok = G.money >= eq.cost || G.debugMode;
    return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span>${eq.icon} <b>${eq.name}</b></span>
        <span style="font-family:Rajdhani,sans-serif;color:var(--gold)">¥${eq.cost.toLocaleString()}</span>
      </div>
      <div style="font-size:0.65rem;color:var(--dim);margin-bottom:6px">${eq.desc}</div>
      <button onclick="installEq('${type}',${idx},'${eq.id}')" ${ok?'':'disabled'}
        style="width:100%;padding:6px;border-radius:5px;border:1px solid ${ok?'var(--accent)':'var(--border)'};background:${ok?'rgba(0,200,255,0.1)':'transparent'};color:${ok?'var(--accent)':'var(--dim)'};cursor:${ok?'pointer':'default'};">
        ${ok ? '設置する' : '資金不足'}
      </button>
    </div>`;
  }).join('');

  document.getElementById('slot-' + type).innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--accent);border-radius:10px;padding:12px">
      <div style="font-size:0.8rem;font-weight:700;color:var(--accent);margin-bottom:8px">スロット${idx+1}に設置する設備を選択</div>
      ${opts}
      <button onclick="renderEquipment()"
        style="width:100%;padding:6px;border-radius:5px;border:1px solid var(--border);background:transparent;color:var(--dim);cursor:pointer;margin-top:4px">キャンセル</button>
    </div>`;
}

function installEq(type, idx, eqId) {
  const eq = EQUIPMENT_DATA[type].find(e => e.id === eqId);
  if(!eq) return;
  if(G.money < eq.cost && !G.debugMode) { log('資金不足です', 'err'); return; }
  if(!G.debugMode) G.money -= eq.cost;
  G.slots[type][idx].eq = eqId;
  log(`${eq.icon} ${eq.name}を設置しました！`, 'ok');
  renderEquipment();
  updateHeader();
}

function removeEq(type, idx) {
  const eq = EQUIPMENT_DATA[type].find(e => e.id === G.slots[type][idx].eq);
  G.slots[type][idx].eq = null;
  if(eq) log(`${eq.name}を撤去しました`, 'warn');
  renderEquipment();
}

// ===== 生産 =====
function renderProduction() {
  const eq = getEqState();

  // キュー
  const qEl = document.getElementById('prod-queue');
  if(G.prodQueue.length === 0) {
    qEl.innerHTML = '<div style="color:var(--dim);font-size:0.8rem;padding:8px 0">生産中のアイテムはありません<br><span style="font-size:0.7rem">設備タブで工場を設置してください</span></div>';
  } else {
    qEl.innerHTML = G.prodQueue.map(q => {
      const r = RECIPES[q.key];
      const pct = Math.round(q.progress / q.total * 100);
      return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:10px;margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:0.82rem;font-weight:700">${r.icon} ${r.name}</span>
          <span style="font-size:0.7rem;color:var(--dim)">${pct}%</span>
        </div>
        <div style="background:rgba(0,0,0,0.3);border-radius:3px;height:6px">
          <div style="height:6px;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--green));width:${pct}%;transition:width 0.5s"></div>
        </div>
      </div>`;
    }).join('');
  }

  // レシピ一覧
  const rEl = document.getElementById('recipe-list');
  rEl.innerHTML = Object.entries(RECIPES).map(([key, r]) => {
    const hasFactory = eq.factoryLv >= r.factoryLv;
    const inputs = Object.entries(r.inputs).map(([k, n]) => {
      const info = RESOURCES[k] || PRODUCTS[k];
      const have = G.inventory[k] || 0;
      const ok   = have >= n;
      return `<span style="font-size:0.68rem;padding:1px 5px;border-radius:3px;background:${ok?'rgba(0,232,122,0.12)':'rgba(255,64,96,0.12)'};color:${ok?'var(--green)':'var(--red)'};border:1px solid ${ok?'rgba(0,232,122,0.3)':'rgba(255,64,96,0.3)'}">
        ${info.icon}×${n}(${have})
      </span>`;
    }).join(' ');
    const canMake = hasFactory && Object.entries(r.inputs).every(([k,n]) => (G.inventory[k]||0) >= n);
    return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:10px;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <span style="font-size:0.85rem;font-weight:700">${r.icon} ${r.name} <span style="font-size:0.6rem;color:var(--dim)">Tier${r.tier}</span></span>
        <span style="font-family:Rajdhani,sans-serif;font-size:0.75rem;color:var(--gold)">¥${(G.marketPrices[key]||0).toLocaleString()}</span>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${inputs}</div>
      ${hasFactory ? '' : `<div style="font-size:0.65rem;color:var(--red);margin-bottom:4px">⚠️ 工場Lv${r.factoryLv}以上が必要</div>`}
      <button onclick="startProd('${key}')" ${canMake?'':'disabled'}
        style="width:100%;padding:7px;border-radius:6px;border:1px solid ${canMake?'var(--green)':'var(--border)'};background:${canMake?'rgba(0,232,122,0.1)':'transparent'};color:${canMake?'var(--green)':'var(--dim)'};font-size:0.75rem;cursor:${canMake?'pointer':'default'};">
        ⚙️ 生産開始（${r.time}秒）
      </button>
    </div>`;
  }).join('');
}

function startProd(key) {
  const r  = RECIPES[key];
  const eq = getEqState();
  if(eq.factoryLv < r.factoryLv) { log('工場レベルが足りません', 'err'); return; }
  if(!Object.entries(r.inputs).every(([k,n]) => (G.inventory[k]||0) >= n)) { log('素材が不足しています', 'err'); return; }
  Object.entries(r.inputs).forEach(([k,n]) => { G.inventory[k] -= n; });
  const bonus     = 1 + G.staff.filter(s => s.skills.includes('製造') || s.skills.includes('IT')).length * 0.1;
  const totalTime = G.debugMode ? 3 : Math.max(5, Math.round(r.time / bonus));
  G.prodQueue.push({key, progress:0, total:totalTime});
  log(`⚙️ ${r.icon}${r.name}の生産を開始！（${totalTime}秒）`, 'ok');
  renderProduction();
  updateHeader();
}
