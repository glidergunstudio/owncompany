// ========== market.js ==========
// 共通市場・売買

function renderMarket() {
  document.getElementById('market-list').innerHTML = Object.entries({...RESOURCES, ...PRODUCTS}).map(([k, info]) => {
    const p   = G.marketPrices[k];
    const pct = ((p - info.basePrice) / info.basePrice * 100).toFixed(0);
    const cls = pct > 0 ? 'price-up' : pct < 0 ? 'price-dn' : '';
    const arr = pct > 0 ? '↑' : pct < 0 ? '↓' : '→';
    const cnt = G.inventory[k] || 0;
    return `<div class="mkt-card">
      <div class="mkt-left">
        <span class="mkt-icon">${info.icon}</span>
        <div>
          <div class="mkt-name">${info.name}</div>
          <div class="mkt-price ${cls}">¥${p.toLocaleString()} ${arr}${Math.abs(pct)}%　在庫:${cnt}</div>
        </div>
      </div>
      <div class="mkt-btns">
        <button class="mbt mbt-s" onclick="sell('${k}')" ${cnt > 0 ? '' : 'disabled'}>売</button>
        <button class="mbt mbt-b" onclick="buy('${k}')">買</button>
      </div>
    </div>`;
  }).join('');
}

function sell(k) {
  if(!G.inventory[k] || G.inventory[k] <= 0) return;
  const info = RESOURCES[k] || PRODUCTS[k];
  const p = G.marketPrices[k];
  G.inventory[k]--;
  G.money += p;
  G.marketPrices[k] = Math.max(Math.round(p * 0.93), Math.round(info.basePrice * 0.4));
  log(`${info.icon} ${info.name}を ¥${p.toLocaleString()} で売却`, 'ok');
  updateHeader();
  renderMarket();
  saveToFirebase();
}

function buy(k) {
  const info = RESOURCES[k] || PRODUCTS[k];
  const p = G.marketPrices[k];
  if(G.money < p && !G.debugMode) { log('資金不足です', 'err'); return; }
  if(!G.debugMode) G.money -= p;
  G.inventory[k] = (G.inventory[k] || 0) + 1;
  G.marketPrices[k] = Math.round(p * 1.07);
  log(`${info.icon} ${info.name}を ¥${p.toLocaleString()} で購入`, '');
  updateHeader();
  renderMarket();
  saveToFirebase();
}
