// ========== seminar.js ==========
// 説明会・人材採用

function openSeminar(lat, lng) {
  const cost = calcDist(G.lat, G.lng, lat, lng) < 1000 ? 50000 : 30000;
  const opts = G.staff.map((s, i) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
      <span style="font-size:0.78rem">${s.avatar} ${s.name}${s.isCEO?' 👑':''}　採用力:${s.recruitSkill}</span>
      <button onclick="runSeminar(${i},${lat},${lng},${cost})"
        style="padding:4px 10px;border-radius:5px;border:1px solid var(--green);background:rgba(0,232,122,0.1);color:var(--green);font-size:0.7rem;cursor:pointer;font-family:'Noto Sans JP',sans-serif">
        担当にする
      </button>
    </div>`
  ).join('');

  document.getElementById('seminar-content').innerHTML = `
    <div class="seminar-title">🎙️ 説明会を開催</div>
    <div class="seminar-meta">開催コスト: ¥${cost.toLocaleString()} | 担当者を選んでください</div>
    ${opts}
    <button class="close-btn" onclick="closeSeminar()">キャンセル</button>`;
  document.getElementById('seminar-modal').classList.add('open');
}

function runSeminar(si, lat, lng, cost) {
  if(G.money < cost && !G.debugMode) { log('資金が足りません', 'err'); closeSeminar(); return; }
  if(!G.debugMode) G.money -= cost;
  updateHeader();

  const s = G.staff[si];
  const skill = s ? s.recruitSkill : 3;
  const count = Math.max(1, Math.floor(Math.random() * skill) + 1);
  const cands = Array.from({length: count}, () => genCand());

  // candidatesをwindow一時保存（JSONパース問題を回避）
  window._seminarCands = cands;

  document.getElementById('seminar-content').innerHTML = `
    <div class="seminar-title">🎙️ 説明会の結果</div>
    <div class="seminar-meta">${count}人が集まりました！採用する人を選んでください</div>
    ${cands.map((c, i) => `
      <div class="candidate-card">
        <div class="cand-header">
          <span class="cand-name">${c.avatar} ${c.name}</span>
          <span class="cand-salary">月給 ¥${c.salary.toLocaleString()}</span>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
          ${c.skills.map(sk => `<span class="skill-tag">${sk}</span>`).join('')}
        </div>
        <div style="font-size:0.63rem;color:var(--dim);margin-bottom:6px">
          生産効率+${c.productionBonus}% | 採用力:${c.recruitSkill}
        </div>
        <button class="hire-btn" id="hb${i}" onclick="hireByIdx(${i},'hb${i}')">✅ 採用する</button>
      </div>`).join('')}
    <button class="close-btn" onclick="closeSeminar()">説明会を終了</button>`;
  document.getElementById('seminar-modal').classList.add('open');
}

function genCand() {
  const n = STAFF_NAMES[Math.floor(Math.random() * STAFF_NAMES.length)]
          + STAFF_SUF[Math.floor(Math.random() * STAFF_SUF.length)];
  const sc = Math.floor(Math.random() * 3) + 1;
  const skills = [...new Set(Array.from({length: sc}, () => SKILLS[Math.floor(Math.random() * SKILLS.length)]))];
  const lv = Math.floor(Math.random() * 8) + 1;
  return {
    id: Date.now() + Math.random(),
    name: n, skills,
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    level: lv,
    salary: lv * 80000 + Math.floor(Math.random() * 50000),
    productionBonus: lv * 8,
    recruitSkill: Math.floor(Math.random() * 8) + 1,
  };
}

function hireByIdx(idx, btnId) {
  const c = window._seminarCands && window._seminarCands[idx];
  if(!c) { log('採用に失敗しました', 'err'); return; }
  hire(c, btnId);
}

function hire(c, btnId) {
  G.staff.push(c);
  const b = document.getElementById(btnId);
  if(b) { b.disabled = true; b.textContent = '✅ 採用済み'; }
  log(`🎉 ${c.avatar}${c.name}を採用！月給¥${c.salary.toLocaleString()}`, 'ok');
  updateHeader();
  saveToFirebase();
}

function fireStaff(i) {
  const s = G.staff[i];
  if(s.isCEO) return;
  if(!confirm(`${s.name}を解雇しますか？`)) return;
  G.staff.splice(i, 1);
  log(`${s.name}が退職しました`, 'warn');
  renderStaff();
  updateHeader();
  saveToFirebase();
}

function closeSeminar() {
  document.getElementById('seminar-modal').classList.remove('open');
}
