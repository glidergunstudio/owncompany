// ========== config.js ==========
// 定数・マスターデータ定義

const INDUSTRIES = [
  {id:'manufacturing', name:'製造業',     icon:'🏭', desc:'モノを作って売る'},
  {id:'agriculture',   name:'農業・食品', icon:'🌾', desc:'食料・農産物'},
  {id:'it',            name:'IT・テクノロジー', icon:'💻', desc:'人材だけでOK'},
  {id:'energy',        name:'エネルギー', icon:'⚡', desc:'電力・燃料を供給'},
  {id:'service',       name:'サービス業', icon:'🤝', desc:'人材だけでOK'},
  {id:'trading',       name:'商社・貿易', icon:'🚢', desc:'仕入れて売る'},
];

const RESOURCES = {
  iron:   {name:'鉄鉱石',   icon:'⛏️', basePrice:800},
  crop:   {name:'農作物',   icon:'🌾', basePrice:600},
  timber: {name:'木材',     icon:'🪵', basePrice:700},
  fish:   {name:'水産物',   icon:'🐟', basePrice:1000},
  coal:   {name:'石炭',     icon:'⚫', basePrice:1200},
  rare:   {name:'希少鉱物', icon:'💎', basePrice:4000},
};

const PRODUCTS = {
  steel:    {name:'鉄材',     icon:'🔩', basePrice:2500},
  food:     {name:'食料品',   icon:'🍱', basePrice:3800},
  lumber:   {name:'建材',     icon:'🏗️', basePrice:2800},
  software: {name:'ソフトウェア', icon:'📱', basePrice:5000},
  service:  {name:'サービス', icon:'🤝', basePrice:3000},
  parts:    {name:'機械部品', icon:'⚙️', basePrice:8000},
  chemical: {name:'化学品',   icon:'🧪', basePrice:12000},
  auto_car: {name:'自動車',   icon:'🚗', basePrice:35000},
  device:   {name:'電子機器', icon:'💻', basePrice:50000},
};

const EQUIPMENT_DATA = {
  factory: [
    {id:'basic',   name:'簡易工場',   icon:'🔨', level:1, cost:100000, desc:'Tier1製品を生産'},
    {id:'precise', name:'精密工場',   icon:'⚙️', level:2, cost:300000, desc:'Tier2製品を生産'},
    {id:'auto',    name:'自動化工場', icon:'🤖', level:3, cost:600000, desc:'全Tier対応・速度2倍'},
  ],
  storage: [
    {id:'basic_s',   name:'簡易倉庫', icon:'📦', cap:100, cost:50000,  desc:'在庫上限+100'},
    {id:'logistics', name:'物流倉庫', icon:'🏢', cap:300, cost:200000, desc:'在庫上限+300'},
  ],
};

const RECIPES = {
  steel:    {name:'鉄材',     icon:'🔩', tier:1, inputs:{iron:2},           output:1, time:10, factoryLv:1},
  food:     {name:'食料品',   icon:'🍱', tier:1, inputs:{crop:2, fish:1},   output:1, time:12, factoryLv:1},
  lumber:   {name:'建材',     icon:'🏗️', tier:1, inputs:{timber:3},         output:1, time:8,  factoryLv:1},
  parts:    {name:'機械部品', icon:'⚙️', tier:2, inputs:{steel:2, coal:1},  output:1, time:20, factoryLv:2},
  chemical: {name:'化学品',   icon:'🧪', tier:2, inputs:{rare:1, coal:2},   output:1, time:25, factoryLv:2},
  auto_car: {name:'自動車',   icon:'🚗', tier:3, inputs:{parts:3, lumber:1},output:1, time:60, factoryLv:3},
  device:   {name:'電子機器', icon:'💻', tier:3, inputs:{parts:2, chemical:2},output:1,time:60,factoryLv:3},
};

// スポット種別→資源の対応
const SPOT_RESOURCE_MAP = {
  'railway':     'iron',
  'park':        'timber',
  'convenience': 'crop',
  'supermarket': 'crop',
  'restaurant':  'fish',
  'museum':      'rare',
  'industrial':  'coal',
  'default':     'iron',
};

// CEO・スタッフ生成用マスター
const PARAMS_DEF = [
  {key:'leadership',  label:'🎯 リーダーシップ', color:'#00c8ff'},
  {key:'tech',        label:'🔬 技術力',         color:'#a060ff'},
  {key:'sales',       label:'📣 営業力',         color:'#00e87a'},
  {key:'finance',     label:'💰 財務センス',     color:'#ffc840'},
  {key:'negotiation', label:'🤝 交渉力',         color:'#ff8c00'},
];
const STAFF_NAMES = ['田中','佐藤','鈴木','高橋','伊藤','渡辺','山本','中村','小林','加藤'];
const STAFF_SUF   = ['太郎','花子','一郎','美咲','健二','さくら','拓也','由美'];
const SKILLS      = ['製造','営業','IT','管理','研究','物流','財務','マーケ'];
const AVATARS     = ['👨','👩','🧑','👨‍💼','👩‍💼','🧑‍💻','👨‍🔬','👩‍🔬'];
const CPU_PRE     = ['東京','大阪','名古屋','福岡','札幌','横浜','神戸','京都','広島','仙台'];
const CPU_SUF     = ['テクノ','インダストリー','コーポレーション','ホールディングス','トレード','ソリューションズ'];

const INV_MSGS = [
  ctx => `今月で${ctx.month}ヶ月目ですね。そろそろ黒字化の見通しを教えてください。`,
  ctx => `競合の${ctx.top}が好調のようです。差別化戦略はありますか？`,
  ctx => `資金残高が気になります。計画通りに進んでいますか？`,
  ctx => `期待しています！引き続き頑張ってください💪`,
  ctx => `社員数${ctx.staff}名ですね。採用計画はいかがですか？`,
  ctx => `${ctx.industry}は今まさにチャンスです！大きく攻めてください！`,
  ctx => `投資リターンを楽しみにしています。引き続きよろしく！`,
  ctx => `ライバルに差をつけるチャンスです。資金は有効活用してください。`,
];
