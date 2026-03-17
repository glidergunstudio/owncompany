// ========== ui.js ==========
// ヘッダー・パネル・各種表示

function updateHeader() {
  const m = G.money;
  document.getElementById('h-company').textContent  = (G.debugMode ? '🐛 ' : '') + (G.companyName || '---');
  document.getElementById('h-industry').textContent = G.industry?.name || '---';
  document.getElementById('h-money').textContent    = m >= 1000000 ? `¥${(m/1000000).toFixed(1)}M` : `¥${Math.floor(m/1000)}K`;
  document.getElementById('h-staff').textContent    = G.staff.length;
  document.getElementById('h-month').textContent    = G.month;
  const fixed = totalSalary() + calcElectric();
  document.getElementById('h-salary').textContent   = `-¥${Math.floor(fixed/1000)}K`;
}

// パネル切替
let activePanel = null;
function showPanel(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('nav-' + name)?.classList.add('active');

  if(name === 'map') {
    if(activePanel) {
      activePanel.classList.remove('open');
      setTimeout(() => { if(!activePanel?.classList.contains('open')) activePanel.style.display = 'none'; }, 280);
      activePanel = null;
    }
    return;
  }

  const panel = document.getElementById('panel-' + name);
  if(!panel) return;
  if(activePanel && activePanel !== panel) {
    activePanel.classList.remove('open');
    setTimeout(() => { if(!activePanel?.classList.contains('open')) activePanel.style.display = 'none'; }, 280);
  }
  panel.style.display = 'block';
  requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('open')));
  activePanel = panel;

  if(name === 'inventory')  renderInventory();
  if(name === 'staff')      renderStaff();
  if(name === 'market')     renderMarket();
  if(name === 'equipment')  renderEquipment();
  if(name === 'production') renderProduction();
  if(name === 'ranking')    renderRanking();
}

// 在庫
function renderInventory() {
  document.getElementById('inv-resources').innerHTML = Object.entries(RESOURCES).map(([k,v]) =>
    `<div class="inv-card"><div class="inv-icon">${v.icon}</div><div class="inv-name">${v.name}</div><div class="inv-count">${G.inventory[k]||0}</div></div>`
  ).join('');
  document.getElementById('inv-products').innerHTML = Object.entries(PRODUCTS).map(([k,v]) =>
    `<div class="inv-card"><div class="inv-icon">${v.icon}</div><div class="inv-name">${v.name}</div><div class="inv-count">${G.inventory[k]||0}</div></div>`
  ).join('');
}

// 人材
function renderStaff() {
  const sal = totalSalary();
  document.getElementById('staff-count-label').textContent = `(${G.staff.length}名 / 月給¥${sal.toLocaleString()})`;
  document.getElementById('staff-list').innerHTML = G.staff.map((s, i) => `
    <div class="staff-card ${s.isCEO ? 'is-ceo' : ''}">
      <div class="staff-avatar">${s.avatar}</div>
      <div class="staff-info">
        <div class="staff-name">${s.name}${s.isCEO ? ' 👑 CEO' : ''}</div>
        <div class="staff-role">生産効率+${s.productionBonus}% | 採用力:${s.recruitSkill}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">
          ${s.skills.map(sk => `<span class="skill-tag ${s.isCEO?'ceo':''}">${sk}</span>`).join('')}
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-family:Rajdhani,sans-serif;font-size:0.78rem;color:var(--gold);white-space:nowrap">
          ${s.isCEO ? '報酬なし' : '¥' + s.salary.toLocaleString() + '/月'}
        </div>
        ${s.isCEO ? '' : `<button onclick="fireStaff(${i})" style="margin-top:4px;font-size:0.58rem;background:transparent;border:1px solid var(--border);color:var(--dim);border-radius:4px;padding:2px 5px;cursor:pointer">解雇</button>`}
      </div>
    </div>`
  ).join('');
}

// ランキング
function renderRanking() {
  const all = [
    {name:G.companyName, money:G.money, staffCount:G.staff.length, industry:G.industry?.name, color:'var(--accent)', isPlayer:true},
    ...G.cpuCompanies.map(c => ({name:c.name, money:c.money, staffCount:c.staffCount, industry:c.industry.name, color:c.color, isPlayer:false}))
  ].sort((a, b) => b.money - a.money);
  const max = Math.max(...all.map(c => c.money));

  document.getElementById('ranking-list').innerHTML = all.map((c, i) => `
    <div class="rank-card" style="${c.isPlayer ? 'border-color:var(--accent);background:rgba(0,200,255,0.04)' : ''}">
      <div class="rank-header">
        <span class="rank-name" style="color:${c.color}">${c.isPlayer ? '🟦 ' : ''}${c.name}</span>
        <span class="rank-num">#${i+1}</span>
      </div>
      <div class="rank-bar-bg"><div class="rank-bar" style="width:${Math.round(c.money/max*100)}%;background:${c.color}"></div></div>
      <div class="rank-stats">
        <span>💴 ¥${Math.floor(c.money/10000)}万</span>
        <span>👥 ${c.staffCount}名</span>
        <span>${c.industry}</span>
        ${c.isPlayer ? '<span style="color:var(--accent)">← あなた</span>' : ''}
      </div>
    </div>`
  ).join('');
}

// 月次通知
function closeMonthly() {
  document.getElementById('monthly-notice').style.display = 'none';
}

// 倒産
function showBankruptcy() {
  document.body.innerHTML = `
    <div style="position:fixed;inset:0;background:#07090f;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-family:'Noto Sans JP',sans-serif;">
      <div style="font-size:3rem">💀</div>
      <div style="font-family:'Rajdhani',sans-serif;font-size:2rem;color:#ff4060;letter-spacing:2px">GAME OVER</div>
      <div style="color:#3a5878;font-size:0.85rem">${G.companyName} は倒産しました</div>
      <div style="color:#3a5878;font-size:0.78rem">${G.month}ヶ月間の経営でした</div>
      <button onclick="location.reload()"
        style="margin-top:16px;padding:12px 32px;border-radius:8px;border:1px solid #00c8ff;background:rgba(0,200,255,0.1);color:#00c8ff;font-size:0.9rem;cursor:pointer;font-family:'Noto Sans JP',sans-serif;">
        🔄 もう一度挑戦
      </button>
    </div>`;
}
