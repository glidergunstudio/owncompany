// ========== tick.js ==========
// ゲームループ・月次決算

let tc = 0;

function startTick() {
  setInterval(() => {
    tc++;
    tickCPU();

    // 生産キュー進行
    G.prodQueue = G.prodQueue.filter(q => {
      q.progress++;
      if(q.progress >= q.total) {
        const r = RECIPES[q.key];
        G.inventory[q.key] = (G.inventory[q.key] || 0) + r.output;
        log(`✅ ${r.icon}${r.name}の生産完了！市場で売却しましょう`, 'ok');
        return false;
      }
      return true;
    });
    if(document.getElementById('panel-production')?.classList.contains('open')) renderProduction();

    // 市場価格ゆらぎ（12秒ごと）
    if(tc % 12 === 0) {
      const ks = [...Object.keys(RESOURCES), ...Object.keys(PRODUCTS)];
      const k  = ks[Math.floor(Math.random() * ks.length)];
      const info = RESOURCES[k] || PRODUCTS[k];
      G.marketPrices[k] = Math.max(
        Math.round(info.basePrice * 0.4),
        Math.round((G.marketPrices[k] || info.basePrice) * (1 + (Math.random()-0.5) * 0.1))
      );
    }

    // 月次決算（60秒 = 1ヶ月）
    if(tc % 60 === 0) doMonthly();

    updateHeader();
  }, 1000);
}

function doMonthly() {
  const sal  = totalSalary();
  const elec = calcElectric();
  G.money -= sal + elec;
  G.month++;
  G.financeHistory.push({month: G.month-1, salary:-sal, electric:-elec, net:-(sal+elec)});

  if(G.money <= 0 && !G.debugMode) {
    G.money = 0;
    showBankruptcy();
    return;
  }

  document.getElementById('notice-content').innerHTML = `
    <div class="fin-row"><span class="fin-label">給与支払い</span><span class="fin-val neg">-¥${sal.toLocaleString()}</span></div>
    <div class="fin-row"><span class="fin-label">電気代</span><span class="fin-val neg">-¥${elec.toLocaleString()}</span></div>
    <div class="fin-row"><span class="fin-label">残高</span><span class="fin-val gld">¥${G.money.toLocaleString()}</span></div>
    ${G.money < (sal+elec)*2 && !G.debugMode ? '<div style="color:var(--red);font-size:0.72rem;margin-top:6px">⚠️ 資金が危険水準です！</div>' : ''}`;
  document.getElementById('monthly-notice').style.display = 'block';

  // 投資家メッセージ（3ヶ月ごと）
  if(G.fundMode === 'investor' && G.month % 3 === 0) {
    setTimeout(() => showInvMsg(), 2000);
  }

  updateHeader();
  saveToFirebase();
}
