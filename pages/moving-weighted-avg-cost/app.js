const {createApp, reactive, ref, computed, onMounted, onUnmounted} = Vue;

// 仓库元数据：编码 + 属性。仅海外仓、平台仓涉及头程成本
const warehouseMeta = {
  '东莞2仓': {code:'DG02', attr:'自营仓'},
  'SZ01东莞仓': {code:'SZ01', attr:'平台仓'},
  '深圳采购仓': {code:'SZCG', attr:'供应商仓'},
  '跨越美国洛杉矶仓': {code:'KY-LAX-01', attr:'海外仓'},
  '东莞退货仓': {code:'DGTH', attr:'退货仓'},
  'SZ01退货仓': {code:'SZTH', attr:'退货仓'}
};
const whMeta = name => warehouseMeta[name] || {code:'—', attr:''};
const whLabel = name => `${name}（${whMeta(name).code}）`;
const mappedSku = row => whMeta(row.warehouse).attr === '平台仓' ? row.fnsku : row.overseasSku;
// 头程成本只发生在海外仓与平台仓
const hasFreight = row => ['海外仓', '平台仓'].includes(whMeta(row.warehouse).attr);

const _seed = [
  {id:1, sku:'010724', overseasSku:'US-010724', fnsku:'B08WM8960A', product:'1套1件 WM8960 音频编解码模块支持 STM32', warehouse:'东莞2仓', type:'良品仓', qty:120, amount:4963.20, freight:528.00, lastInboundAt:'2026-10-30 09:26'},
  {id:2, sku:'FBBA0032-001', overseasSku:'US-FBBA0032', fnsku:'B0ESP32C6Z', product:'ESP32-C6-Zero 开发板 WiFi6 蓝牙模块', warehouse:'东莞2仓', type:'良品仓', qty:86, amount:1977.14, freight:215.00, lastInboundAt:'2026-10-30 10:08'},
  {id:3, sku:'FBCB0015-001', overseasSku:'US-FBCB0015', fnsku:'B0RP2350LC', product:'RP2350-LCD-0.96 微控制器开发板', warehouse:'东莞2仓', type:'良品仓', qty:40, amount:1740.00, freight:96.00, lastInboundAt:'2026-10-29 14:32'},
  {id:4, sku:'X-HX0042B', overseasSku:'US-HX0042B', fnsku:'B0CHG4242B', product:'TYPE-C 5-9V 5-20W 无线充电器模块', warehouse:'SZ01东莞仓', type:'良品仓', qty:230, amount:4278.00, freight:230.00, lastInboundAt:'2026-10-31 08:42'},
  {id:5, sku:'XJ0058-03', overseasSku:'US-XJ005803', fnsku:'B0XJ005803', product:'无线充电器模块发射端 PCBA 电路板', warehouse:'SZ01东莞仓', type:'良品仓', qty:500, amount:4250.00, freight:450.00, lastInboundAt:'2026-10-31 08:45'},
  {id:6, sku:'KBAB0057-009', overseasSku:'US-KBAB0057', fnsku:'B0WELDMASK', product:'重型牛皮阻燃焊接头罩自动变光款', warehouse:'跨越美国洛杉矶仓', type:'良品仓', qty:320, amount:27520.00, freight:2880.00, lastInboundAt:'2026-10-28 13:15'},
  {id:7, sku:'SPU-1001-BL', overseasSku:'US-SPU1001BL', fnsku:'B0CASE1001', product:'蓝牙耳机硅胶保护套（黑）', warehouse:'东莞2仓', type:'良品仓', qty:1500, amount:6735.00, freight:750.00, lastInboundAt:'2026-10-30 16:20'},
  {id:8, sku:'SPU-3002', overseasSku:'US-SPU3002', fnsku:'B0CLOTH302', product:'多功能清洁布 50 片装', warehouse:'SZ01东莞仓', type:'良品仓', qty:800, amount:2896.00, freight:320.00, lastInboundAt:'2026-10-29 11:05'},
  {id:9, sku:'010725', overseasSku:'US-010725', fnsku:'B0WM8960BM', product:'1套1件 WM8960 音频模块（带咪头版）', warehouse:'深圳采购仓', type:'良品仓', qty:60, amount:2586.00, freight:270.00, lastInboundAt:'2026-10-27 17:40'},
  {id:10, sku:'RET-010724', overseasSku:'—', fnsku:'—', product:'WM8960 音频模块（退货）', warehouse:'东莞退货仓', type:'退货仓', qty:18, amount:0, freight:0, lastInboundAt:'2026-10-28 11:20'},
  {id:11, sku:'RET-FBBA0032', overseasSku:'—', fnsku:'—', product:'ESP32-C6-Zero 开发板（退货）', warehouse:'东莞退货仓', type:'退货仓', qty:5, amount:0, freight:0, lastInboundAt:'2026-10-27 09:10'},
  {id:12, sku:'RET-XJ0058', overseasSku:'—', fnsku:'—', product:'PCBA 电路板（退货）', warehouse:'SZ01退货仓', type:'退货仓', qty:32, amount:0, freight:0, lastInboundAt:'2026-10-26 15:33'}
];

// 追加生成数据，让列表更饱满（确定性生成，无随机）
const goodTemplates = _seed.filter(r => r.type === '良品仓');
const whPool = ['东莞2仓', 'SZ01东莞仓', '跨越美国洛杉矶仓'];
const extraList = [];
for (let i = 0; i < 36; i++) {
  const n = i + 1;
  const t = goodTemplates[i % goodTemplates.length];
  const seq = String(n).padStart(2, '0');
  const qty = 40 + ((t.qty + n * 137) % 880);
  const unit = Math.round((t.amount / t.qty) * 100) / 100 + (n % 5) * 0.6;
  const amount = Math.round(qty * unit * 100) / 100;
  const freight = Math.round(qty * (t.freight / t.qty) * 100) / 100;
  extraList.push({
    id: 900 + n,
    sku: t.sku + '-S' + seq,
    overseasSku: 'US-' + t.sku + '-S' + seq,
    fnsku: 'B0' + t.fnsku.slice(2) + seq,
    product: t.product + '（批次 ' + n + '）',
    warehouse: whPool[n % whPool.length],
    type: '良品仓',
    qty: qty,
    amount: amount,
    freight: freight,
    lastInboundAt: '2026-10-' + String(19 + (n % 8)).padStart(2, '0') + ' ' + String(8 + ((n * 3) % 9)).padStart(2, '0') + ':' + String((n * 17) % 60).padStart(2, '0')
  });
}

const rows = [..._seed, ...extraList].map(r => ({...r, avgPrice: r.qty > 0 ? r.amount / r.qty : 0, freightAvg: r.qty > 0 ? r.freight / r.qty : 0}));
// 非海外仓/平台仓不产生头程成本，头程金额与加权价归零
rows.forEach(r => { if (!hasFreight(r)) { r.freight = 0; r.freightAvg = 0; } });

// 部分行展示完整单据链：货物成本（期初初始化/采购入库/采购收货/调整单/冲抵单）与头程成本（期初/头程费用分摊/头程费用调整）
const richHistories = {
  1: {
    goods: [
      {time:'2026-10-08 09:00', docType:'期初初始化', docNo:'期初-INIT-010724', before:0, qty:100, amount:4000.00, after:40.0000},
      {time:'2026-10-28 11:20', docType:'采购收货', docNo:'PO26102800341', before:40.0000, qty:20, amount:963.20, after:41.3600}
    ],
    freight: [
      {time:'2026-10-08 09:00', docType:'期初初始化', docNo:'期初-INIT-010724', before:0, qty:100, amount:400.00, after:4.0000},
      {time:'2026-10-30 09:26', docType:'海外上架', docNo:'FT26103000072', before:4.0000, qty:20, amount:128.00, after:4.4000}
    ]
  },
  6: {
    goods: [
      {time:'2026-10-09 08:30', docType:'期初初始化', docNo:'期初-INIT-KBAB', before:0, qty:300, amount:26400.00, after:88.0000},
      {time:'2026-10-20 15:45', docType:'采购入库', docNo:'RK26102000112', before:88.0000, qty:40, amount:3360.00, after:86.0000},
      {time:'2026-10-26 10:05', docType:'调整单', docNo:'TZ26102600019', before:86.0000, qty:0, amount:-240.00, after:86.0000}
    ],
    freight: [
      {time:'2026-10-09 08:30', docType:'期初初始化', docNo:'期初-INIT-KBAB', before:0, qty:300, amount:2400.00, after:8.0000},
      {time:'2026-10-28 13:15', docType:'海外上架', docNo:'FT26102800120', before:8.0000, qty:40, amount:480.00, after:9.0000},
      {time:'2026-10-29 16:40', docType:'头程费用调整', docNo:'FTTZ26102900006', before:9.0000, qty:0, amount:-320.00, after:9.0000}
    ]
  },
  10: {
    goods: [
      {time:'2026-10-15 09:00', docType:'期初初始化', docNo:'期初-退货', before:0, qty:15, amount:0, after:0},
      {time:'2026-10-28 11:20', docType:'采购收货', docNo:'TH26102800211', before:0, qty:3, amount:0, after:0}
    ],
    freight: [
      {time:'2026-10-15 09:00', docType:'期初初始化', docNo:'期初-退货', before:0, qty:15, amount:0, after:0}
    ]
  }
};
// 无头程成本的仓库，其历史里的头程记录不成立，统一清空
rows.forEach(r => { if (richHistories[r.id] && !hasFreight(r)) richHistories[r.id] = {goods: richHistories[r.id].goods, freight: []}; });

function historyFor(row) {
  const unit = row.avgPrice || 0, fUnit = row.freightAvg || 0;
  if (row.type === '退货仓') {
    const zero = [{time:'2026-10-15 09:00', docType:'期初初始化', docNo:'期初-退货', before:0, qty:row.qty, amount:0, after:0}];
    return {goods:zero, freight:[]};
  }
  const initQty = Math.round(row.qty * 0.6);
  const lastQty = row.qty - initQty;
  // 让每个 SKU 最近一次入库都有确定性的涨跌（货物 ±5%、头程 ±4%）
  const gRate = (((row.id * 37) % 11) - 5) / 100;
  const fRate = (((row.id * 53) % 9) - 4) / 100;
  const prevUnit = +(unit * (1 - gRate)).toFixed(4);
  const prevFUnit = +(fUnit * (1 - fRate)).toFixed(4);
  const initAmount = +(initQty * prevUnit).toFixed(2);
  const lastAmount = +(row.amount - initAmount).toFixed(2);
  const initFreight = +(initQty * prevFUnit).toFixed(2);
  const lastFreight = +(row.freight - initFreight).toFixed(2);
  const inTime = row.lastInboundAt ? row.lastInboundAt.replace(/\d{2}:\d{2}$/, '10:00') : '2026-10-28 10:00';
  return {
    goods: [
      {time:'2026-10-08 09:00', docType:'期初初始化', docNo:'期初-INIT', before:0, qty:initQty, amount:initAmount, after:prevUnit},
      {time:inTime, docType:'采购收货', docNo:'PO' + row.id + '-IN', before:prevUnit, qty:lastQty, amount:lastAmount, after:unit}
    ],
    freight: hasFreight(row) ? [
      {time:'2026-10-08 09:00', docType:'期初初始化', docNo:'期初-INIT', before:0, qty:initQty, amount:initFreight, after:prevFUnit},
      {time:inTime, docType:'海外上架', docNo:'FT-' + row.id + '-FT', before:prevFUnit, qty:lastQty, amount:lastFreight, after:fUnit}
    ] : []
  };
}

// 预计算「较上次变动」：取变更历史最后一条的前后单价
rows.forEach(r => {
  r.unitDelta = r.goodsDelta = r.freightDelta = null;
  r.unitPct = r.goodsPct = r.freightPct = null;
  if (r.type === '退货仓') return;
  const h = richHistories[r.id] || historyFor(r);
  const g = h.goods[h.goods.length - 1], f = h.freight[h.freight.length - 1];
  if (!g && !f) return;
  const gPrev = g ? g.before : 0, gAfter = g ? g.after : 0;
  const fPrev = f ? f.before : 0, fAfter = f ? f.after : 0;
  r.goodsDelta = +(gAfter - gPrev).toFixed(4);
  r.goodsPct = gPrev > 0 ? (gAfter - gPrev) / gPrev : null;
  r.freightDelta = +(fAfter - fPrev).toFixed(4);
  r.freightPct = fPrev > 0 ? (fAfter - fPrev) / fPrev : null;
  r.unitDelta = +(r.goodsDelta + r.freightDelta).toFixed(4);
  const unitPrev = gPrev + fPrev;
  r.unitPct = unitPrev > 0 ? r.unitDelta / unitPrev : null;
});

const split = v => String(v || '').toLowerCase().split(/[\s,，、;；\n]+/).filter(Boolean);
const match = (v, q) => { const s = String(v || '').toLowerCase(), a = split(q); return !a.length || a.some(x => s.includes(x)); };
// 日期值统一转 YYYY-MM-DD 字符串（兼容 Date 对象，vendor 的 value-format 不完全可靠）
const dstr = v => v instanceof Date ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}` : String(v || '');

createApp({
  setup() {
    const query = reactive({sku:'', skuType:'sku', product:'', warehouses:[], dateRange:[]});
    const applied = reactive({...query});
    const page = ref(1), pageSize = ref(10);
    const drawerVisible = ref(false), current = ref(null), historyRows = ref({goods:[], freight:[]}), historyTab = ref('goods'), historyDateRange = ref([]), historyDraft = ref([]);
    // 三个 tab 各自的分页状态
    const historyPage = reactive({unit:1, goods:1, freight:1});

    const warehouses = [...new Set(rows.map(r => r.warehouse))];

    const filteredRows = computed(() => rows.filter(r => {
      const start = applied.dateRange?.[0] ? dstr(applied.dateRange[0]) : '';
      const end = applied.dateRange?.[1] ? dstr(applied.dateRange[1]) : '';
      const dateOk = (!start || (r.lastInboundAt && r.lastInboundAt.slice(0, 10) >= start)) && (!end || (r.lastInboundAt && r.lastInboundAt.slice(0, 10) <= end));
      // SKU 类型下拉：SKU / 海外仓 SKU / FNSKU，按所选字段匹配
      const skuValue = applied.skuType === 'overseasSku' ? r.overseasSku
        : applied.skuType === 'fnsku' ? r.fnsku : r.sku;
      return match(skuValue, applied.sku)
        && match(r.product, applied.product)
        && (!applied.warehouses.length || applied.warehouses.includes(r.warehouse))
        && dateOk;
    }));

    // 三价格列排序：按数值（不是按涨跌）；退货仓无成本，升降序均置底
    const sortKey = ref(''), sortOrder = ref('');
    const priceOf = (row, key) => {
      if (row.type === '退货仓') return null;
      if (key === 'unit') return row.avgPrice + row.freightAvg;
      if (key === 'goods') return row.avgPrice;
      if (key === 'freight') return row.freightAvg;
      return null;
    };
    const sortedRows = computed(() => {
      if (!sortKey.value || !sortOrder.value) return filteredRows.value;
      const dir = sortOrder.value === 'ascending' ? 1 : -1;
      return filteredRows.value
        .map((row, index) => ({row, index}))
        .sort((left, right) => {
          const a = priceOf(left.row, sortKey.value), b = priceOf(right.row, sortKey.value);
          if (a == null && b == null) return left.index - right.index;
          if (a == null) return 1;
          if (b == null) return -1;
          if (a === b) return left.index - right.index;
          return (a - b) * dir;
        })
        .map(item => item.row);
    });
    // 三态切换：升序 → 降序 → 取消
    const toggleSort = key => {
      if (sortKey.value !== key) { sortKey.value = key; sortOrder.value = 'ascending'; }
      else if (sortOrder.value === 'ascending') { sortOrder.value = 'descending'; }
      else { sortKey.value = ''; sortOrder.value = ''; }
      page.value = 1;
    };

    const pageRows = computed(() => sortedRows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));

    // 按列表可视高度动态计算每页条数，先铺满第一页，剩余数据再分页
    const FIT_HEAD = 44, FIT_ROW = 38;
    const fitPageSize = () => {
      const wrap = document.querySelector('.ui-list-card .ui-table-wrap');
      if (!wrap) return;
      const size = Math.max(10, Math.floor((wrap.clientHeight - FIT_HEAD) / FIT_ROW));
      if (size !== pageSize.value) pageSize.value = size;
      const maxPage = Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value));
      if (page.value > maxPage) page.value = maxPage;
    };
    onMounted(() => {
      // 等首帧布局（卡片撑满视口）完成后再测量，避免拿到挂载瞬间的旧高度
      requestAnimationFrame(() => requestAnimationFrame(fitPageSize));
      window.addEventListener('resize', fitPageSize);
    });
    onUnmounted(() => window.removeEventListener('resize', fitPageSize));

    // 涨跌标签：↑ 涨 / ↓ 跌 / 无箭头持平；涨红跌绿
    const chgArrow = v => (v > 0 ? '↑' : v < 0 ? '↓' : '');
    const chgClass = v => (v > 0 ? 'chg-up' : v < 0 ? 'chg-down' : 'chg-flat');
    const chgText = (delta, pct) => {
      const amount = `${delta > 0 ? '+' : ''}${delta.toFixed(4)}`;
      const pctText = pct == null ? '—' : `${pct > 0 ? '+' : ''}${(pct * 100).toFixed(2)}%`;
      return `${chgArrow(delta)} ${amount} (${pctText})`.trim();
    };

    const fmtPrice = v => (v > 0 ? v.toFixed(4) : '—');

    const search = () => { Object.assign(applied, JSON.parse(JSON.stringify(query))); page.value = 1; ElementPlus.ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条`); };
    const reset = () => { Object.assign(query, {sku:'', skuType:'sku', product:'', warehouses:[], dateRange:[]}); search(); };
    const openHistory = row => { current.value = row; historyRows.value = richHistories[row.id] || historyFor(row); historyTab.value = 'unit'; historyDateRange.value = []; historyDraft.value = []; historyPage.unit = historyPage.goods = historyPage.freight = 1; drawerVisible.value = true; };
    const filterHist = rows => { const [s, e] = historyDateRange.value || []; const start = s ? dstr(s) : '', end = e ? dstr(e) : ''; if (!start && !end) return rows; return rows.filter(r => { const d = r.time.slice(0, 10); return (!start || d >= start) && (!end || d <= end); }); };
    // 按时间顺序累加本次入库数量，得到每条变动的「原库存数量」
    const withBeforeQty = list => {
      let qty = 0;
      return list.map(e => { const rec = {...e, beforeQty: qty}; qty += e.qty || 0; return rec; });
    };
    const goodsHistory = computed(() => filterHist(withBeforeQty(historyRows.value.goods)));
    const freightHistory = computed(() => filterHist(withBeforeQty(historyRows.value.freight)));
    // 单位成本（货物 + 头程）变更历史：把货物/头程事件按时间合并，逐条还原总额的前后值
    const unitHistory = computed(() => {
      const events = withBeforeQty(historyRows.value.goods).map(e => ({...e, kind: 'goods', kindLabel: '货物成本'}))
        .concat(withBeforeQty(historyRows.value.freight).map(e => ({...e, kind: 'freight', kindLabel: '头程成本'})))
        .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
      let curGoods = 0, curFreight = 0;
      const list = events.map(e => {
        const before = +(curGoods + curFreight).toFixed(4);
        if (e.kind === 'goods') curGoods = e.after; else curFreight = e.after;
        const after = +(curGoods + curFreight).toFixed(4);
        return {...e, before, after};
      });
      return filterHist(list);
    });
    // 变更历史分页：三个 tab 独立页码，每页 8 条
    const HISTORY_PAGE_SIZE = 8;
    const historySlice = (list, page) => list.slice((page - 1) * HISTORY_PAGE_SIZE, page * HISTORY_PAGE_SIZE);
    const pagedUnitHistory = computed(() => historySlice(unitHistory.value, historyPage.unit));
    const pagedGoodsHistory = computed(() => historySlice(goodsHistory.value, historyPage.goods));
    const pagedFreightHistory = computed(() => historySlice(freightHistory.value, historyPage.freight));
    const applyHistoryDate = () => {
      historyDateRange.value = historyDraft.value ? [...historyDraft.value] : [];
      historyPage.unit = historyPage.goods = historyPage.freight = 1;
    };
    const exportRows = () => {
      const data = sortedRows.value;
      const heads = ['仓库','SKU','海外仓 SKU/FNSKU','品名','当前移动加权平均价（未税）','移动货物成本加权（未税）','移动头程成本加权（未税）','最新入库/变更时间'];
      const csv = [heads, ...data.map(r => [whLabel(r.warehouse), r.sku, mappedSku(r), r.product, r.type === '退货仓' ? '' : (r.avgPrice + r.freightAvg).toFixed(4), r.type === '退货仓' ? '' : r.avgPrice.toFixed(4), r.type === '退货仓' ? '' : r.freightAvg.toFixed(4), r.lastInboundAt])]
        .map(a => a.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
      const url = URL.createObjectURL(new Blob(['\ufeff' + csv], {type:'text/csv'}));
      const a = document.createElement('a'); a.href = url; a.download = '移动加权平均价.csv'; a.click(); URL.revokeObjectURL(url);
      ElementPlus.ElMessage.success(`已导出 ${data.length} 条数据`);
    };

    return {query, warehouses, page, pageSize, filteredRows, sortedRows, pageRows, sortKey, sortOrder, toggleSort, drawerVisible, current, historyRows, historyTab, historyDateRange, historyDraft, historyPage, goodsHistory, freightHistory, unitHistory, pagedUnitHistory, pagedGoodsHistory, pagedFreightHistory, applyHistoryDate, fmtPrice, chgClass, chgText, whMeta, whLabel, mappedSku, hasFreight, search, reset, openHistory, exportRows};
  }
}).use(ElementPlus).mount('#app');