// ========== setup.js ==========
// 会社設立画面

let selFund = null, selInd = null, ceoP = {};

function showSetup() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('setup-screen').style.display = 'flex';
  document.getElementById('industry-grid').innerHTML = INDUSTRIES.map(i =>
    `<div class="industry-card" id="ind-${i.id}" onclick="selIndustry('${i.id}')">
      <div class="industry-icon">${i.icon}</div>
      <div class="industry-name">${i.name}</div>
      <div class="industry-desc">${i.desc}</div>
    </div>`
  ).join('');
  rerollCEO();
}

function selectFund(m) {
  selFund = m;
  document.querySelectorAll('.fund-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('fund-' + m)?.classList.add('selected');
}

function selIndustry(id) {
  selInd = id;
  document.querySelectorAll('.industry-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('ind-' + id)?.classList.add('selected');
}

function rerollCEO() {
  PARAMS_DEF.forEach(p => { ceoP[p.key] = Math.floor(Math.random() * 4) + 6; });
  renderCEOBox();
}

function renderCEOBox() {
  document.getElementById('ceo-param-box').innerHTML = `
    <div class="ceo-header-row">
      <div style="font-size:2rem">👑</div>
      <div>
        <div style="font-size:0.9rem;font-weight:700;color:var(--gold)">CEO（あなた）</div>
        <div style="font-size:0.63rem;color:var(--dim)">全パラメータが高めにランダム決定</div>
      </div>
    </div>
    ${PARAMS_DEF.map(p => `
      <div class="param-row">
        <span class="param-label">${p.label}</span>
        <div class="param-bar-bg"><div class="param-bar" style="width:${ceoP[p.key]*10}%;background:${p.color}"></div></div>
        <span class="param-num" style="color:${p.color}">${ceoP[p.key]}</span>
      </div>`).join('')}`;
}

function startGame() {
  const cn   = document.getElementById('company-name').value.trim();
  const ceon = document.getElementById('ceo-name').value.trim();
  if(!selFund)  { alert('初期資金を選んでください'); return; }
  if(!selInd)   { alert('業種を選んでください'); return; }
  if(!cn)       { alert('会社名を入力してください'); return; }
  if(!ceon)     { alert('あなたの名前を入力してください'); return; }

  G.companyName = cn;
  G.ceoName     = ceon;
  G.industry    = INDUSTRIES.find(i => i.id === selInd);
  G.fundMode    = selFund;
  G.money       = selFund === 'investor' ? 5000000 : 500000;
  G.params      = {...ceoP};
  G.debugMode   = document.getElementById('debug-mode')?.checked || false;
  if(G.debugMode) G.money = 999999999;

  // CEO登録
  G.staff = [{
    id: 'ceo', name: ceon, avatar: '👑', isCEO: true,
    skills: ['製造','営業','IT'],
    level: 9, salary: 0,
    productionBonus: Math.max(...Object.values(ceoP)) * 8,
    recruitSkill: ceoP.leadership,
  }];

  initMarketPrices();
  genCPU();

  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('main-ui').style.display = 'block';

  initMap();
  updateHeader();
  startTick();

  log(`🎉 ${G.companyName} 創業！${G.fundMode === 'investor' ? '投資家から¥5Mの支援を受けました' : '自己資金¥500Kでスタート'}`, 'ok');
  if(G.debugMode) log('🐛 デバッグモード有効：資金・資源無制限', 'warn');
  if(G.fundMode === 'investor') setTimeout(() => showInvMsg(), 3000);
}

function showInvMsg() {
  const sorted = [...G.cpuCompanies].sort((a,b) => b.money - a.money);
  const msg = INV_MSGS[Math.floor(Math.random() * INV_MSGS.length)]({
    month: G.month, top: sorted[0]?.name || '競合',
    staff: G.staff.length, industry: G.industry?.name,
  });
  document.getElementById('investor-msg-body').textContent = msg;
  document.getElementById('investor-toast').style.display = 'block';
  setTimeout(() => closeInvestorToast(), 12000);
}
function closeInvestorToast() {
  document.getElementById('investor-toast').style.display = 'none';
}
