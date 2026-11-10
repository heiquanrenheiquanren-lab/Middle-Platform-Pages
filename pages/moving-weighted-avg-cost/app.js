const {createApp, reactive, ref, computed, onMounted, onUnmounted} = Vue;

// 统一金额/价格精度：四舍五入保留 2 位（先消掉二进制浮点尾巴，避免 41.355 被舍成 41.35）
const r2 = v => {
  const n = Number(v);
  if (!isFinite(n)) return 0;
  const sign = n < 0 ? -1 : 1;
  return sign * Math.round(Number((Math.abs(n) * 100).toFixed(6))) / 100;
};

// 仓库元数据：编码 + 属性。仅海外仓、平台仓涉及头程成本
const warehouseMeta = {
  '东莞2仓': {code:'DG02', attr:'自营仓'},
  'SZ01东莞仓': {code:'SZ01', attr:'平台仓'},
  '深圳采购仓': {code:'SZCG', attr:'供应商仓'},
  '跨越美国洛杉矶仓': {code:'KY-LAX-01', attr:'海外仓'}
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
  {id:9, sku:'010725', overseasSku:'US-010725', fnsku:'B0WM8960BM', product:'1套1件 WM8960 音频模块（带咪头版）', warehouse:'深圳采购仓', type:'良品仓', qty:60, amount:2586.00, freight:270.00, lastInboundAt:'2026-10-27 17:40'}
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
  const unit = r2(r2(t.amount / t.qty) + (n % 5) * 0.6);
  const amount = r2(qty * unit);
  const freight = r2(qty * r2(t.freight / t.qty));
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

const rows = [..._seed, ...extraList].map(r => ({...r, avgPrice: r.qty > 0 ? r2(r.amount / r.qty) : 0, freightAvg: r.qty > 0 ? r2(r.freight / r.qty) : 0}));
// 非海外仓/平台仓不产生头程成本，头程金额与加权价归零
rows.forEach(r => { if (!hasFreight(r)) { r.freight = 0; r.freightAvg = 0; } });
// 导入校验用：仓库编码档案、已维护映射的海外仓 SKU
const codeMeta = {};
Object.keys(warehouseMeta).forEach(name => { codeMeta[warehouseMeta[name].code] = { name, attr: warehouseMeta[name].attr }; });
const overseasSkuSet = new Set(rows.map(r => r.overseasSku).filter(v => v && v !== '—'));

// 部分行展示完整单据链：货物成本（期初初始化/采购入库/采购收货）与头程成本（期初/海外上架）
const richHistories = {
  1: {
    goods: [
      {time:'2026-10-08 09:00', docType:'期初初始化', docNo:'期初-INIT-010724', before:0, qty:100, amount:4000.00, after:40.00},
      {time:'2026-10-28 11:20', docType:'采购收货', docNo:'PO26102800341', before:40.00, qty:20, amount:963.20, after:41.36}
    ],
    freight: [
      {time:'2026-10-08 09:00', docType:'期初初始化', docNo:'期初-INIT-010724', before:0, qty:100, amount:400.00, after:4.00},
      {time:'2026-10-30 09:26', docType:'海外上架', docNo:'FT26103000072', before:4.00, qty:20, amount:128.00, after:4.40}
    ]
  },
  6: {
    goods: [
      {time:'2026-10-09 08:30', docType:'期初初始化', docNo:'期初-INIT-KBAB', before:0, qty:280, amount:24640.00, after:88.00},
      {time:'2026-10-20 15:45', docType:'采购入库', docNo:'RK26102000112', before:88.00, qty:40, amount:2880.00, after:86.00}
    ],
    freight: [
      {time:'2026-10-09 08:30', docType:'期初初始化', docNo:'期初-INIT-KBAB', before:0, qty:280, amount:2240.00, after:8.00},
      {time:'2026-10-28 13:15', docType:'海外上架', docNo:'FT26102800120', before:8.00, qty:40, amount:640.00, after:9.00}
    ]
  }
};
// 无头程成本的仓库，其历史里的头程记录不成立，统一清空
rows.forEach(r => { if (richHistories[r.id] && !hasFreight(r)) richHistories[r.id] = {goods: richHistories[r.id].goods, freight: []}; });

function historyFor(row) {
  const unit = row.avgPrice || 0, fUnit = row.freightAvg || 0;
  const initQty = Math.round(row.qty * 0.6);
  const lastQty = row.qty - initQty;
  // 让每个 SKU 最近一次入库都有确定性的涨跌（货物 ±5%、头程 ±4%）
  const gRate = (((row.id * 37) % 11) - 5) / 100;
  const fRate = (((row.id * 53) % 9) - 4) / 100;
  const prevUnit = r2(unit * (1 - gRate));
  const prevFUnit = r2(fUnit * (1 - fRate));
  const initAmount = r2(initQty * prevUnit);
  const lastAmount = r2(row.amount - initAmount);
  const initFreight = r2(initQty * prevFUnit);
  const lastFreight = r2(row.freight - initFreight);
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
  const h = richHistories[r.id] || historyFor(r);
  const g = h.goods[h.goods.length - 1], f = h.freight[h.freight.length - 1];
  if (!g && !f) return;
  const gPrev = g ? g.before : 0, gAfter = g ? g.after : 0;
  const fPrev = f ? f.before : 0, fAfter = f ? f.after : 0;
  r.goodsDelta = r2(gAfter - gPrev);
  r.goodsPct = gPrev > 0 ? (gAfter - gPrev) / gPrev : null;
  r.freightDelta = r2(fAfter - fPrev);
  r.freightPct = fPrev > 0 ? (fAfter - fPrev) / fPrev : null;
  r.unitDelta = r2(r.goodsDelta + r.freightDelta);
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

    // 三价格列排序：按数值（不是按涨跌）
    const sortKey = ref(''), sortOrder = ref('');
    const priceOf = (row, key) => {
      if (key === 'unit') return r2(row.avgPrice + row.freightAvg);
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
      const amount = `${delta > 0 ? '+' : ''}${r2(delta).toFixed(2)}`;
      const pctText = pct == null ? '—' : `${pct > 0 ? '+' : ''}${(pct * 100).toFixed(2)}%`;
      return `${chgArrow(delta)} ${amount} (${pctText})`.trim();
    };

    const fmtPrice = v => (v > 0 ? r2(v).toFixed(2) : '—');

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
        const before = r2(curGoods + curFreight);
        if (e.kind === 'goods') curGoods = e.after; else curFreight = e.after;
        const after = r2(curGoods + curFreight);
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
    const TEMPLATE_URL = 'https://www.kdocs.cn/l/caigDqifgmQq';
    // 解析 CSV，兼容引号包裹与 BOM
    const parseCsv = text => {
      const rows = [];
      let row = [], cell = '', quoted = false;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quoted) {
          if (ch === '"') {
            if (text[i + 1] === '"') { cell += '"'; i++; }
            else quoted = false;
          } else cell += ch;
        } else if (ch === '"') quoted = true;
        else if (ch === ',') { row.push(cell); cell = ''; }
        else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
        else if (ch !== '\r') cell += ch;
      }
      if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
      return rows.filter(r => r.some(v => String(v).trim() !== ''));
    };
    // 读取导入文件：xlsx/xls 用本地解析库，csv 走文本解析
    const readFlowTable = file => {
      const name = String(file.name || '').toLowerCase();
      if (/\.(xlsx|xls)$/.test(name)) {
        if (typeof XLSX === 'undefined') return Promise.reject(new Error('Excel 解析组件未加载，请刷新页面后重试'));
        return file.arrayBuffer().then(buffer => {
          const workbook = XLSX.read(buffer, {type: 'array'});
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          return XLSX.utils.sheet_to_json(sheet, {header: 1, raw: false, defval: ''}).map(row => row.map(cell => String(cell == null ? '' : cell)));
        });
      }
      return file.text().then(text => parseCsv(String(text).replace(/^\ufeff/, '')));
    };
    // 导入前预览：解析文件、校验必填与数值，返回表头和前若干行
    let flowPreviewCache = null;
    const parseFlowPreview = file => readFlowTable(file).then(table => {
      if (!table.length) throw new Error('文件内容为空，请使用模板填写后再导入');
      const headers = table[0].map(h => String(h).trim());
      // 模板第 2 行为填写说明，导入时跳过
      const data = table.slice(1).filter(r => !r.some(v => /^【(必填|选填)】/.test(String(v).trim())));
      const col = names => {
        const list = Array.isArray(names) ? names : [names];
        return headers.findIndex(h => list.includes(h.replace(/\*/g, '').trim()));
      };
      const iCode = col('仓库编码'), iWarehouse = col(['仓库', '仓库名称']), iSku = col(['SKU', '海外仓 SKU']),
        iDoc = col('中台发货单号'), iOverseasDoc = col(['海外仓后台单据号', '海外仓后台操作单据号']),
        iTime = col(['入库时间', '本次入库时间']),
        iBefore = col(['原在库数量', '本次入库前的原在库数量']), iQty = col(['入库数量', '本次入库数量']);
      if ([iCode, iWarehouse, iSku, iDoc, iOverseasDoc, iTime, iBefore, iQty].some(i => i < 0)) throw new Error('模板表头不完整，请使用最新模板');
      const errors = [];
      const parseTime = value => {
        const text = String(value || '').trim();
        if (!text) return null;
        const date = new Date(text.replace(/-/g, '/'));
        return Number.isNaN(date.getTime()) ? null : date;
      };
      const previewRows = data.map((r, n) => {
        const line = n + 3;
        const code = String(r[iCode] || '').trim();
        const warehouse = String(r[iWarehouse] || '').trim();
        const sku = String(r[iSku] || '').trim();
        const doc = String(r[iDoc] || '').trim();
        const overseasDoc = String(r[iOverseasDoc] || '').trim();
        const time = String(r[iTime] || '').trim();
        const timeDate = parseTime(time);
        const beforeText = String(r[iBefore] || '').trim();
        const qtyText = String(r[iQty] || '').trim();
        const before = Number(beforeText), qty = Number(qtyText);
        if (!code) errors.push(`第 ${line} 行：仓库编码必填`);
        else if (!codeMeta[code]) errors.push(`第 ${line} 行：仓库编码不存在`);
        else if (codeMeta[code].attr !== '海外仓') errors.push(`第 ${line} 行：该仓库不是海外仓，不能导入上架流水`);
        if (!warehouse) errors.push(`第 ${line} 行：仓库名称必填`);
        if (!sku) errors.push(`第 ${line} 行：海外仓 SKU 必填`);
        else if (!overseasSkuSet.has(sku)) errors.push(`第 ${line} 行：海外仓 SKU 未维护映射`);
        if (!doc) errors.push(`第 ${line} 行：中台发货单号必填`);
        if (!overseasDoc) errors.push(`第 ${line} 行：海外仓后台操作单据号必填`);
        if (!time) errors.push(`第 ${line} 行：本次入库时间必填`);
        else if (!timeDate) errors.push(`第 ${line} 行：本次入库时间格式应为 YYYY-MM-DD HH:mm`);
        if (!beforeText || !Number.isFinite(before) || before < 0) errors.push(`第 ${line} 行：本次入库前的原在库数量需为不小于 0 的数字`);
        if (!qtyText || !Number.isFinite(qty) || qty <= 0) errors.push(`第 ${line} 行：本次入库数量需为大于 0 的数字`);
        return [code, warehouse, sku, '头程入库', doc, overseasDoc, time, beforeText, qtyText];
      });
      const result = {
        columns: ['仓库编码', '仓库名称', '海外仓 SKU', '入库类型', '中台发货单号', '海外仓后台操作单据号', '本次入库时间', '本次入库前的原在库数量', '本次入库数量'],
        rows: previewRows,
        total: data.length,
        errors
      };
      flowPreviewCache = result;
      return result;
    });
    const escHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));
    const pad2 = value => String(value).padStart(2, '0');
    const nowText = () => {
      const date = new Date();
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    };
    const flowRecords = [
      { batch: 'PB20261110093201', file: '海外仓上架流水_1101-1107.xlsx', user: '张三', time: '2026-11-10 09:32', total: 42, added: 38, overwritten: 4, failed: 0, status: '成功', failures: [] },
      { batch: 'PB20261109170502', file: '海外仓上架流水_1025-1031.xlsx', user: '李四', time: '2026-11-09 17:05', total: 36, added: 31, overwritten: 3, failed: 2, status: '部分失败', failures: [
        { line: 8, sku: 'KBAB0057-009', doc: 'FH26102800120', reason: '本次入库时间早于上线日' },
        { line: 21, sku: 'XJ0058-03', doc: 'FH26103000072', reason: '海外仓 SKU 未维护映射' }
      ] },
      { batch: 'PB20261108112003', file: '海外仓上架流水_1018-1024.xlsx', user: '王五', time: '2026-11-08 11:20', total: 20, added: 20, overwritten: 0, failed: 0, status: '成功', failures: [] }
    ];
    const openImport = () => {
      const mask = document.createElement('div');
      mask.className = 'ui-dialog-mask';
      mask.innerHTML = `
        <section class="ui-dialog ui-dialog--import ui-dialog--import-preview" role="dialog" aria-modal="true" aria-label="导入海外仓上架流水">
          <header class="ui-dialog__header ui-import__header">
            <div><h2>导入海外仓上架流水</h2><p class="ui-import__subtitle">导入记录的入库类型统一为头程入库 · 支持 .xlsx</p></div>
            <button class="ui-dialog__close" type="button" data-close aria-label="关闭">×</button>
          </header>
          <div class="ui-import__tabs"><div class="ui-tabs"><button type="button" class="is-active" data-tab="import">导入</button><button type="button" data-tab="records">导入记录</button></div></div>
          <div class="ui-dialog__body ui-import__body">
            <div data-panel="import"><div data-flow-body></div></div>
            <div data-panel="records" hidden></div>
          </div>
          <footer class="ui-dialog__footer ui-import__footer" data-flow-footer></footer>
          <footer class="ui-dialog__footer ui-import__footer" data-records-footer hidden>
            <span class="ui-import__summary" data-records-summary></span>
            <div><button class="ui-button" type="button" data-close>关闭</button></div>
          </footer>
        </section>`;
      document.body.appendChild(mask);
      const close = () => mask.remove();
      mask.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', close));
      mask.addEventListener('click', event => { if (event.target === mask) close(); });

      const flow = UIKit.createImportFlow({
        title: '导入海外仓上架流水',
        subtitle: '导入记录的入库类型统一为头程入库 · 支持 .xlsx',
        intro: '用于未对接接口的海外仓：导入上架流水，补录上架前的原在库数量和本次入库数量，系统据此重算移动加权平均价。导入记录的入库类型统一为「头程入库」，不处理出库流水。',
        guideTitle: '第一步：下载并填写上架流水模板',
        guideText: '入库类型统一为头程入库。重复导入将覆盖原记录。请按模板填写后上传 .xlsx。',
        accepted: '.xlsx,.xls',
        downloadLabel: '下载模板',
        onDownload: () => window.open(TEMPLATE_URL, '_blank'),
        parsePreview: parseFlowPreview,
        onConfirm: (file, done) => {
          const preview = flowPreviewCache || { total: 0 };
          flowRecords.unshift({
            batch: 'PB' + nowText().replace(/[-: ]/g, ''),
            file: file.name,
            user: 'Admin',
            time: nowText(),
            total: preview.total || 0,
            added: preview.total || 0,
            overwritten: 0,
            failed: 0,
            status: '成功',
            failures: []
          });
          done();
          ElementPlus.ElMessage.success(`已导入 ${file.name}，系统将按原在库数量与入库数量重算移动加权价`);
        }
      });
      flow.mount(mask.querySelector('[data-flow-body]'), mask.querySelector('[data-flow-footer]'), { onClose: close });

      const importPanel = mask.querySelector('[data-panel="import"]');
      const recordsPanel = mask.querySelector('[data-panel="records"]');
      const flowFooter = mask.querySelector('[data-flow-footer]');
      const recordsFooter = mask.querySelector('[data-records-footer]');
      const recordsSummary = mask.querySelector('[data-records-summary]');
      let failureBatch = null;

      const recordRow = record => `
        <tr>
          <td>${escHtml(record.file)}</td>
          <td>${escHtml(record.user)}</td>
          <td>${escHtml(record.time)}</td>
          <td>${record.total}</td>
          <td>${record.added}</td>
          <td>${record.overwritten}</td>
          <td>${record.failed}</td>
          <td><span class="ui-status-tag ${record.status === '成功' ? 'ui-status-tag--regular' : 'ui-status-tag--clearance'}">${escHtml(record.status)}</span></td>
          <td><span class="import-records-actions">${record.failed ? `<button class="ui-text-action" type="button" data-fail="${escHtml(record.batch)}">查看失败明细</button><button class="ui-text-action" type="button" data-download="${escHtml(record.batch)}">下载源文件</button>` : '<span class="import-records-empty">—</span>'}</span></td>
        </tr>`;

      const renderRecords = () => {
        const detail = failureBatch ? flowRecords.find(item => item.batch === failureBatch) : null;
        if (detail) {
          recordsPanel.innerHTML = `
            <div class="ui-import__preview import-records">
              <div class="ui-import__preview-head">
                <div class="ui-import__card-title"><span class="ui-import__bar"></span>失败明细 · ${escHtml(detail.file)}</div>
                <button class="ui-text-action" type="button" data-back>返回导入记录</button>
              </div>
              <div class="ui-import__preview-scroll"><table class="ui-import__preview-table import-records-table"><thead><tr><th>行号</th><th>海外仓 SKU</th><th>中台发货单号</th><th>失败原因</th></tr></thead><tbody>${detail.failures.map(item => `<tr><td>${item.line}</td><td>${escHtml(item.sku)}</td><td>${escHtml(item.doc)}</td><td>${escHtml(item.reason)}</td></tr>`).join('')}</tbody></table></div>
            </div>`;
          return;
        }
        recordsPanel.innerHTML = `
          <div class="ui-import__preview import-records">
            <div class="ui-import__preview-head">
              <div class="ui-import__card-title"><span class="ui-import__bar"></span>导入记录</div>
              <span class="ui-import__preview-meta">共 ${flowRecords.length} 条</span>
            </div>
            <div class="ui-import__preview-scroll"><table class="ui-import__preview-table import-records-table"><thead><tr><th>文件名</th><th>操作人</th><th>导入时间</th><th>行数</th><th>新增</th><th>覆盖</th><th>失败</th><th>状态</th><th>操作</th></tr></thead><tbody>${flowRecords.map(recordRow).join('')}</tbody></table></div>
          </div>`;
      };

      recordsPanel.addEventListener('click', event => {
        const back = event.target.closest('[data-back]');
        if (back) { failureBatch = null; renderRecords(); return; }
        const fail = event.target.closest('[data-fail]');
        if (fail) { failureBatch = fail.getAttribute('data-fail'); renderRecords(); return; }
        if (event.target.closest('[data-download]')) ElementPlus.ElMessage.success('已下载源文件');
      });

      const tabs = [...mask.querySelectorAll('[data-tab]')];
      const setTab = name => {
        tabs.forEach(tab => tab.classList.toggle('is-active', tab.getAttribute('data-tab') === name));
        importPanel.hidden = name !== 'import';
        recordsPanel.hidden = name !== 'records';
        flowFooter.hidden = name !== 'import';
        recordsFooter.hidden = name !== 'records';
        recordsSummary.textContent = `共 ${flowRecords.length} 条导入记录`;
        if (name === 'records') { failureBatch = null; renderRecords(); }
      };
      tabs.forEach(tab => tab.addEventListener('click', () => setTab(tab.getAttribute('data-tab'))));
      setTab('import');
    };

    const exportRows = () => {
      const data = sortedRows.value;
      const heads = ['仓库','SKU','海外仓 SKU/FNSKU','品名','当前移动加权平均价（未税）','移动货物成本加权（未税）','移动头程成本加权（未税）','最新入库/变更时间'];
      const csv = [heads, ...data.map(r => [whLabel(r.warehouse), r.sku, mappedSku(r), r.product, r2(r.avgPrice + r.freightAvg).toFixed(2), r.avgPrice.toFixed(2), r.freightAvg.toFixed(2), r.lastInboundAt])]
        .map(a => a.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
      const url = URL.createObjectURL(new Blob(['\ufeff' + csv], {type:'text/csv'}));
      const a = document.createElement('a'); a.href = url; a.download = '移动加权价.csv'; a.click(); URL.revokeObjectURL(url);
      ElementPlus.ElMessage.success(`已导出 ${data.length} 条数据`);
    };

    return {query, warehouses, page, pageSize, filteredRows, sortedRows, pageRows, sortKey, sortOrder, toggleSort, drawerVisible, current, historyRows, historyTab, historyDateRange, historyDraft, historyPage, goodsHistory, freightHistory, unitHistory, pagedUnitHistory, pagedGoodsHistory, pagedFreightHistory, applyHistoryDate, fmtPrice, chgClass, chgText, whMeta, whLabel, mappedSku, hasFreight, search, reset, openHistory, openImport, exportRows};
  }
}).use(ElementPlus).mount('#app');